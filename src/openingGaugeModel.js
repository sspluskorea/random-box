export const openingGrades=['A','B','C','D','E'];
export function ensureOpeningGauge(s){
 s.platform.openingGaugeRules??=Object.fromEntries(openingGrades.map(g=>[g,{enabled:['A','B'].includes(g),startAfterOpenings:10,gainPerOpening:20,boostPercent:5,boostUses:1}]));
 s.platform.openingGaugeHistory??=[];s.openingGauges??={};
}
export function getOpeningGaugeProgress(s,memberId=s.session?.id||'demo-member'){
 const saved=s.openingGauges?.[memberId],totalOpenings=saved?.totalOpenings??0;
 return {totalOpenings,grades:Object.fromEntries(openingGrades.map(g=>{const rule=s.platform.openingGaugeRules[g],state=saved?.grades?.[g]||{gauge:0,remainingUses:0,boostPercent:0};return [g,{...state,rule,active:rule.enabled&&state.remainingUses>0,remainingToStart:Math.max(0,rule.startAfterOpenings-totalOpenings)}];}))};
}
export function openingGaugePlan(s,odds,memberId,gaugeGrade){
 const progress=getOpeningGaugeProgress(s,memberId),totals=Object.fromEntries(openingGrades.map(g=>[g,odds.filter(o=>o.grade===g).reduce((n,o)=>n+Number(o.probability),0)]));
 const grade=(gaugeGrade?[gaugeGrade]:openingGrades).find(g=>progress.grades[g]?.active&&totals[g]>0&&totals[g]<100);
 if(!grade)return {odds,appliedGrade:null,beforePercent:null,afterPercent:null};
 const beforePercent=totals[grade],afterPercent=Math.min(100,beforePercent+progress.grades[grade].boostPercent);
 return {odds:odds.map(o=>({...o,probability:o.grade===grade?Number(o.probability)/beforePercent*afterPercent:Number(o.probability)/(100-beforePercent)*(100-afterPercent)})),appliedGrade:grade,beforePercent,afterPercent};
}
export function applyOpeningGaugeOdds(s,odds,memberId,gaugeGrade){return openingGaugePlan(s,odds,memberId,gaugeGrade).odds;}
export function recordOpeningGauge(s,memberId,wonGrade,appliedGrade){
 const before=getOpeningGaugeProgress(s,memberId),next={totalOpenings:before.totalOpenings+1,grades:{}};
 for(const g of openingGrades){const prev=before.grades[g],rule=prev.rule,grade={gauge:prev.gauge,remainingUses:prev.remainingUses,boostPercent:prev.boostPercent,boostUsesSnapshot:prev.boostUsesSnapshot||0};
  if(prev.active){if(appliedGrade===g){grade.remainingUses--;if(!grade.remainingUses){grade.gauge=0;grade.boostPercent=0;}}}
  else if(rule.enabled&&grade.remainingUses===0&&g===wonGrade&&before.totalOpenings>=rule.startAfterOpenings){grade.gauge=Math.min(100,grade.gauge+rule.gainPerOpening);if(grade.gauge>=100){grade.remainingUses=rule.boostUses;grade.boostPercent=rule.boostPercent;grade.boostUsesSnapshot=rule.boostUses;}}
  next.grades[g]=grade;
 }s.openingGauges[memberId]=next;return {before,after:structuredClone(next)};
}
export function openingGaugeAction(s,a,now){
 if(a.type!=='SAVE_OPENING_GAUGE_RULES')return null;
 const rules=a.rules;if(!String(a.reason||'').trim()||!rules||Object.keys(rules).some(g=>!openingGrades.includes(g))||openingGrades.some(g=>{const r=rules[g];return !r||typeof r.enabled!=='boolean'||!Number.isSafeInteger(r.startAfterOpenings)||r.startAfterOpenings<0||!Number.isFinite(r.gainPerOpening)||r.gainPerOpening<=0||r.gainPerOpening>100||!Number.isFinite(r.boostPercent)||r.boostPercent<=0||r.boostPercent>100||!Number.isSafeInteger(r.boostUses)||r.boostUses<1||r.boostUses>10000;}))return {error:'등급별 시작 횟수·적립량·가산 확률·적용 횟수와 변경 사유를 확인해 주세요.'};
 const before=structuredClone(s.platform.openingGaugeRules);s.platform.openingGaugeRules=structuredClone(rules);s.platform.openingGaugeHistory.unshift({id:crypto.randomUUID(),createdAt:new Date(now).toISOString(),actor:'관리자',reason:String(a.reason).trim(),before,after:structuredClone(rules)});return {handled:true};
}
