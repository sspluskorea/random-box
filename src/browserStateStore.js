import {inputTreeError,uniqueRecordIds} from './securityModel.js';
const money=n=>Number.isSafeInteger(Number(n))&&Number(n)>=0;
export function storedStateError(s){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 if(!s||s.version!==2||!s.wallet||!money(s.wallet.paid)||!money(s.wallet.bonus)||s.wallet.cash!=null&&!money(s.wallet.cash))return '저장된 잔액 또는 데이터 형식이 올바르지 않습니다.';
 for(const key of ['boxes','products','members','inventory','charges','openings','orders','refunds','ledger','logs'])if(!Array.isArray(s[key])||!uniqueRecordIds(s[key]))return '저장된 목록에 누락되거나 중복된 등록 번호가 있습니다.';
 if(s.products.some(p=>!money(p.stock)||!money(p.value))||s.boxes.some(b=>!money(b.price)||!money(b.left)))return '저장된 상품 가격이나 재고가 올바르지 않습니다.';
 if(!object(s.content)||!object(s.settings))return '저장된 설정을 읽을 수 없습니다.';
 if(s.revision!=null&&(!Number.isSafeInteger(s.revision)||s.revision<0))return '저장된 변경 버전을 확인해 주세요.';
 for(const key of ['notices','terms','events','faq','community','trade','trades','banners','notifications','pointshop','coupons','inquiries','posts','attendance','gifts','subscriptions','passPlans','cart','wishlist'])if(s.content[key]!=null&&(!Array.isArray(s.content[key])||s.content[key].some(r=>!object(r))))return '저장된 콘텐츠 목록 형식이 올바르지 않습니다.';
 if(s.session!=null&&!object(s.session)||s.members.some(m=>!money(m.points??0)||!money(m.cash??0)||m.wallet&&(!object(m.wallet)||!money(m.wallet.paid)||!money(m.wallet.bonus)||!money(m.wallet.cash??0))))return '저장된 회원 정보 형식이 올바르지 않습니다.';
 for(const key of ['substitutions','securityHistory','conversions','lastResults'])if(s[key]!=null&&(!Array.isArray(s[key])||s[key].some(r=>!object(r))))return '저장된 처리 내역 형식이 올바르지 않습니다.';
 if(s.platform!=null){const p=s.platform;if(!object(p)||!object(p.settings)||Object.values(p.settings).some(v=>!Number.isFinite(Number(v))))return '저장된 보상 설정 형식이 올바르지 않습니다.';for(const key of ['campaigns','pityClaims','rewardGrants','adjustments','referrals','burningTickets','boxTickets','settlements','probabilityHistory','requests','rewardCategories','rewardSettingsHistory'])if(p[key]!=null&&(!Array.isArray(p[key])||p[key].some(r=>!object(r))))return '저장된 보상 내역 형식이 올바르지 않습니다.';
  if(p.rewardRules!=null&&(!object(p.rewardRules)||['A','B','C','D','E'].some(g=>!object(p.rewardRules[g]))||Object.entries(p.rewardRules).some(([g,r])=>!['A','B','C','D','E'].includes(g)||!object(r)||typeof r.enabled!=='boolean'||!money(r.threshold)||Number(r.threshold)<=0)))return '저장된 천장 규칙을 확인해 주세요.';
  if(p.rewardCategories?.some(c=>!object(c)||typeof c.id!=='string'||typeof c.name!=='string'||typeof c.enabled!=='boolean')||p.rewardCategories&&!uniqueRecordIds(p.rewardCategories))return '저장된 보상 종류를 확인해 주세요.';
  if(p.rewardMappings!=null&&(!object(p.rewardMappings)||Object.entries(p.rewardMappings).some(([g,m])=>!['A','B','C','D','E'].includes(g)||!object(m)||Object.values(m).some(id=>typeof id!=='string'))))return '저장된 보상 상품 지정을 확인해 주세요.';
  if(p.pityCycles!=null&&(!object(p.pityCycles)||Object.values(p.pityCycles).some(c=>!object(c)||Object.values(c).some(r=>!object(r)||!money(r.threshold)||Number(r.threshold)<=0))))return '저장된 회원별 보상 기준을 확인해 주세요.';
 }
 if(s.settings.chargeOptions!=null&&(!Array.isArray(s.settings.chargeOptions)||s.settings.chargeOptions.some(v=>!money(v)||Number(v)<=0))||s.settings.seller!=null&&!object(s.settings.seller))return '저장된 충전·사업자 설정을 확인해 주세요.';
 if(s.settings.security!=null){const sec=s.settings.security;if(!object(sec)||typeof sec.strictConsents!=='boolean'||!object(sec.thirdParty)||typeof sec.thirdParty.enabled!=='boolean'||['recipient','purpose','items','retention'].some(k=>typeof sec.thirdParty[k]!=='string')||typeof sec.pointValidityText!=='string')return '저장된 동의 설정을 확인해 주세요.';}
 return inputTreeError(s);
}
export function inspectStorage(storage,key,load){try{const raw=storage.getItem(key);if(raw==null)return {ok:true,raw:null,state:null};if(raw.length>8*1024*1024)return {ok:false,error:'저장된 데이터가 너무 큽니다. 원본을 보존한 상태로 확인이 필요합니다.'};const parsed=JSON.parse(raw),error=storedStateError(parsed);if(error)return {ok:false,error};return {ok:true,raw,state:load({getItem:()=>raw})};}catch{return {ok:false,error:'저장된 데이터를 읽지 못했습니다. 원본은 변경하지 않았습니다.'};}}
export function commitBrowserAction(storage,key,current,action,transition,load){
 const observed=inspectStorage(storage,key,load);if(!observed.ok)return observed;
 if(observed.state&&Number(observed.state.revision||0)!==Number(current.revision||0))return {ok:false,error:'다른 탭에서 변경된 내용을 먼저 반영했습니다. 확인 후 다시 진행해 주세요.',refreshState:observed.state};
 const result=transition(current,action);if(!result.ok)return result;
 // A failed storage write must not update the visible wallet or inventory.
 result.state.revision=Number(current.revision||0)+1;
 let serialized;try{serialized=JSON.stringify(result.state);if(serialized.length>8*1024*1024)return {ok:false,error:'저장 공간이 부족합니다. 등록할 이미지 수나 크기를 줄여 주세요.'};if(storage.getItem(key)!==observed.raw)return {ok:false,error:'다른 탭에서 데이터가 변경되었습니다. 새로 확인한 뒤 다시 진행해 주세요.'};storage.setItem(key,serialized);}catch{return {ok:false,error:'변경 내용을 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인해 주세요. 잔액과 상품은 변경하지 않았습니다.'};}
 return result;
}
