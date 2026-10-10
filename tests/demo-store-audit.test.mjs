import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition,loadState} from '../src/demoStore.js';
const apply=(s,a,r=()=>0.99)=>{const result=transition(s,a,r);assert.equal(result.ok,true,result.error);return result.state;};

test('재고 없는 유효 확률구간은 임의 당첨상품 없이 전체 거래 거절',()=>{
  const s=seedState();s.products.find(p=>p.id==='p1').stock=0;const before=structuredClone(s);
  assert.equal(transition(s,{type:'PURCHASE',boxId:1,quantity:1,method:'card'},()=>0.99).ok,false);
  assert.deepEqual(s,before);
});
test('겹치는 금액구간과 유효하지 않은 가격은 설정과 결제에서 거절',()=>{
  for(const mutate of [b=>b.price=-1,b=>b.price=Infinity,b=>b.tiers[0].min=100000,b=>b.tiers[0].max=Infinity]){
    const s=seedState();mutate(s.boxes[0]);assert.equal(transition(s,{type:'PURCHASE',boxId:1,method:'card'}).ok,false);
    assert.equal(transition(seedState(),{type:'UPDATE',key:'boxes',value:s.boxes}).ok,false);
  }
});
test('당첨상품 가치가 구매가보다 높아도 원결제 환불은 구매가에서 계산',()=>{
  const s=apply(seedState(),{type:'PURCHASE',boxId:1,quantity:1,method:'card'},()=>0);
  const item=s.lastResults[0];assert.equal(item.value,899000);assert.equal(item.purchasePrice,9900);
  const refunded=apply(s,{type:'REFUND',inventoryId:item.id,refundMethod:'original'});
  assert.equal(refunded.refunds[0].gross,9900);assert.equal(refunded.refunds[0].net,8910);assert.deepEqual(refunded.wallet,s.wallet);
});
test('보너스로 산 상품 환급은 유상 포인트를 만들지 않음',()=>{
  const s=seedState();s.wallet={paid:0,bonus:100000};const purchased=apply(s,{type:'PURCHASE',boxId:1,quantity:1,method:'wallet'});
  assert.equal(transition(purchased,{type:'REFUND',inventoryId:purchased.lastResults[0].id,refundMethod:'original'}).ok,false);
  const refunded=apply(purchased,{type:'REFUND',inventoryId:purchased.lastResults[0].id});assert.equal(refunded.wallet.paid,0);assert.equal(refunded.wallet.bonus,99010);
});
test('상품 전환과 복구는 무상 잔액과 상품 상태를 함께 되돌림',()=>{
  const s=seedState(),converted=apply(s,{type:'CONVERT_ITEM',inventoryId:'sample-item'});
  assert.equal(converted.wallet.bonus,135300);assert.equal(converted.wallet.paid,s.wallet.paid);assert.equal(converted.inventory[0].status,'포인트 전환');
  assert.equal(transition(converted,{type:'CONVERT_ITEM',inventoryId:'sample-item'}).ok,false);
  assert.equal(transition(converted,{type:'REFUND',inventoryId:'sample-item'}).ok,false);
  const restored=apply(converted,{type:'RESTORE_ITEM',conversionId:converted.conversions[0].id});assert.deepEqual(restored.wallet,s.wallet);assert.equal(restored.inventory[0].status,'보관 중');assert.equal(restored.conversions[0].status,'복구 완료');
  assert.equal(transition(restored,{type:'RESTORE_ITEM',inventoryId:'sample-item'}).ok,false);
});
test('전환 복구는 잔액 부족·기간 초과·최근24시간 횟수 초과시 거절',()=>{
  for(const mutate of [s=>s.wallet.bonus=0,s=>s.conversions[0].restorableUntil='2000-01-01',s=>s.settings.restoreDailyLimit=0]){
    const s=apply(seedState(),{type:'CONVERT_ITEM',inventoryId:'sample-item'});mutate(s);assert.equal(transition(s,{type:'RESTORE_ITEM',inventoryId:'sample-item'}).ok,false);
  }
  let s=seedState();for(let i=0;i<5;i++){s=apply(s,{type:'CONVERT_ITEM',inventoryId:'sample-item'});s=apply(s,{type:'RESTORE_ITEM',inventoryId:'sample-item'});}s=apply(s,{type:'CONVERT_ITEM',inventoryId:'sample-item'});assert.equal(transition(s,{type:'RESTORE_ITEM',inventoryId:'sample-item'}).ok,false);
});
test('쿠폰 할인 배분 합계는 주문가와 같고 재사용 불가',()=>{
  const s=apply(seedState(),{type:'PURCHASE',boxId:1,quantity:3,method:'card',couponId:'welcome'});
  assert.equal(s.orders[0].total,26730);assert.equal(s.lastResults.reduce((n,i)=>n+i.purchasePrice,0),26730);
  assert.equal(s.content.coupons[0].status,'사용 완료');assert.equal(transition(s,{type:'PURCHASE',boxId:1,quantity:1,method:'card',couponId:'welcome'}).ok,false);
});
test('포인트샵 교환은 등록상품 재고와 연결',()=>{
  const s=apply(seedState(),{type:'REDEEM',productId:'p5',amount:1});assert.equal(s.wallet.paid+s.wallet.bonus,93000);assert.equal(s.products.find(p=>p.id==='p5').stock,999);
  assert.equal(transition(s,{type:'REDEEM',productId:'missing',amount:1}).ok,false);
});
test('로그 추가는 기존 기록 보존, 손상 백업은 원본 상태 보존',()=>{
  const s=apply(seedState(),{type:'LOG',action:'첫 기록'}),next=apply(s,{type:'LOG',action:'두 번째'});assert.equal(next.logs[1].action,'첫 기록');
  for(const value of [{version:2}, {...seedState(),wallet:{paid:-1,bonus:0}}])assert.equal(transition(next,{type:'IMPORT_STATE',value}).ok,false);
  const restored=apply(next,{type:'IMPORT_STATE',value:seedState()});assert.equal(restored.logs[0].action,'IMPORT_STATE');
  assert.equal(loadState({getItem:()=>JSON.stringify({version:2})}).boxes.length,6);
});
test('관리자 송장과 배송 상태는 해당 보관함 상품에 함께 반영',()=>{
  const shipped=apply(seedState(),{type:'SHIP',ids:['sample-item']});
  const updated=apply(shipped,{type:'UPDATE_ORDER',id:shipped.orders[0].id,patch:{status:'배송 중',carrier:'CJ대한통운',tracking:'123456789'}});
  assert.equal(updated.inventory[0].status,'배송 중');assert.equal(updated.orders[0].tracking,'123456789');
  assert.equal(transition(updated,{type:'UPDATE_ORDER',id:updated.orders[0].id,patch:{status:'배송 취소'}}).ok,false);
});
