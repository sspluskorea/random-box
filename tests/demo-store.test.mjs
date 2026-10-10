import test from 'node:test';
import assert from 'node:assert/strict';
import { seedState, transition, loadState, STORAGE_KEY } from '../src/demoStore.js';

test('원결제 모의 환불은 유료 포인트를 중복 지급하지 않음',()=>{
  for(const refundApprovalRequired of [false,true]){
    const seed=seedState();seed.settings.refundApprovalRequired=refundApprovalRequired;
    let state=apply(seed,{type:'REFUND',inventoryId:'sample-item',refundMethod:'original'});
    if(refundApprovalRequired)state=apply(state,{type:'APPROVE_REFUND',id:state.refunds[0].id});
    assert.deepEqual(state.wallet,seed.wallet);assert.equal(state.refunds[0].refundMethod,'original');assert.equal(state.refunds[0].status,'환불 완료');
  }
});
test('무료배송 기준금액은 배송 주문 금액에 반영',()=>{
 const seed=seedState();seed.settings.freeShippingThreshold=100000;
 const state=apply(seed,{type:'SHIP',ids:['sample-item']});assert.equal(state.orders[0].total,0);
});

function apply(state, action, random = () => 0.99) {
  const result = transition(state, action, random);
  assert.equal(result.ok, true, result.error);
  return result.state;
}

test('빈 회원가입·로그인은 기본 회원으로 완료되고 로그아웃 가능', () => {
  for (const type of ['SIGNUP', 'LOGIN']) {
    const state = apply(seedState(), { type, fields: {} });
    assert.equal(state.session.id, 'demo-member');
    assert.equal(state.session.name, '박스러버');
    assert.equal(state.members.find(m => m.id === state.session.id).email, state.session.email);
    assert.equal(apply(state, { type: 'LOGOUT' }).session, null);
  }
});

test('충전은 설정한 보너스와 회원 잔액·거래내역을 함께 반영', () => {
  const before = apply(seedState(), { type: 'SETTINGS', patch: { bonusPercent: 7 } });
  const after = apply(before, { type: 'CHARGE', amount: 10001, method: '간편결제' });
  assert.equal(after.wallet.paid, before.wallet.paid + 10001);
  assert.equal(after.wallet.bonus, before.wallet.bonus + 700);
  assert.equal(after.charges[0].bonus, 700);
  assert.equal(after.charges[0].method, '간편결제');
  assert.equal(after.members[0].points, after.wallet.paid + after.wallet.bonus);
  assert.equal(before.charges.length, 0, '이전 상태를 변경하지 않아야 함');
});

test('다중 개봉은 박스·상품 재고와 잔액을 정확히 차감', () => {
  const before = seedState();
  const after = apply(before, { type: 'PURCHASE', boxId: 1, quantity: 3, method: 'wallet' });
  assert.equal(after.boxes[0].left, before.boxes[0].left - 3);
  assert.equal(after.products.find(p => p.id === 'p5').stock, before.products.find(p => p.id === 'p5').stock - 3);
  assert.equal(after.wallet.paid + after.wallet.bonus, before.wallet.paid + before.wallet.bonus - 29700);
  assert.equal(after.lastResults.length, 3);
  assert.equal(after.inventory.length, before.inventory.length + 3);
  assert.equal(after.openings.length, 3);
  assert.equal(new Set(after.lastResults.map(item => item.id)).size, 3);
  assert.equal(before.boxes[0].left, 200);
});

test('잔액·박스 재고 부족은 거래 전체를 변경 없이 거절', () => {
  for (const reason of ['balance', 'stock']) {
    const state = seedState();
    if (reason === 'balance') state.wallet = { paid: 0, bonus: 0 };
    else state.boxes[0].left = 1;
    const snapshot = structuredClone(state);
    assert.equal(transition(state, { type: 'PURCHASE', boxId: 1, quantity: 2, method: 'wallet' }).ok, false);
    assert.deepEqual(state, snapshot);
  }
});

test('개봉 수량은 1~10의 정수만 허용', () => {
  for (const quantity of [0, -1, 1.5, 11, Infinity]) {
    assert.equal(transition(seedState(), { type: 'PURCHASE', boxId: 1, quantity, method: 'wallet' }).ok, false, `잘못된 수량: ${quantity}`);
  }
});

test('판매중지 박스는 결제 불가', () => {
  const state = seedState();
  state.boxes[0].status = '판매 중지';
  assert.equal(transition(state, { type: 'PURCHASE', boxId: 1, quantity: 1, method: 'card' }).ok, false);
});

