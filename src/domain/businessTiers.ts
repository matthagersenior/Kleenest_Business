import type { BusinessProductAccess } from '@/services/business';

export type BusinessTierCapabilities={
  standard:boolean;
  growth:boolean;
  enterprise:boolean;
  coreManagement:boolean;
  qr:boolean;
  reviews:boolean;
  communications:boolean;
  trustOperations:boolean;
  preventiveOperations:boolean;
  advancedEngagement:boolean;
  intelligence:boolean;
  reporting:boolean;
  enterpriseNetworks:boolean;
};

function serviceTier(entitlement:Record<string,unknown>|null|undefined){return String(entitlement?.service_tier??'').toLowerCase();}

export function getBusinessTierCapabilities(access:BusinessProductAccess|null|undefined,entitlement?:Record<string,unknown>|null):BusinessTierCapabilities{
  const plan=String(access?.plan??'standard').toLowerCase();
  const service=serviceTier(entitlement);
  const enterprise=Boolean(access?.enterprise_enabled)||plan==='enterprise'||service==='enterprise';
  const growth=enterprise||plan==='growth'||service==='growth';
  return{
    standard:Boolean(access),
    growth,
    enterprise,
    coreManagement:Boolean(access),
    qr:Boolean(access),
    reviews:Boolean(access),
    communications:Boolean(access),
    trustOperations:Boolean(access),
    preventiveOperations:Boolean(access),
    advancedEngagement:growth,
    intelligence:growth,
    reporting:growth,
    enterpriseNetworks:enterprise,
  };
}

export function tierLabel(access:BusinessProductAccess|null|undefined,entitlement?:Record<string,unknown>|null){
  const c=getBusinessTierCapabilities(access,entitlement);
  if(c.enterprise)return 'Enterprise';
  if(c.growth)return 'Growth';
  return 'Standard';
}
