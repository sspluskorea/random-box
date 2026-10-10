import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seedState,transition} from '../src/demoStore.js';
test('박스 결제 화면에는 연락처 재입력 필드가 없음',()=>{const source=readFileSync(new URL('../src/CustomerFlows.jsx',import.meta.url),'utf8');const checkout=source.split("{route==='checkout'")[1].split("{route==='open'")[0];assert.ok(!checkout.includes("field('phone')"));assert.ok(!checkout.includes('주문 연락처'));assert.ok(source.includes('label="휴대전화"'));});
test('가입 연락처는 회원에 저장되고 로그아웃·빈 로그인 뒤 유지',()=>{let s=seedState();for(const a of [{type:'SIGNUP',fields:{phone:'010-0000-0000'}},{type:'LOGOUT'},{type:'LOGIN',fields:{}}]){const r=transition(s,a);assert.equal(r.ok,true);s=r.state;}assert.equal(s.session.phone,'010-0000-0000');assert.equal(s.members[0].phone,'010-0000-0000');});
test('애니메이션은 거래를 실행하지 않고 종료·타이머 정리·동작줄이기를 지원',()=>{const source=readFileSync(new URL('../src/BoxOpening.jsx',import.meta.url),'utf8');assert.ok(!/dispatch|PURCHASE|Math.random/.test(source));assert.ok(source.includes('timers.forEach(clearTimeout)'));assert.ok(source.includes('prefers-reduced-motion'));assert.ok(source.includes('연출 건너뛰기'));assert.ok(source.includes("setStage('open')"));});
