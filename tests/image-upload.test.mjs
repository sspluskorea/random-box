import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seedState,transition} from '../src/demoStore.js';
test('관리자 이미지 입력은 업로드로 제공하고 박스 목록에서는 이미지 숨김',()=>{
 const admin=readFileSync(new URL('../src/AdminConsole.jsx',import.meta.url),'utf8'),detail=readFileSync(new URL('../src/AdminRowDetails.jsx',import.meta.url),'utf8');
 assert.ok(admin.includes("fields.filter(f=>f!=='image')"));
 assert.ok(admin.includes('label="박스 상세 이미지" multiple'));
 assert.ok(admin.includes("'박스 대표 이미지'"));
 assert.ok(detail.includes("['image','detailImages'].includes(key)"));
});
test('상품 이미지가 당첨 보관 상품에 연결됨',()=>{
 let state=seedState();state.products.forEach(p=>p.image='data:image/webp;base64,dGVzdA==');
 const result=transition(state,{type:'PURCHASE',boxId:1,quantity:1,method:'wallet'},()=>.9);
 assert.equal(result.ok,true);
 assert.equal(result.state.lastResults[0].image,'data:image/webp;base64,dGVzdA==');
});
test('사용자 확률 목록에 상품 이미지와 상세 이미지 노출',()=>{
 const odds=readFileSync(new URL('../src/CustomerEnhancements.jsx',import.meta.url),'utf8'),flow=readFileSync(new URL('../src/CustomerFlows.jsx',import.meta.url),'utf8');
 assert.ok(odds.includes('src={p.image}'));
 assert.ok(flow.includes('(box.detailImages||[]).map'));
 assert.ok(!odds.includes('<summary>개별 상품의 최종 당첨 확률'));
});
