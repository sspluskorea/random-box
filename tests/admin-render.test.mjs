import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {seedState,transition} from '../src/demoStore.js';
import {tableColumns} from '../src/adminTableModel.js';

test('관리자 실제 객체·배열 상세와 회원 보상 데이터가 React 렌더에서 오류 없이 표시됨',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try {
  const {default:AdminRowDetails,AdminValue}=await server.ssrLoadModule('/src/AdminRowDetails.jsx');
  let state=seedState();for(const action of [{type:'CHARGE',amount:10000000},{type:'PURCHASE',boxId:7,method:'wallet'}]){const result=transition(state,action,()=>0.99);assert.equal(result.ok,true,result.error);state=result.state;}
  state.platform.pityClaims.push({id:"legacy",memberId:"demo-member",grade:"B",threshold:10000000,status:"수령 완료"});
  const nested=renderToStaticMarkup(createElement(AdminValue,{field:'record',value:{memberId:'demo-member',details:{amount:10000,items:[{name:'품목',value:1000}]},probabilitySnapshot:[{productId:'p1',probability:0.5}]},state}));
  assert.ok(nested.includes('품목'));assert.ok(nested.includes('0.5'));
  for(const menu of ['boxes','products','members','inventory','orders','openings','ledger'])for(const row of state[menu]){
   const html=renderToStaticMarkup(createElement(AdminRowDetails,{row,columns:tableColumns[menu]||[],state,menu,labels:{}}));
   assert.ok(html.includes('펼쳐진 상세 정보'),`${menu} details must render`);
  }
 } finally {await server.close();}
});
