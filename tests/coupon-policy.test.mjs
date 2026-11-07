import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition} from '../src/demoStore.js';
import {couponAvailable} from '../src/couponModel.js';
const base=()=>({id:'policy-coupon',name:'기간 쿠폰',amount:1000,status:'사용 가능'});
for(const boxId of [1,7]){
 test(`박스 ${boxId}: 관리자 기간·사용 횟수·소유자 조건 적용`,()=>{
  for(const patch of [{start:'2099-01-01'},{end:'2000-01-01'},{limit:0},{limit:-1},{limit:1.5},{memberId:'another'},{start:'2026-02-30'}]){
   const s=seedState();s.content.coupons=[{...base(),...patch}];const before=structuredClone(s);
   assert.equal(transition(s,{type:'PURCHASE',boxId,method:'wallet',couponId:'policy-coupon'},()=>0.99).ok,false,JSON.stringify(patch));assert.deepEqual(s,before);
  }
 });
 test(`박스 ${boxId}: 2회 쿠폰은 두 번만 적용하고 주문과 사용 기록 연결`,()=>{
  let s=seedState();s.content.coupons=[{...base(),limit:2}];
  for(let i=1;i<=2;i++){const r=transition(s,{type:'PURCHASE',boxId,method:'wallet',couponId:'policy-coupon'},()=>0.99);assert.equal(r.ok,true,r.error);s=r.state;assert.equal(s.content.coupons[0].usedCount,i);assert.equal(s.orders[0].couponId,'policy-coupon');assert.equal(s.orders[0].discount,1000);assert.equal(s.content.coupons[0].uses.at(-1).orderId,s.orders[0].id);}
  assert.equal(s.content.coupons[0].status,'사용 완료');assert.equal(transition(s,{type:'PURCHASE',boxId,method:'wallet',couponId:'policy-coupon'}).ok,false);
 });
 test(`박스 ${boxId}: 실패 구매는 쿠폰을 소모하지 않음`,()=>{const s=seedState();s.content.coupons=[base()];s.wallet.paid=0;s.wallet.bonus=0;const before=structuredClone(s);assert.equal(transition(s,{type:'PURCHASE',boxId,method:'wallet',couponId:'policy-coupon'}).ok,false);assert.deepEqual(s,before);});
}
test('쿠폰 날짜는 한국시간 시작일 0시부터 종료일 23:59:59.999까지',()=>{const c={...base(),start:'2026-11-07',end:'2026-11-07'};for(const [time,expected] of [['2026-11-06T14:59:59.999Z',false],['2026-11-06T15:00:00Z',true],['2026-11-07T14:59:59.999Z',true],['2026-11-07T15:00:00Z',false]])assert.equal(couponAvailable(c,'demo-member',Date.parse(time)),expected);});
test('기존 쿠폰 날짜 별칭과 기본 1회 정책 유지',()=>{const now=Date.parse('2026-11-07T03:00:00Z');assert.equal(couponAvailable({...base(),startsAt:'2026-11-07T02:00:00Z',expiresAt:'2026-11-07T04:00:00Z'},'demo-member',now),true);assert.equal(couponAvailable({...base(),startDate:'2026-11-08',endDate:'2026-11-09'},'demo-member',now),false);assert.equal(couponAvailable({...base(),usedAt:'2026-11-01'}),false);assert.equal(couponAvailable({...base(),limit:'',usedCount:1}),false);assert.equal(couponAvailable({...base(),start:'2026-11-08',startsAt:'2026-01-01'},'demo-member',now),false);});
