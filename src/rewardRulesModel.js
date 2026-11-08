export const rewardGrades=['A','B','C','D','E'];
const validAmount=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
export function ensureRewardRules(s){
 const p=s.platform;
 p.rewardRules??=Object.fromEntries(rewardGrades.map(g=>[g,{enabled:['A','B'].includes(g),threshold:Number(p.settings['pity'+g]||1000000)}]));
 p.rewardCategories??=[{id:'men',name:'남성 명품',enabled:true},{id:'women',name:'여성 명품',enabled:true},{id:'appliance',name:'가전제품',enabled:true}];
 if(!p.rewardMappings){p.rewardMappings={};for(const g of rewardGrades){p.rewardMappings[g]={};for(const c of p.rewardCategories){const product=s.products.find(v=>v.rewardOnly&&v.grade===g&&v.rewardCategory===c.id&&v.stock>0&&!['비활성','판매 중지','삭제'].includes(v.status));if(product)p.rewardMappings[g][c.id]=product.id;}}}
 p.rewardSettingsHistory??=[];
}
export function rewardProductReferencesValid(s,products){
 const categories=s.platform?.rewardCategories||[];
 const validCategories=products.every(p=>{const old=s.products.find(v=>v.id===p.id),category=categories.find(c=>c.id===p.rewardCategory);if(p.rewardOnly&&!p.rewardCategory)return false;if(!p.rewardCategory)return true;return !!category&&(category.enabled||old?.rewardCategory===p.rewardCategory);});
 return validCategories&&Object.entries(s.platform?.rewardMappings||{}).every(([g,mappings])=>Object.entries(mappings).every(([categoryId,id])=>!id||products.some(p=>p.id===id&&p.grade===g&&p.rewardOnly&&p.rewardCategory===categoryId)));
}
export function rewardRulesAction(s,a,now){
 if(!['SAVE_REWARD_RULES','SAVE_REWARD_CATEGORY','SAVE_REWARD_MAPPING'].includes(a.type))return null;
 if(!String(a.reason||'').trim())return {error:'변경 사유를 입력해 주세요.'};
 const p=s.platform,before=structuredClone({rules:p.rewardRules,categories:p.rewardCategories,mappings:p.rewardMappings});
 if(a.type==='SAVE_REWARD_RULES'){
  if(!a.rules||Object.keys(a.rules).some(g=>!rewardGrades.includes(g))||rewardGrades.some(g=>!a.rules[g]||typeof a.rules[g].enabled!=='boolean'||!validAmount(a.rules[g].threshold)))return {error:'A~E 등급별 활성 여부와 양의 정수 기준금액을 확인해 주세요.'};
  p.rewardRules=Object.fromEntries(rewardGrades.map(g=>[g,{enabled:a.rules[g].enabled,threshold:Number(a.rules[g].threshold)}]));p.settings.pityA=p.rewardRules.A.threshold;p.settings.pityB=p.rewardRules.B.threshold;
 }
 if(a.type==='SAVE_REWARD_CATEGORY'){
  const c=a.category||{},name=String(c.name||'').trim(),id=c.id||'category-'+crypto.randomUUID();
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!name||name.length>60||typeof c.enabled!=='boolean'||p.rewardCategories.some(v=>v.id!==id&&v.name===name))return {error:'중복되지 않는 카테고리 이름과 활성 여부를 확인해 주세요.'};
  p.rewardCategories=[...p.rewardCategories.filter(v=>v.id!==id),{id,name,enabled:c.enabled}];
 }
 if(a.type==='SAVE_REWARD_MAPPING'){
  if(!rewardGrades.includes(a.grade)||!p.rewardCategories.some(c=>c.id===a.categoryId&&(!a.productId||c.enabled)))return {error:'보상 등급과 활성 카테고리를 확인해 주세요.'};
  if(a.productId&&!s.products.some(v=>v.id===a.productId&&v.rewardOnly&&v.grade===a.grade&&v.rewardCategory===a.categoryId))return {error:'해당 등급과 카테고리의 천장 전용 상품을 지정해 주세요.'};
  p.rewardMappings[a.grade]??={};if(a.productId)p.rewardMappings[a.grade][a.categoryId]=a.productId;else delete p.rewardMappings[a.grade][a.categoryId];
 }
 p.rewardSettingsHistory.unshift({id:crypto.randomUUID(),createdAt:new Date(now).toISOString(),actor:'관리자',reason:String(a.reason).trim(),type:a.type,before,after:structuredClone({rules:p.rewardRules,categories:p.rewardCategories,mappings:p.rewardMappings})});
 return {handled:true};
}
