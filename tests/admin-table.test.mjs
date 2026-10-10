import test from 'node:test';
import assert from 'node:assert/strict';
import {adminGroups,tableColumns,rowDetails,formatAdminValue} from '../src/adminTableModel.js';
test('관리자 핵심 메뉴만 유지하고 운영현황·백업 등 제거',()=>{
 const keys=adminGroups.flatMap(([,rows])=>rows.map(([key])=>key));
 assert.equal(new Set(keys).size,23);
 for(const key of ['overview','diagnostics','backup','stats','logs','suppliers','operators','maintenance'])assert.ok(!keys.includes(key));
 for(const key of ['boxes','probability','charges','refunds','orders','members','notices','events','terms'])assert.ok(keys.includes(key));
});
test('기본 컬럼 이외의 모든 상세 항목은 펼친 정보에 보존',()=>{
 const row={id:'o1',memberId:'m1',productName:'상품',probabilitySnapshot:[{label:'S',probability:1}],unknownFutureField:'추가값'};
 const cols=tableColumns.openings;
 const details=rowDetails(row,cols);
 assert.ok(details.some(([key])=>key==='probabilitySnapshot'));
 assert.ok(details.some(([key])=>key==='unknownFutureField'));
 assert.equal(new Set([...Object.keys(row).filter(key=>cols.includes(key)),...details.map(([key])=>key)]).size,Object.keys(row).length);
});
test('회원·박스 이름, 포인트·원화·확률 및 0을 읽기 쉽게 표시',()=>{
 const state={members:[{id:'m1',name:'회원'}],boxes:[{id:1,name:'박스'}]};
 assert.equal(formatAdminValue('memberId','m1',state),'회원 · m1');
 assert.equal(formatAdminValue('boxId',1,state),'박스 · 1');
 assert.equal(formatAdminValue('points',0),'0 P');
 assert.equal(formatAdminValue('amount',1000,{},'ledger'),'1,000 P');
 assert.equal(formatAdminValue('amount',1000,{},'charges'),'1,000원');
 assert.equal(formatAdminValue('probability',.5),'0.5%');
 assert.equal(formatAdminValue('answer',''),'—');
});
