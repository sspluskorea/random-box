import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition,loadState} from '../src/demoStore.js';
import {memberProgress,netPaid,effectiveProductOdds} from '../src/platformModel.js';
const initial=()=>{const s=seedState();s.platform.campaigns=[];return s;};
const doAction=(s,a,r=()=>0.99)=>{const out=transition(s,a,r);assert.equal(out.ok,true,out.error);return out.state;};
const rejected=(s,a,r)=>{const before=structuredClone(s);assert.equal(transition(s,a,r).ok,false);assert.deepEqual(s,before,'failed transaction must preserve all original state');};

test('independent: 4천만원 충전으로 새 개봉 게이지나 확정보상이 생기지 않음',async()=>{
 const {getOpeningGaugeProgress}=await import('../src/openingGaugeModel.js');let s=doAction(initial(),{type:'CHARGE',amount:40000000});
 assert.equal(getOpeningGaugeProgress(s).totalOpenings,0);for(const p of Object.values(getOpeningGaugeProgress(s).grades))assert.equal(p.gauge,0);
 for(const grade of ['A','B'])rejected(s,{type:'CLAIM_PITY',grade,category:'men'});assert.equal(s.platform.pityClaims.length,0);
});

test('independent: 미승인 실패 충전 행은 천장과 이벤트 누적에서 제외',()=>{
 const s=initial();s.charges=['승인 대기','결제 실패','취소 완료','알 수 없음'].map((status,i)=>({id:String(i),memberId:'demo-member',amount:10000000,bonus:0,status,createdAt:new Date().toISOString()}));
 assert.equal(netPaid(s),0);assert.equal(memberProgress(s).B.available,false);
});
test('independent: 관리자 수동 천장 과거 사유와 주체 보존 및 새 지급 차단',()=>{
 let s=initial();const legacy={id:'manual-old',memberId:'demo-member',grade:'B',threshold:10000000,consumed:10000000,actor:'관리자',reason:'과거 문의 대리 수령',status:'수령 완료'};s.platform.pityClaims.push(legacy);s=loadState({getItem:()=>JSON.stringify(s)});assert.deepEqual(s.platform.pityClaims[0],legacy);
 for(const reason of ['', '회원 요청'])rejected(s,{type:'ADMIN_CLAIM_PITY',memberId:'demo-member',grade:'B',category:'men',reason});
});