test('환불은 수수료를 계산하며 같은 상품·승인을 중복 처리하지 않음', () => {
  const before = apply(seedState(), { type: 'SETTINGS', patch: { refundFeePercent: 15 } });
  const after = apply(before, { type: 'REFUND', inventoryId: 'sample-item' });
  assert.equal(after.refunds[0].gross, 189000);
  assert.equal(after.refunds[0].fee, 28350);
  assert.equal(after.refunds[0].net, 160650);
  assert.equal(after.wallet.paid, before.wallet.paid + 160650);
  assert.equal(after.inventory[0].status, '환불 완료');
  assert.equal(transition(after, { type: 'REFUND', inventoryId: 'sample-item' }).ok, false);
  assert.equal(transition(after, { type: 'APPROVE_REFUND', id: after.refunds[0].id }).ok, false);
});

test('배송 신청한 상품은 다시 배송·환불 불가', () => {
  const state = apply(seedState(), { type: 'SHIP', ids: ['sample-item'] });
  assert.equal(state.inventory[0].status, '배송 요청');
  assert.equal(state.orders[0].total, state.settings.shippingFee);
  assert.equal(transition(state, { type: 'REFUND', inventoryId: 'sample-item' }).ok, false);
  assert.equal(transition(state, { type: 'SHIP', ids: ['sample-item'] }).ok, false);
});

test('충전 취소는 원금과 보너스를 함께 회수하고 중복 금지', () => {
  const before = seedState();
  const charged = apply(before, { type: 'CHARGE', amount: 50000 });
  const after = apply(charged, { type: 'CANCEL_CHARGE', id: charged.charges[0].id });
  assert.deepEqual(after.wallet, before.wallet);
  assert.equal(after.charges[0].status, '취소 완료');
  assert.equal(transition(after, { type: 'CANCEL_CHARGE', id: after.charges[0].id }).ok, false);
});

test('사용한 충전 원금 또는 보너스가 부족하면 충전 취소 거절', () => {
  const state = apply(seedState(), { type: 'CHARGE', amount: 50000 });
  state.wallet.bonus = 0;
  assert.equal(transition(state, { type: 'CANCEL_CHARGE', id: state.charges[0].id }).ok, false);
});

test('확률합계 오류·음수·비정상값·뒤집힌 금액구간은 개봉 거절', () => {
  for (const change of [
    tiers => { tiers[0].probability = 1; },
    tiers => { tiers[0].probability = -1; tiers[3].probability = 81.5; },
    tiers => { tiers[0].probability = NaN; },
    tiers => { tiers[0].min = 2000000; tiers[0].max = 1000000; },
  ]) {
    const state = seedState();
    change(state.boxes[0].tiers);
    assert.equal(transition(state, { type: 'PURCHASE', boxId: 1, quantity: 1, method: 'card' }).ok, false);
  }
});

test('관리자 가격·확률 설정값이 실제 데모 구매 결과에 반영', () => {
  let state = seedState();
  const boxes = structuredClone(state.boxes);
  boxes[0].price = 12345;
  boxes[0].tiers.forEach(tier => { tier.probability = tier.id === 'S' ? 100 : 0; });
  state = apply(state, { type: 'UPDATE', key: 'boxes', value: boxes });
  const after = apply(state, { type: 'PURCHASE', boxId: 1, quantity: 1, method: 'wallet' });
  assert.equal(after.lastResults[0].grade, 'S');
  assert.equal(after.lastResults[0].name, '프리미엄 노트북');
  assert.equal(after.orders[0].total, 12345);
  assert.equal(after.wallet.paid + after.wallet.bonus, state.wallet.paid + state.wallet.bonus - 12345);
});

test('관리자 배송비·충전상품 설정 저장', () => {
  const state = apply(seedState(), { type: 'SETTINGS', patch: { shippingFee: 4500, chargeOptions: [20000, 40000] } });
  assert.deepEqual(state.settings.chargeOptions, [20000, 40000]);
  assert.equal(apply(state, { type: 'SHIP', ids: ['sample-item'] }).orders[0].total, 4500);
});

test('관리자 수수료·보너스·배송비 설정은 유효한 금액만 허용', () => {
  for (const patch of [{ refundFeePercent: -1 }, { refundFeePercent: 101 }, { bonusPercent: -1 }, { bonusPercent: NaN }, { shippingFee: -100 }, { chargeOptions: [-100] }]) {
    assert.equal(transition(seedState(), { type: 'SETTINGS', patch }).ok, false, `잘못된 설정: ${JSON.stringify(patch)}`);
  }
});

test('음수·0·비정상 포인트샵 교환은 지갑을 변경할 수 없음', () => {
  for (const amount of [-100, 0, NaN, Infinity]) {
    const state = seedState();
    const snapshot = structuredClone(state);
    assert.equal(transition(state, { type: 'REDEEM', amount, name: '테스트 상품' }).ok, false, `잘못된 교환금액: ${amount}`);
    assert.deepEqual(state, snapshot);
  }
});

test('출석 보상은 중복 수령 불가', () => {
  const before = seedState();
  const after = apply(before, { type: 'REWARD' });
  assert.equal(after.wallet.bonus, before.wallet.bonus + 100);
  assert.equal(transition(after, { type: 'REWARD' }).ok, false);
});

