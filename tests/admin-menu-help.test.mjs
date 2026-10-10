import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adminMenuHelp} from '../src/adminMenuHelp.js';
import {adminGroups} from '../src/adminTableModel.js';

test('핵심 관리자 23개 메뉴에 목적·사용법·활용 안내가 빠짐없이 제공됨',()=>{
 const source=readFileSync(new URL('../src/AdminConsole.jsx',import.meta.url),'utf8');
 const keys=adminGroups.flatMap(([,list])=>list.map(([key])=>key));
 assert.equal(keys.length,23);
 for(const key of keys){
  assert.equal(adminMenuHelp[key].length,3,key);
  assert.ok(adminMenuHelp[key].every(s=>typeof s==='string'&&s.trim().length>10),key);
 }
 assert.ok(source.includes('adminMenuHelp[menu].map'));
 assert.ok(!source.includes('데이터를 조회하고 운영 상태를 관리합니다.'));
});