test('independent: 0퍼센트 버닝은 관리자 최소 허용값과 같이 거절',()=>{
 rejected(initial(),{type:'SAVE_CAMPAIGN',campaign:{name:'잘못된 버닝',threshold:100,rewardType:'burning',boxId:7,burningPercent:0,burningUses:1,status:'활성',maxClaims:1}});
});
test('independent: 다중 개봉 중 잘못된 추첨값은 결제 재고 쿠폰 결과 모두 원자적으로 취소',()=>{
 const s=initial();let call=0;rejected(s,{type:'PURCHASE',boxId:7,method:'wallet',quantity:2,requestId:'invalid-draw'},()=>call++===0?0.99:NaN);
 assert.equal(s.platform.requests.some(r=>r.id==='invalid-draw'),false);
});
test('independent: 재고 1개인 상품을 2회 개봉할 수 없으며 다른 거래에도 손실 없음',()=>{
 const s=initial();s.products.find(p=>p.id==='p1').stock=1;rejected(s,{type:'PURCHASE',boxId:7,method:'wallet',quantity:2});
});
test('independent: 만료 시각과 전환액은 당첨 당시 설정이며 이후 설정 변경 무관',()=>{
 let s=doAction(initial(),{type:'PURCHASE',boxId:7,method:'wallet'});const item=s.lastResults[0],expiry=item.expiresAt;assert.equal(Date.parse(expiry)-Date.parse(item.createdAt),240*3600000);
 s=doAction(s,{type:'PLATFORM_SETTINGS',patch:{cashPercent:20,autoConvertHours:1}});assert.equal(s.inventory.find(i=>i.id===item.id).expiresAt,expiry);
 s=doAction(s,{type:'PROCESS_DUE',now:expiry});assert.equal(s.conversions[0].amount,6000);assert.equal(s.inventory.find(i=>i.id===item.id).status,'자동 포인트 전환');
 rejected(s,{type:'CASH_CONVERT',inventoryId:item.id});rejected(s,{type:'SHIP',ids:[item.id]});
});
test('independent: 다른 회원의 상품 및 특별박스와 버닝 이용권은 사용할 수 없음',()=>{
 let s=initial();s.inventory.push({id:'other-item',memberId:'other',status:'보관 중',value:10000,cashAmountSnapshot:6000});
 s.platform.boxTickets.push({id:'other-box',memberId:'other',boxId:7,remaining:1});s.platform.burningTickets.push({id:'other-burn',memberId:'other',boxId:7,remaining:1,percent:10});
 rejected(s,{type:'CASH_CONVERT',inventoryId:'other-item'});rejected(s,{type:'USE_BOX_TICKET',ticketId:'other-box'});rejected(s,{type:'PURCHASE',boxId:7,method:'wallet',burningTicketId:'other-burn'});
});
test('independent: 이벤트 상품 재고 실패는 충전 승인과 지급 권리를 보존하고 입고 후 1회 지급',()=>{
 let s=initial();s.products.find(p=>p.id==='p2').stock=0;s=doAction(s,{type:'SAVE_CAMPAIGN',campaign:{id:'stock-wait',name:'상품 보상',threshold:1000,rewardType:'product',productId:'p2',status:'활성',maxClaims:1}});
 s=doAction(s,{type:'CHARGE',amount:1000});assert.equal(netPaid(s),1000);assert.equal(s.platform.rewardGrants.length,0);
 s.products.find(p=>p.id==='p2').stock=1;s=doAction(s,{type:'CLAIM_CAMPAIGN',campaignId:'stock-wait'});assert.equal(s.platform.rewardGrants.length,1);rejected(s,{type:'CLAIM_CAMPAIGN',campaignId:'stock-wait'});
});
test('independent: 직렬 여러 부분취소의 총차감은 원충전과 보너스를 넘지 않음',()=>{
 let s=doAction(initial(),{type:'CHARGE',amount:10003});const id=s.charges[0].id;
 for(const amount of [1,7,102,999,8894])s=doAction(s,{type:'REFUND_CHARGE',id,amount});
 assert.equal(netPaid(s),0);assert.equal(s.wallet.paid,100000);assert.equal(s.wallet.bonus,3000);rejected(s,{type:'REFUND_CHARGE',id,amount:1});
});
test('independent: 저장 복원 후 같은 결제 요청은 다시 적립하거나 보상 지급하지 않음',()=>{
 let s=doAction(seedState(),{type:'CHARGE',amount:10000000,requestId:'provider-id-17'});s=loadState({getItem:()=>JSON.stringify(s)});const grantCount=s.platform.rewardGrants.length;
 rejected(s,{type:'CHARGE',amount:10000000,requestId:'provider-id-17'});assert.equal(s.platform.rewardGrants.length,grantCount);assert.equal(netPaid(s),10000000);
});
test('independent: 일반 및 버닝 각각 표시 확률의 경계대로 추첨하고 총합100 유지',()=>{
 const base=initial();base.platform.burningTickets.push({id:'burn',memberId:'demo-member',boxId:7,remaining:20,percent:10});const box=base.boxes.find(b=>b.id===7);
 for(const burningTicketId of [undefined,'burn']){const odds=effectiveProductOdds(base,box,burningTicketId);assert.ok(Math.abs(odds.reduce((n,r)=>n+r.probability,0)-100)<1e-9);let boundary=0;for(const odd of odds){if(!odd.probability)continue;const draw=(boundary+odd.probability/2)/100;const s=doAction(base,{type:'PURCHASE',boxId:7,method:'wallet',burningTicketId},()=>draw);assert.equal(s.lastResults[0].productId,odd.productId);assert.equal(s.openings[0].probability,odd.probability);boundary+=odd.probability;}}
});
test('independent: 자동처리 타이머 전에도 기한 지난 상품 환급과 수동 포인트전환 차단',()=>{
 const s=doAction(initial(),{type:'PURCHASE',boxId:7,method:'wallet'});const id=s.lastResults[0].id;s.inventory.find(i=>i.id===id).expiresAt=new Date(Date.now()-1).toISOString();
 rejected(s,{type:'REFUND',inventoryId:id});rejected(s,{type:'CONVERT_ITEM',inventoryId:id});rejected(s,{type:'SHIP',ids:[id]});rejected(s,{type:'CASH_CONVERT',inventoryId:id});
});
test('independent: 다른 회원 환급 승인은 해당 회원에게 반환하고 현재 사용자 지갑은 보존',()=>{
 for(const refundMethod of ['points','cash']){let s=initial();s.members.push({id:'other',name:'다른 회원',points:0,cash:0,wallet:{paid:0,bonus:0,cash:0}});s.inventory.push({id:'other-inv',memberId:'other',status:'환불 대기'});s.refunds.push({id:'other-refund',inventoryId:'other-inv',memberId:'other',status:'승인 대기',net:9000,paidNet:8000,bonusNet:1000,refundMethod});const before=structuredClone(s.wallet);
 s=doAction(s,{type:'APPROVE_REFUND',id:'other-refund'});assert.deepEqual(s.wallet,before);const member=s.members.find(m=>m.id==='other');assert.equal(member.wallet.bonus,9000);assert.equal(member.wallet.paid,0);assert.equal(member.cash,0);assert.equal(s.ledger[0].memberId,'other');rejected(s,{type:'APPROVE_REFUND',id:'other-refund'});}
});
test('independent: 0퍼센트 구성상품 삭제도 박스 참조를 손상시키지 않음',()=>{
 let s=initial();const boxes=structuredClone(s.boxes),b=boxes.find(x=>x.id===7);b.productOdds[0].probability=0;b.productOdds[4].probability=70.5;s=doAction(s,{type:'UPDATE',key:'boxes',value:boxes});
 rejected(s,{type:'UPDATE',key:'products',value:s.products.filter(p=>p.id!=='p1')});
});

