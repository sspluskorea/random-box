import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seedState,transition} from '../src/demoStore.js';
import {publicOpenings} from '../src/policyModel.js';
test('핵심 서비스는 부가기능 비활성으로 시작하고 공개 예시를 사용하지 않음',()=>{
 const s=seedState();assert.equal(s.settings.shopEnabled,false);assert.equal(s.settings.tradeEnabled,false);assert.equal(s.settings.winnerFeedShowSamples,false);
 const text=readFileSync(new URL('../src/Transparency.jsx',import.meta.url),'utf8');assert.ok(!text.includes('sample-1'));assert.ok(text.includes('const visible=publicOpenings'));s.openings=[{id:'no-order',createdAt:'2026-10-10',inventoryId:'i'},{id:'linked',createdAt:'2026-10-10',inventoryId:'i',orderId:'o'}];assert.deepEqual(publicOpenings(s).map(r=>r.id),['linked']);
});
test('충전 → 포인트 구매 → 개봉 기록과 상품 연결',()=>{
 let s=seedState();s.wallet={paid:0,bonus:0};
 for(const a of [{type:'LOGIN',fields:{}},{type:'CHARGE',amount:10000,method:'card'},{type:'PURCHASE',boxId:1,quantity:1,method:'wallet'}]){const r=transition(s,a,()=>0.99);assert.equal(r.ok,true,r.error);s=r.state;}
 const opening=s.openings[0],item=s.inventory.find(i=>i.id===opening.inventoryId);assert.equal(item.orderId,opening.orderId);assert.equal(item.name,opening.productName);assert.ok(opening.probabilitySnapshot.length);assert.equal(s.wallet.paid+s.wallet.bonus,400);
});
