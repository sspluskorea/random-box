import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition,loadState} from '../src/demoStore.js';
import {effectiveProductOdds} from '../src/platformModel.js';
import {getOpeningGaugeProgress} from '../src/openingGaugeModel.js';
const act=(s,a,r=()=>.99)=>{const out=transition(s,a,r);assert.equal(out.ok,true,out.error);return out.state;};
const reject=(s,a,r)=>{const old=structuredClone(s);assert.equal(transition(s,a,r).ok,false);assert.deepEqual(s,old);};
test('독립 새구조: 상품반환 모든 별칭과 원결제 플래그는 Pay 환전 권리를 만들지 않음',()=>{
 for(const type of ['REFUND','CONVERT_ITEM','CASH_CONVERT'])for(const refundMethod of ['original','cash','points']){
 let s=seedState();s.wallet={paid:0,bonus:50000,cash:0};s=act(s,{type:'PURCHASE',boxId:7,method:'wallet'});const paid=s.wallet.paid;s=act(s,{type,inventoryId:s.lastResults[0].id,refundMethod});assert.equal(s.wallet.paid,paid);assert.equal(s.wallet.bonus,36100);reject(s,{type:'REQUEST_PAY_WITHDRAWAL',amount:1});
 }
});
test('독립 새구조: 저장·복원을 반복해도 구캐시와 고정 반환액은 한 번만 P 이관',()=>{
 let s=seedState();delete s.platform.financialVersion;s.wallet.cash=700;s.inventory[0].cashAmountSnapshot=1234;delete s.inventory[0].returnPointsSnapshot;const bonus=s.wallet.bonus,paid=s.wallet.paid;
 for(let i=0;i<4;i++)s=loadState({getItem:()=>JSON.stringify(s)});
 assert.equal(s.wallet.bonus,bonus+700);assert.equal(s.wallet.paid,paid);assert.equal(s.wallet.cash,0);s=act(s,{type:'CASH_CONVERT',inventoryId:s.inventory[0].id});assert.equal(s.wallet.bonus,bonus+700+1234);
});
test('독립 새구조: Pay 환전 예약 금액은 구매와 추가 환전에 사용 불가하며 타회원 취소 거절',()=>{
 let s=seedState(),original=s.wallet.paid;s=act(s,{type:'REQUEST_PAY_WITHDRAWAL',amount:original,requestId:'reservation'});const id=s.payWithdrawals[0].id;reject(s,{type:'REQUEST_PAY_WITHDRAWAL',amount:1});reject(s,{type:'PURCHASE',boxId:7,method:'wallet'});reject(s,{type:'REQUEST_PAY_WITHDRAWAL',amount:original,requestId:'reservation'});
 s.session={...s.session,id:'other'};s.members.push({id:'other',points:0,wallet:{paid:0,bonus:0,cash:0}});reject(s,{type:'CANCEL_PAY_WITHDRAWAL',id});
});
test('독립 새구조: 관리자 P 조정 기본값과 명시 Pay 조정은 별도 잔액만 변경',()=>{
 for(const balanceType of [undefined,'bonus','paid']){const s=seedState(),next=act(s,{type:'ADJUST_POINTS',memberId:'demo-member',amount:123,reason:'잔액 정정',balanceType});assert.equal(next.wallet.paid,s.wallet.paid+(balanceType==='paid'?123:0));assert.equal(next.wallet.bonus,s.wallet.bonus+(balanceType==='paid'?0:123));}
});
test('독립 새구조: 강화는 100%에 제한되며 다른 등급 게이지·기본 확률표 보존',()=>{
 let s=seedState();s.openingGauges['demo-member']={totalOpenings:30,grades:{A:{gauge:100,remainingUses:1,boostPercent:100},B:{gauge:100,remainingUses:2,boostPercent:20}}};const base=structuredClone(s.boxes.find(b=>b.id===7).productOdds);const odds=effectiveProductOdds(s,s.boxes.find(b=>b.id===7));assert.equal(odds.reduce((n,o)=>n+o.probability,0),100);assert.equal(odds.find(o=>o.grade==='A').probability,100);
 s=act(s,{type:'PURCHASE',boxId:7,method:'wallet'},()=>.99);assert.equal(s.lastResults[0].grade,'A');assert.equal(getOpeningGaugeProgress(s).grades.A.gauge,0);assert.equal(getOpeningGaugeProgress(s).grades.B.remainingUses,2);assert.deepEqual(s.boxes.find(b=>b.id===7).productOdds,base);
});
test('독립 새구조: 다중개봉 마지막 실패는 강화 사용권·결제·재고·원장까지 원자적 롤백',()=>{
 const s=seedState();s.openingGauges['demo-member']={totalOpenings:20,grades:{A:{gauge:100,remainingUses:2,boostPercent:10}}};let i=0;reject(s,{type:'PURCHASE',boxId:7,quantity:3,method:'wallet',requestId:'failed-batch'},()=>++i===3?NaN:0.5);
});
test('독립 새구조: 0% 반환 스냅샷은 설정 변경·복원 후에도 0이고 타회원 상품 접근 금지',()=>{
 let s=seedState();s.products.find(p=>p.id==='p5').returnPointPercent=0;s=act(s,{type:'PURCHASE',boxId:7,method:'wallet'});const id=s.lastResults[0].id,old=structuredClone(s.wallet);s.products.find(p=>p.id==='p5').returnPointPercent=100;s=loadState({getItem:()=>JSON.stringify(s)});s=act(s,{type:'REFUND',inventoryId:id});assert.deepEqual(s.wallet,old);assert.equal(s.conversions[0].amount,0);reject(s,{type:'REFUND',inventoryId:id});
});
