import type { BusinessProductAccess } from '@/services/business';

export type BusinessTierCapabilities={
  standard:boolean;
  growth:boolean;
  fleet:boolean;
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
function serviceFlag(entitlement:Record<string,unknown>|null|undefined,key:string){return Boolean(entitlement?.[key]);}

export function getBusinessTierCapabilities(access:BusinessProductAccess|null|undefined,entitlement?:Record<string,unknown>|null):BusinessTierCapabilities{
  const plan=String(access?.plan??'standard').toLowerCase();
  const service=serviceTier(entitlement);
  const enterprise=Boolean(access?.enterprise_enabled)||plan==='enterprise'||service==='enterprise'||serviceFlag(entitlement,'enterprise_fleet_enabled');
  const fleet=enterprise||Boolean(access?.fleet_enabled)||plan==='fleet'||service==='fleet'||serviceFlag(entitlement,'fleet_enabled');
  const growth=enterprise||plan==='growth'||service==='growth';
  return{
    standard:Boolean(access),
    growth,
    fleet,
    enterprise,
    coreManagement:Boolean(access),
    qr:Boolean(access),
    reviews:Boolean(access),
    communications:Boolean(access),
    trustOperations:Boolean(access),
    preventiveOperations:Boolean(access),
    advancedEngagement:growth||enterprise,
    intelligence:growth||fleet||enterprise,
    reporting:growth||fleet||enterprise,
    enterpriseNetworks:enterprise,
  };
}

export function tierLabel(access:BusinessProductAccess|null|undefined,entitlement?:Record<string,unknown>|null){
  const c=getBusinessTierCapabilities(access,entitlement);
  if(c.enterprise)return 'Enterprise';
  if(c.fleet)return 'Fleet';
  if(c.growth)return 'Growth';
  return 'Standard';
}
