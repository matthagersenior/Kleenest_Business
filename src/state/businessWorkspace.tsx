import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  getBusinessDashboardSummary,
  getBusinessManagementContext,
  getBusinessProductAccess,
  getBusinessServiceEntitlement,
  getCurrentSession,
  listBusinessWorkspaces,
  type BusinessProductAccess,
  type BusinessWorkspace,
} from '@/services/business';

type WorkspaceState = {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  workspace: BusinessWorkspace | null;
  workspaces: BusinessWorkspace[];
  access: BusinessProductAccess | null;
  entitlement: Record<string, unknown> | null;
  management: Record<string, unknown> | null;
  dashboard: Record<string, unknown> | null;
  refresh: () => Promise<void>;
  selectWorkspace: (businessId: string) => Promise<void>;
};

const BusinessWorkspaceContext = createContext<WorkspaceState | null>(null);

async function loadWorkspaceData(workspace: BusinessWorkspace) {
  const [access, entitlement, management, dashboard] = await Promise.all([
    getBusinessProductAccess(workspace.business_id),
    getBusinessServiceEntitlement(workspace.business_id),
    getBusinessManagementContext(workspace.business_id),
    getBusinessDashboardSummary(workspace.business_id),
  ]);
  return { access, entitlement, management, dashboard };
}

export function BusinessWorkspaceProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<BusinessWorkspace[]>([]);
  const [workspace, setWorkspace] = useState<BusinessWorkspace | null>(null);
  const [access, setAccess] = useState<BusinessProductAccess | null>(null);
  const [entitlement, setEntitlement] = useState<Record<string, unknown> | null>(null);
  const [management, setManagement] = useState<Record<string, unknown> | null>(null);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);

  const hydrate = useCallback(async (preferredBusinessId?: string) => {
    setError(null);
    const session = await getCurrentSession();
    if (!session) {
      setWorkspaces([]);
      setWorkspace(null);
      setAccess(null);
      setEntitlement(null);
      setManagement(null);
      setDashboard(null);
      throw new Error('Sign in with a Business-authorized Kleenest account to continue.');
    }

    // The server only includes demo workspaces here for verified platform-owner sessions.
    // Regular Business users still receive only their own memberships.
    const nextWorkspaces = await listBusinessWorkspaces(true);
    if (!nextWorkspaces.length) {
      setWorkspaces([]);
      setWorkspace(null);
      throw new Error('This account does not have an active Business workspace.');
    }

    const nextWorkspace =
      nextWorkspaces.find((candidate) => candidate.business_id === preferredBusinessId) ??
      nextWorkspaces[0];
    const detail = await loadWorkspaceData(nextWorkspace);
    setWorkspaces(nextWorkspaces);
    setWorkspace(nextWorkspace);
    setAccess(detail.access);
    setEntitlement(detail.entitlement);
    setManagement(detail.management);
    setDashboard(detail.dashboard);
  }, []);

  useEffect(() => {
    hydrate()
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false));
  }, [hydrate]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await hydrate(workspace?.business_id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRefreshing(false);
    }
  }, [hydrate, workspace?.business_id]);

  const selectWorkspace = useCallback(
    async (businessId: string) => {
      setRefreshing(true);
      try {
        await hydrate(businessId);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        setRefreshing(false);
      }
    },
    [hydrate],
  );

  const value = useMemo(
    () => ({
      loading,
      refreshing,
      error,
      workspace,
      workspaces,
      access,
      entitlement,
      management,
      dashboard,
      refresh,
      selectWorkspace,
    }),
    [loading, refreshing, error, workspace, workspaces, access, entitlement, management, dashboard, refresh, selectWorkspace],
  );

  return <BusinessWorkspaceContext.Provider value={value}>{children}</BusinessWorkspaceContext.Provider>;
}

export function useBusinessWorkspace() {
  const value = useContext(BusinessWorkspaceContext);
  if (!value) throw new Error('useBusinessWorkspace must be used within BusinessWorkspaceProvider.');
  return value;
}
