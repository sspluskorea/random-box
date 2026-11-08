import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,transition,loadState,STORAGE_KEY} from '../src/demoStore.js';
import {securityDefaults} from '../src/securityModel.js';
import {inspectStorage,commitBrowserAction} from '../src/browserStateStore.js';
const apply=(s,a)=>{const r=transition(s,a,()=>0.99);assert.equal(r.ok,true,r.error);return r.state;};
const reject=(s,a)=>{const copy=structuredClone(s);assert.equal(transition(s,a).ok,false);assert.deepEqual(s,copy);};
const memory=initial=>{let raw=initial;return {getItem:()=>raw,setItem:(_,v)=>raw=v,value:()=>raw};};
const withOffer=()=>{let s=seedState();s.platform.campaigns=[];s=apply(s,{type:'PURCHASE',boxId:7,method:'wallet'});const item=s.lastResults[0];s.products.find(p=>p.id===item.productId).stock=0;s=apply(s,{type:'OFFER_SUBSTITUTION',inventoryId:item.id,productId:'p1',reason:'품절 대체'});return s;};

test('독립 강화: 중첩 저장 구조 손상은 원본을 보존하고 모든 거래를 차단',()=>{
 for(const [scope,key,value]of [['platform','pityClaims','broken'],['platform','rewardCategories',{}],['platform','requests',{}],['content','notifications',{}],['platform','rewardRules',[]]]){
  const s=seedState();s[scope][key]=value;const raw=JSON.stringify(s),storage=memory(raw);
  assert.equal(inspectStorage(storage,STORAGE_KEY,loadState).ok,false,scope+'.'+key);assert.equal(commitBrowserAction(storage,STORAGE_KEY,seedState(),{type:'CHARGE',amount:1000},transition,loadState).ok,false);assert.equal(storage.value(),raw);
 }
});
test('독립 강화: 저장 직전 다른 탭 변경은 동일 revision이라도 덮어쓰지 않음',()=>{
 const s=seedState(),raw=JSON.stringify(s),other=JSON.stringify({...s,revision:1});let reads=0,writes=0;
 const storage={getItem:()=>++reads===1?raw:other,setItem:()=>writes++};const r=commitBrowserAction(storage,STORAGE_KEY,s,{type:'CHARGE',amount:1000},transition,loadState);
 assert.equal(r.ok,false);assert.equal(writes,0);assert.equal(s.charges.length,0);
});
test('독립 강화: 엄격 배송 동의가 모두 실제 true일 때만 처리하고 거래 당시 안내 보존',()=>{
 let s=seedState();const settings={...structuredClone(securityDefaults),strictConsents:true,thirdParty:{enabled:true,recipient:'계약 택배사',purpose:'배송',items:'이름 연락처 주소',retention:'배송 후 30일'}};
 s=apply(s,{type:'SAVE_SECURITY_SETTINGS',settings,reason:'동의 검수'});
 for(const address of [{},{deliveryConsent:true},{deliveryConsent:'true',thirdPartyConsent:true},{deliveryConsent:true,thirdPartyConsent:1}])reject(s,{type:'SHIP',ids:['sample-item'],address});
 s=apply(s,{type:'SHIP',ids:['sample-item'],address:{deliveryConsent:true,thirdPartyConsent:true}});const original=structuredClone(s.orders[0]);
 s=apply(s,{type:'SAVE_SECURITY_SETTINGS',settings:{...settings,thirdParty:{...settings.thirdParty,recipient:'변경 업체'}},reason:'계약 변경'});assert.deepEqual(s.orders[0],original);
});
test('독립 강화: 동적 보상 매핑의 등급과 카테고리가 다르면 등록 및 복원 후 지급 거절',()=>{
 let s=seedState();s.platform.campaigns=[];s=apply(s,{type:'CHARGE',amount:10000000});
 reject(s,{type:'SAVE_REWARD_MAPPING',grade:'B',categoryId:'women',productId:'reward-B-men',reason:'잘못된 분류'});
 s.platform.rewardMappings.B.women='reward-B-men';reject(s,{type:'CLAIM_PITY',grade:'B',category:'women'});
});
test('독립 강화: 비활성 카테고리는 새 매핑과 수령 불가이며 기존 지급 이력은 보존',()=>{
 let s=seedState();s.platform.campaigns=[];s=apply(s,{type:'CHARGE',amount:10000000});s=apply(s,{type:'CLAIM_PITY',grade:'B',category:'men'});const old=structuredClone(s.platform.pityClaims);
 s=apply(s,{type:'SAVE_REWARD_CATEGORY',category:{id:'men',name:'남성 명품',enabled:false},reason:'일시 중단'});reject(s,{type:'SAVE_REWARD_MAPPING',grade:'B',categoryId:'men',productId:'reward-B-men',reason:'중단된 분류'});s=apply(s,{type:'CHARGE',amount:10000000});reject(s,{type:'CLAIM_PITY',grade:'B',category:'men'});assert.deepEqual(s.platform.pityClaims,old);
});
test('독립 강화: 대체 제안 수락 재전송은 재고를 한 번만 차감하고 원거래를 보존',()=>{
 let s=withOffer();const offer=s.substitutions[0],id=offer.inventoryId,item=structuredClone(s.inventory.find(i=>i.id===id)),opening=structuredClone(s.openings[0]),stock=s.products.find(p=>p.id===offer.productId).stock;
 s.products.find(p=>p.id===offer.productId).name='제안 후 변경된 카탈로그 이름';
 s=apply(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:true,requestId:'sub-once'});assert.equal(s.products.find(p=>p.id===offer.productId).stock,stock-1);assert.deepEqual(s.openings[0],opening);
 const current=s.inventory.find(i=>i.id===id);for(const key of ['productId','name','value','purchasePrice','cashAmountSnapshot','expiresAt'])assert.deepEqual(current[key],item[key]);assert.equal(current.deliveryProductId,offer.productId);
 reject(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:true,requestId:'sub-once'});reject(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:false});
 s=apply(s,{type:'SHIP',ids:[id]});assert.ok(s.orders[0].items.includes(offer.productName));
});
test('독립 강화: 기한 지난 대체 제안은 자동 점검 전에도 수락할 수 없음',()=>{
 const s=withOffer(),offer=s.substitutions[0];s.inventory.find(i=>i.id===offer.inventoryId).expiresAt=new Date(Date.now()-1000).toISOString();reject(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:true});
});
test('독립 강화: 대체 수락 후 캐시 전환은 대체 예약 재고를 반환하고 원전환액을 지급',()=>{
 let s=withOffer();const offer=s.substitutions[0],stock=s.products.find(p=>p.id===offer.productId).stock,item=s.inventory.find(i=>i.id===offer.inventoryId),expected=item.cashAmountSnapshot;
 s=apply(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:true});s=apply(s,{type:'CASH_CONVERT',inventoryId:item.id});assert.equal(s.products.find(p=>p.id===offer.productId).stock,stock);assert.equal(s.wallet.cash,expected);reject(s,{type:'CASH_CONVERT',inventoryId:item.id});
});
test('독립 강화: 일반 목록수정으로 재고상품 상태와 주문거래를 직접 덮어쓸 수 없음',()=>{
 const s=seedState();for(const key of ['inventory','orders','logs'])reject(s,{type:'UPDATE',key,value:[]});
});
test('독립 강화: 중첩 기록의 null 행과 불완전한 등급 규칙도 복원 전에 거절',()=>{
 for(const [scope,key,value]of [['platform','pityClaims',[null]],['platform','requests',[null]],['content','notifications',[null]],['platform','rewardRules',{}]]){
  const s=seedState();s[scope][key]=value;const storage=memory(JSON.stringify(s));assert.equal(inspectStorage(storage,STORAGE_KEY,loadState).ok,false,scope+'.'+key);
 }
 const s=seedState();s.substitutions=[null];assert.equal(inspectStorage(memory(JSON.stringify(s)),STORAGE_KEY,loadState).ok,false);
 for(const patch of [{content:[]},{settings:[]},{revision:-1},{revision:'invalid'}]){const state={...seedState(),...patch};assert.equal(inspectStorage(memory(JSON.stringify(state)),STORAGE_KEY,loadState).ok,false);}
});
test('독립 강화: 대체 수락 후 포인트 전환과 복원은 예약 재고를 반환하고 한 번 재예약',()=>{
 let s=withOffer();const offer=s.substitutions[0],stock=s.products.find(p=>p.id===offer.productId).stock;
 s=apply(s,{type:'RESPOND_SUBSTITUTION',id:offer.id,accept:true});s=apply(s,{type:'CONVERT_ITEM',inventoryId:offer.inventoryId});assert.equal(s.products.find(p=>p.id===offer.productId).stock,stock);
 const conversion=s.conversions[0];s=apply(s,{type:'RESTORE_ITEM',conversionId:conversion.id});assert.equal(s.products.find(p=>p.id===offer.productId).stock,stock-1);assert.equal(s.inventory.find(i=>i.id===offer.inventoryId).status,'보관 중');reject(s,{type:'RESTORE_ITEM',conversionId:conversion.id});
});
test('독립 강화: 수락한 대체 상품을 다시 대체하면 이전 예약 재고는 반환',()=>{
 let s=withOffer();const first=s.substitutions[0];s.products.find(p=>p.id===first.productId).stock=1;s=apply(s,{type:'RESPOND_SUBSTITUTION',id:first.id,accept:true});
 assert.equal(s.products.find(p=>p.id===first.productId).stock,0);s=apply(s,{type:'OFFER_SUBSTITUTION',inventoryId:first.inventoryId,productId:'p2',reason:'대체 공급 변경'});const second=s.substitutions[0];
 s=apply(s,{type:'RESPOND_SUBSTITUTION',id:second.id,accept:true});assert.equal(s.products.find(p=>p.id===first.productId).stock,1);assert.equal(s.inventory.find(i=>i.id===first.inventoryId).deliveryProductId,'p2');
});
test('독립 강화: 새 관리자 설정·대체 제안·동적 보상 화면을 실제 React로 렌더',async()=>{
 const {createServer}=await import('vite'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try {
  let state=withOffer();state=apply(state,{type:'SAVE_REWARD_CATEGORY',category:{id:'travel',name:'여행 용품',enabled:true},reason:'카테고리 추가'});
  const rewards=await server.ssrLoadModule('/src/RewardsAdmin.jsx'),safety=await server.ssrLoadModule('/src/OperationsSafetySettings.jsx'),substitute=await server.ssrLoadModule('/src/SubstitutionAdmin.jsx');
  for(const [Component,extra]of [[rewards.default,{mode:'pity'}],[rewards.default,{mode:'events'}],[rewards.default,{mode:'conversion'}],[rewards.default,{mode:'cash'}],[rewards.RewardConfiguration,{}],[safety.default,{}],[substitute.default,{}]]){
   const html=renderToStaticMarkup(createElement(Component,{state,dispatch:()=>({ok:false,error:'SSR only'}),...extra}));assert.ok(html.length>100);
  }
  const html=renderToStaticMarkup(createElement(rewards.RewardConfiguration,{state,dispatch:()=>({ok:true})}));assert.ok(html.includes('여행 용품'));
 }finally{await server.close();}
});
