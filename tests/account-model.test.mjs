import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState} from '../src/demoStore.js';
import {accountSummary} from '../src/accountModel.js';
test('마이페이지는 본인 상품과 본인 언박싱만 집계',()=>{const s=seedState();s.inventory.push({memberId:'other',status:'보관 중'});s.openings=[{id:'other',memberId:'other',createdAt:'2026-01-01'},{id:'mine',memberId:'demo-member',createdAt:'2026-01-01'}];const m=accountSummary(s);assert.equal(m.stored.length,1);assert.equal(m.recent.length,1);assert.equal(m.recent[0].id,'mine');});
test('상품 준비 중은 배송 준비로 집계하고 디지털 개봉 주문은 제외',()=>{const s=seedState();s.orders=[{status:'개봉 완료'},{status:'상품 준비 중'},{status:'배송 준비'},{status:'배송 중',memberId:'other'}];const m=accountSummary(s);assert.equal(m.orders.length,2);assert.equal(m.deliveryCount('배송 준비'),2);assert.equal(m.deliveryCount('배송 중'),0);});
test('만료·사용·사용기간 이전 쿠폰은 사용 가능 수에서 제외',()=>{const s=seedState();s.content.coupons=[{status:'사용 가능'},{status:'사용 가능',usedAt:'2026-01-01'},{status:'사용 가능',expiresAt:'2025-12-31'},{status:'사용 가능',startsAt:'2027-01-01'}];assert.equal(accountSummary(s,Date.parse('2026-10-10')).coupons.length,1);});
test('답변 있는 문의와 완료 문의는 대기 수에서 제외',()=>{const s=seedState();s.content.inquiries=[{status:'접수'},{status:'접수',answer:'답변'},{status:'답변 완료'},{status:'접수',memberId:'other'}];assert.equal(accountSummary(s).inquiries.length,1);});