test('independent: 과거 금액 기준을 바꿔도 종료된 확정보상을 재활성화하지 않음',()=>{
 for(const pityB of [5000000,20000000]){let s=doAction(initial(),{type:'CHARGE',amount:40000000});s=doAction(s,{type:'PLATFORM_SETTINGS',patch:{pityB}});rejected(s,{type:'CLAIM_PITY',grade:'B',category:'men'});assert.equal(s.platform.pityClaims.length,0);}
});

test('independent: 과거 보상 후 충전 부분취소는 기록 보존하며 신규 게이지를 만들지 않음',async()=>{
 const {getOpeningGaugeProgress}=await import('../src/openingGaugeModel.js');let s=doAction(initial(),{type:'CHARGE',amount:10000000});const id=s.charges[0].id,legacy={id:'old',memberId:'demo-member',grade:'B',threshold:10000000,consumed:10000000,status:'수령 완료'};s.platform.pityClaims.push(legacy);s=doAction(s,{type:'REFUND_CHARGE',id,amount:1000000});assert.equal(netPaid(s),9000000);assert.deepEqual(s.platform.pityClaims,[legacy]);assert.equal(getOpeningGaugeProgress(s).totalOpenings,0);
});

test('independent: 과거 보상 기록: 과거 기록 보존 및 신규 금액천장 지급 차단',()=>{
 let s=doAction(initial(),{type:'CHARGE',amount:40000000});
 const legacy={id:'legacy',memberId:'demo-member',grade:'B',threshold:10000000,consumed:40000000,cycle:1,status:'수령 완료',actor:'관리자',reason:'과거 수령'};
 s.platform.pityClaims.push(legacy);s=loadState({getItem:()=>JSON.stringify(s)});
 for(const type of ['CLAIM_PITY','ADMIN_CLAIM_PITY'])rejected(s,{type,grade:'B',category:'men',memberId:'demo-member',reason:'신규 요청'});
 assert.deepEqual(s.platform.pityClaims,[legacy]);
});
