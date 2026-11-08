import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition} from '../src/demoStore.js';
import {matchesRelatedProduct,adminOrderKind} from '../src/adminRelatedProductModel.js';
const apply=(state,action,random=()=>0.99)=>{const r=transition(state,action,random);assert.equal(r.ok,true,r.error);return r.state;};

test('상품명이 변경되거나 같아져도 당첨내역은 상품 ID로 구분',()=>{
 let s=seedState();s=apply(s,{type:'PURCHASE',boxId:7,method:'wallet'},()=>0);const opening=s.openings[0];s.products.find(p=>p.id==='p1').name='새 이름';s.products.find(p=>p.id==='p2').name='새 이름';
 assert.equal(matchesRelatedProduct(opening,'openings','p1',s),true);assert.equal(matchesRelatedProduct(opening,'openings','p2',s),false);
 const legacy={...opening};delete legacy.productId;assert.equal(matchesRelatedProduct(legacy,'openings','p1',s),true);
 assert.equal(matchesRelatedProduct({...legacy,productId:'p2'},'openings','p1',s),false);
});
test('복수 상품 구매 주문은 포함된 상품에만 연결되고 주문 전체 금액을 보존',()=>{
 let index=0,s=apply(seedState(),{type:'PURCHASE',boxId:7,method:'wallet',quantity:2},()=>index++===0?0:0.99);const order=s.orders[0];
 assert.equal(s.orders.filter(r=>matchesRelatedProduct(r,'orders','p1',s)).length,1);assert.equal(matchesRelatedProduct(order,'orders','p5',s),true);assert.equal(matchesRelatedProduct(order,'orders','p2',s),false);assert.equal(order.total,39800);assert.equal(adminOrderKind(order),'랜덤박스 구매');
 const afterInventoryRemoval={...s,inventory:[]};assert.equal(matchesRelatedProduct(order,'orders','p1',afterInventoryRemoval),true);
 assert.equal(matchesRelatedProduct({id:'unrelated',items:order.items,boxId:7},'orders','p1',s),false);
});
test('천장 확정보상은 구매·개봉내역을 만들지 않고 배송 신청만 배송 주문으로 연결',()=>{
 let s=seedState();s.platform.campaigns=[];s=apply(s,{type:'CHARGE',amount:10000000});const item={...s.inventory[0],id:'legacy-reward',productId:'reward-B-men',source:'천장 보상',grade:'B',autoConvertEligible:false};s.inventory.push(item);
 assert.equal(s.openings.filter(r=>matchesRelatedProduct(r,'openings',item.productId,s)).length,0);assert.equal(s.orders.filter(r=>matchesRelatedProduct(r,'orders',item.productId,s)).length,0);
 s=apply(s,{type:'SHIP',ids:[item.id]});assert.equal(matchesRelatedProduct(s.orders[0],'orders',item.productId,s),true);assert.equal(adminOrderKind(s.orders[0]),'상품 배송');
});
test('이벤트 무료 개봉은 상품 연결을 유지하면서 유료 구매와 주문 구분을 달리 표시',()=>{
 let s=apply(seedState(),{type:'CHARGE',amount:3000000});s=apply(s,{type:'USE_BOX_TICKET',ticketId:s.platform.boxTickets[0].id});const order=s.orders[0];assert.equal(order.total,0);assert.equal(adminOrderKind(order),'이벤트 박스 개봉');assert.equal(matchesRelatedProduct(order,'orders',s.lastResults[0].productId,s),true);
});
test('상품 필터를 해제하면 이름과 상태 등 목록의 별도 검색조건에 전체 행을 넘김',()=>{
 const s=seedState();for(const menu of ['orders','openings'])assert.equal(matchesRelatedProduct({id:'none'},menu,'',s),true);assert.equal(adminOrderKind({id:'legacy'}),'기타 주문');
});