test('저장된 상태 복원과 손상 데이터 초기화', () => {
  const state = seedState();
  const storage = { getItem: key => { assert.equal(key, STORAGE_KEY); return JSON.stringify(state); } };
  assert.deepEqual(loadState(storage), state);
  assert.equal(loadState({ getItem: () => '{broken' }).version, 2);
  assert.equal(loadState({ getItem: () => null }).version, 2);
});

test('승인형 환불은 승인 전 잔액 동결, 승인 후 한 번만 반영', () => {
  const before = apply(seedState(), { type: 'SETTINGS', patch: { refundApprovalRequired: true } });
  const pending = apply(before, { type: 'REFUND', inventoryId: 'sample-item' });
  assert.equal(pending.refunds[0].status, '승인 대기');
  assert.equal(pending.inventory[0].status, '환불 대기');
  assert.deepEqual(pending.wallet, before.wallet);
  assert.equal(transition(pending, { type: 'REFUND', inventoryId: 'sample-item' }).ok, false);
  assert.equal(transition(pending, { type: 'SHIP', ids: ['sample-item'] }).ok, false);
  const after = apply(pending, { type: 'APPROVE_REFUND', id: pending.refunds[0].id });
  assert.equal(after.wallet.paid, before.wallet.paid + pending.refunds[0].net);
  assert.equal(after.inventory[0].status, '환불 완료');
  assert.equal(transition(after, { type: 'APPROVE_REFUND', id: after.refunds[0].id }).ok, false);
  assert.equal(transition(after, { type: 'REJECT_REFUND', id: after.refunds[0].id }).ok, false);
});

test('환불 반려는 상품을 보관 상태로 복구하고 잔액을 지급하지 않음', () => {
  const before = apply(seedState(), { type: 'SETTINGS', patch: { refundApprovalRequired: true } });
  const pending = apply(before, { type: 'REFUND', inventoryId: 'sample-item' });
  const after = apply(pending, { type: 'REJECT_REFUND', id: pending.refunds[0].id, reason: '요청 철회' });
  assert.equal(after.refunds[0].status, '반려');
  assert.equal(after.refunds[0].reason, '요청 철회');
  assert.equal(after.inventory[0].status, '보관 중');
  assert.deepEqual(after.wallet, before.wallet);
  assert.equal(transition(after, { type: 'APPROVE_REFUND', id: after.refunds[0].id }).ok, false);
  assert.equal(transition(after, { type: 'REJECT_REFUND', id: after.refunds[0].id }).ok, false);
  assert.equal(transition(after, { type: 'SHIP', ids: ['sample-item'] }).ok, true);
});

test('관리자 회원 포인트 조정은 원장·잔액에 반영되며 초과차감 금지', () => {
  const before = seedState();
  const after = apply(before, { type: 'ADJUST_POINTS', memberId: 'demo-member', amount: 1000, reason: '고객 보상' });
  assert.equal(after.wallet.paid, before.wallet.paid + 1000);
  assert.equal(after.members[0].points, before.members[0].points + 1000);
  assert.equal(after.ledger[0].reason, '고객 보상');
  assert.equal(transition(after, { type: 'ADJUST_POINTS', memberId: 'demo-member', amount: -1000000 }).ok, false);
});

test('다른 회원 포인트 조정은 시연회원 지갑을 변경하지 않음', () => {
  const before = seedState();
  before.members.push({ id: 'member-2', name: '다른 회원', points: 5000 });
  const after = apply(before, { type: 'ADJUST_POINTS', memberId: 'member-2', amount: -2000, reason: '차감' });
  assert.deepEqual(after.wallet, before.wallet);
  assert.equal(after.members.find(m => m.id === 'member-2').points, 3000);
  assert.equal(after.members.find(m => m.id === 'demo-member').points, before.members[0].points);
  assert.equal(after.ledger[0].memberId, 'member-2');
  assert.equal(transition(after, { type: 'ADJUST_POINTS', memberId: 'member-2', amount: -3001 }).ok, false);
  assert.equal(transition(after, { type: 'ADJUST_POINTS', memberId: 'missing', amount: 1000 }).ok, false);
});

test('개봉 기록은 당시 확률표를 보존하고 이후 설정 변경과 분리', () => {
  const opened = apply(seedState(), { type: 'PURCHASE', boxId: 1, quantity: 1, method: 'card' });
  assert.deepEqual(opened.openings[0].probabilitySnapshot, opened.boxes[0].tiers);
  assert.equal(opened.openings[0].probability, 80);
  const boxes = structuredClone(opened.boxes);
  boxes[0].tiers[0].probability = 1;
  boxes[0].tiers[3].probability = 79.5;
  const updated = apply(opened, { type: 'UPDATE', key: 'boxes', value: boxes });
  assert.equal(updated.boxes[0].tiers[3].probability, 79.5);
  assert.equal(updated.openings[0].probabilitySnapshot[3].probability, 80);
});
