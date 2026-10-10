import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition,loadState,kstDate} from '../src/demoStore.js';
const apply=(s,a)=>{const r=transition(s,a);assert.equal(r.ok,true,r.error);return r.state;};
const buy=(s=seedState(),method='card')=>apply(s,{type:'BUY_PASS',planId:s.content.passPlans[0].id,method});
const offset=n=>new Date(Date.parse(kstDate()+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
test('KST 출석 날짜 및 과거 회원 이름 마이그레이션',()=>{
 assert.equal(kstDate('2026-10-09T15:01:00Z'),'2026-10-10');const s=seedState();s.members[0].name='미팅 고객';s.session={id:'demo-member',name:'체험 회원'};s.openings=[{memberName:'미팅 고객',source:'직접 시연'}];delete s.content.passPlans;
 const loaded=loadState({getItem:()=>JSON.stringify(s)});assert.equal(loaded.members[0].name,'박스러버');assert.equal(loaded.session.name,'박스러버');assert.equal(loaded.openings[0].source,'개봉 기록');assert.equal(loaded.content.passPlans.length,1);
 assert.equal(apply(seedState(),{type:'LOGIN'}).session.name,'박스러버');
});
test('패스 카드 빈 입력 구매·중복구매 차단·당일 중복 보상 차단',()=>{
 const s=buy(),sub=s.content.subscriptions[0];assert.equal(sub.startDate,kstDate());assert.equal(sub.endDate,offset(29));assert.equal(sub.status,'이용 중');assert.equal(sub.planSnapshot.streakDays,6);
 assert.equal(transition(s,{type:'BUY_PASS',planId:sub.planId}).ok,false);const claimed=apply(s,{type:'CLAIM_PASS',subscriptionId:sub.id});assert.equal(claimed.wallet.bonus,s.wallet.bonus+300);assert.equal(claimed.content.subscriptions[0].claims[0].date,kstDate());assert.equal(transition(claimed,{type:'CLAIM_PASS',subscriptionId:sub.id}).ok,false);
});
test('패스 포인트 결제는 유상·보너스 잔액 순서와 원장 연결',()=>{
 const s=buy(seedState(),'wallet');assert.deepEqual(s.wallet,{paid:93100,bonus:0});assert.equal(s.ledger[0].amount,-9900);
 const insufficient=seedState();insufficient.wallet={paid:0,bonus:0};assert.equal(transition(insufficient,{type:'BUY_PASS',planId:'nebula-pass',method:'wallet'}).ok,false);
});
test('6일 블록 보충출석은 박스가50% 차감과 연속보상 단1회',()=>{
 let s=buy();const sub=s.content.subscriptions[0];sub.startDate=offset(-5);sub.endDate=offset(24);for(let i=-5;i<0;i++)sub.claims.push({date:offset(i),reward:300,type:'출석'});sub.claims=sub.claims.filter(c=>c.date!==offset(-2));
 s=apply(s,{type:'CLAIM_PASS',subscriptionId:sub.id});assert.equal(s.content.subscriptions[0].claims.at(-1).streakReward,0);
 const before=s.wallet.paid+s.wallet.bonus;s=apply(s,{type:'MAKEUP_PASS',subscriptionId:sub.id,date:offset(-2)});assert.equal(s.content.subscriptions[0].claims.at(-1).cost,4950);assert.equal(s.content.subscriptions[0].claims.at(-1).streakReward,1000);assert.equal(s.wallet.paid+s.wallet.bonus,before-4950+1300);
 assert.equal(transition(s,{type:'MAKEUP_PASS',subscriptionId:sub.id,date:offset(-2)}).ok,false);assert.equal(s.content.subscriptions[0].streakRewards.length,1);
});
test('미래·시작 이전·유효하지 않은 보충출석 및 만료출석 거절',()=>{
 const s=buy(),sub=s.content.subscriptions[0];for(const date of [kstDate(),offset(1),offset(-1),'2026-02-31'])assert.equal(transition(s,{type:'MAKEUP_PASS',subscriptionId:sub.id,date}).ok,false);
 sub.endDate=offset(-1);assert.equal(transition(s,{type:'CLAIM_PASS',subscriptionId:sub.id}).ok,false);
});
test('해지 예약 후 잔여일 이용과 만료 전 연장·중복 연장 제한',()=>{
 let s=buy();let sub=s.content.subscriptions[0];assert.equal(transition(s,{type:'RENEW_PASS',subscriptionId:sub.id}).ok,false);s=apply(s,{type:'CANCEL_PASS',subscriptionId:sub.id});assert.equal(s.content.subscriptions[0].status,'해지 예약');s=apply(s,{type:'CLAIM_PASS',subscriptionId:sub.id});sub=s.content.subscriptions[0];sub.endDate=offset(3);
 s=apply(s,{type:'RENEW_PASS',subscriptionId:sub.id,method:'card'});sub=s.content.subscriptions[0];assert.equal(sub.endDate,offset(33));assert.equal(sub.status,'이용 중');assert.equal(sub.renewals[0].startDate,offset(4));assert.equal(transition(s,{type:'RENEW_PASS',subscriptionId:sub.id}).ok,false);
});
test('물품 매입 신청→견적→수락→검수→보너스지급과 중복차단',()=>{
 let s=apply(seedState(),{type:'EXCHANGE_REQUEST',fields:{name:'헤드폰'}});const id=s.content.exchangeRequests[0].id;
 assert.equal(transition(s,{type:'PAY_EXCHANGE',id}).ok,false);s=apply(s,{type:'UPDATE_EXCHANGE',id,patch:{offerAmount:20000,status:'견적 안내'}});s=apply(s,{type:'ACCEPT_EXCHANGE',id});assert.equal(transition(s,{type:'UPDATE_EXCHANGE',id,patch:{offerAmount:30000}}).ok,false);
 s=apply(s,{type:'UPDATE_EXCHANGE',id,patch:{status:'검수 중'}});s=apply(s,{type:'UPDATE_EXCHANGE',id,patch:{status:'검수 완료'}});s=apply(s,{type:'PAY_EXCHANGE',id});assert.equal(s.wallet.bonus,23000);assert.equal(s.wallet.paid,100000);assert.equal(s.ledger[0].exchangeId,id);assert.equal(transition(s,{type:'PAY_EXCHANGE',id}).ok,false);
});
test('다른 회원 견적 수락 불가 및 관리자 지급은 해당 회원에만 반영',()=>{
 let s=apply(seedState(),{type:'EXCHANGE_REQUEST'});const r=s.content.exchangeRequests[0];r.memberId='other';r.status='견적 안내';r.offerAmount=1000;s.members.push({id:'other',points:0});assert.equal(transition(s,{type:'ACCEPT_EXCHANGE',id:r.id}).ok,false);r.status='검수 완료';const before=structuredClone(s.wallet);s=apply(s,{type:'PAY_EXCHANGE',id:r.id});assert.deepEqual(s.wallet,before);assert.equal(s.members.find(m=>m.id==='other').points,1000);
});
