import {seedContent} from './seedContent.js';
export const STORAGE_KEY = 'modu-meeting-v2';
const stamp = () => new Date().toISOString();
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const entry = (data) => ({id:id(),createdAt:stamp(),...data});
const validMoney = value => Number.isSafeInteger(Number(value)) && Number(value)>=0;
const validRate = value => Number.isFinite(Number(value)) && Number(value)>=0 && Number(value)<=100;
const conversionDefaults={conversionPercent:70,restoreWindowHours:24,restoreDailyLimit:5,shopEnabled:false,tradeEnabled:false,winnerFeedShowSamples:false};
export const kstDate=(time=Date.now())=>new Date(new Date(time).getTime()+9*3600000).toISOString().slice(0,10);
const addDays=(date,days)=>new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
const defaultPassPlans=()=>[{id:'nebula-pass',name:'네뷸라 30일 패스',boxId:1,price:9900,days:30,dailyReward:300,streakDays:6,streakReward:1000,makeupCostPercent:50,renewBeforeDays:7,status:'판매 중'}];
const validPass=p=>p&&['price','dailyReward','streakReward','renewBeforeDays'].every(k=>validMoney(p[k]))&&Number.isInteger(+p.days)&&+p.days>0&&+p.days<=366&&Number.isInteger(+p.streakDays)&&+p.streakDays>0&&validRate(p.makeupCostPercent);
function migrateMemberNames(state){
  const old=/^(미팅 고객|체험 회원|체험 고객|미팅 회원)$/;
  for(const member of [state.session,...(state.members||[])])if(member&&old.test(member.name))member.name='박스러버';
  for(const record of state.openings||[]){if(old.test(record.memberName))record.memberName='박스러버';if(record.source==='직접 시연')record.source='개봉 기록';}
  state.content={...state.content,passPlans:state.content?.passPlans||defaultPassPlans()};
  for(const key of ['notices','terms','events'])state.content[key]=(state.content[key]||[]).map(row=>{const original=seedContent[key]?.find(r=>r.id===row.id);return original&&/미팅|시연/.test(JSON.stringify(row))?structuredClone(original):row;});
  return state;
}
function validTiers(tiers) {
  if(!Array.isArray(tiers)||!tiers.length||Math.abs(tiers.reduce((sum,t)=>sum+Number(t.probability),0)-100)>0.00001)return false;
  if(tiers.some(t=>!validRate(t.probability)||!validMoney(t.min)||!validMoney(t.max)||Number(t.min)>Number(t.max)))return false;
  const active=tiers.filter(t=>Number(t.probability)>0).sort((a,b)=>Number(a.min)-Number(b.min));
  return !active.some((t,i)=>i>0&&Number(t.min)<=Number(active[i-1].max));
}
export function seedState() {
  const names=['네뷸라 스타터 박스','스트리트 컬렉션 박스','라이프 스타일 박스','크리에이터 드림 박스','시그니처 럭셔리 박스','갤럭시 마스터 박스'];
  const prices=[9900,19900,29900,49900,79900,99900];
  return {version:2,session:null,selectedBoxId:1,checkoutQuantity:1,wallet:{paid:100000,bonus:3000},
    settings:{...conversionDefaults,refundFeePercent:10,refundApprovalRequired:false,shippingFee:3000,chargeOptions:[10000,30000,50000,100000,300000],bonusPercent:3},
    boxes:names.map((name,i)=>({id:i+1,name,price:prices[i],category:['테크','패션','라이프','테크','프리미엄','프리미엄'][i],image:`assets/box-${['tech','fashion','life'][i%3]}.png`,status:'판매 중',left:200-i*27,total:500,color:['blue','pink','gold'][i%3],tiers:[{id:'S',label:'S',min:500000,max:1000000,probability:0.5},{id:'A',label:'A',min:100000,max:499999,probability:4.5},{id:'B',label:'B',min:30000,max:99999,probability:15},{id:'C',label:'C',min:1000,max:29999,probability:80}]})),
    products:[{id:'p1',name:'프리미엄 노트북',value:899000,stock:20,category:'테크'},{id:'p2',name:'무선 노이즈캔슬링 헤드폰',value:189000,stock:90,category:'테크'},{id:'p3',name:'프리미엄 스니커즈',value:129000,stock:70,category:'패션'},{id:'p4',name:'무드 테이블 램프',value:79000,stock:80,category:'라이프'},{id:'p5',name:'모바일 상품권 1만원',value:10000,stock:1000,category:'상품권'}],
    members:[{id:'demo-member',name:'박스러버',email:'demo@example.com',status:'정상',points:103000}],
    inventory:[{id:'sample-item',name:'무선 노이즈캔슬링 헤드폰',value:189000,purchasePrice:189000,paymentMethod:'card',memberId:'demo-member',grade:'A',status:'보관 중',boxId:1,image:'assets/box-tech.png',createdAt:stamp()}],
    conversions:[],charges:[],openings:[],lastResults:[],refunds:[],orders:[],ledger:[],logs:[],content:{...structuredClone(seedContent),passPlans:defaultPassPlans(),coupons:[{id:'welcome',name:'웰컴 쿠폰',value:'10%',status:'사용 가능'}],inquiries:[],posts:[],trades:[],notifications:[],attendance:[],gifts:[],subscriptions:[]}};
}
export function loadState(storage) {try {const value=JSON.parse(storage.getItem(STORAGE_KEY));if(value?.version!==2||!value.wallet||!validMoney(value.wallet.paid)||!validMoney(value.wallet.bonus)||!['boxes','products','members','inventory','charges','openings','orders','refunds','ledger','logs'].every(k=>Array.isArray(value[k])))return seedState();return migrateMemberNames({...value,conversions:value.conversions||[],settings:{...conversionDefaults,...value.settings},content:{...structuredClone(seedContent),...value.content}})}catch{return seedState()}}
const fail = error => ({ok:false,error});
export function transition(previous, action, random=Math.random) {
  let s=migrateMemberNames(structuredClone(previous)); const a=action; const memberId=s.session?.id||'demo-member';s.conversions||=[];s.settings={...conversionDefaults,...s.settings};
  const ledger=(type,amount)=>s.ledger.unshift(entry({type,amount,memberId}));
  const finish=()=>{if(!validMoney(s.wallet.paid)||!validMoney(s.wallet.bonus)||!Number.isSafeInteger(s.wallet.paid+s.wallet.bonus))return fail('지갑 금액이 유효한 범위를 벗어났습니다.');s.members=s.members.map(m=>m.id===memberId?{...m,points:s.wallet.paid+s.wallet.bonus}:m);s.logs.unshift(entry({action:a.type,memberId}));return {ok:true,state:s}};
  if(['EXCHANGE_REQUEST','UPDATE_EXCHANGE','ACCEPT_EXCHANGE','PAY_EXCHANGE'].includes(a.type)){
    s.content.exchangeRequests||=[];
    if(a.type==='EXCHANGE_REQUEST'){
      const f=a.fields||{};s.content.exchangeRequests.unshift(entry({memberId,memberName:s.session?.name||'박스러버',name:f.name||'등록 상품',category:f.category||'기타',condition:f.condition||'상태 확인 필요',description:f.description||'',contact:f.contact||'',status:'견적 요청',offerAmount:0}));return finish();
    }
    const request=s.content.exchangeRequests.find(r=>r.id===a.id);if(!request)return fail('물품 매입 신청을 찾을 수 없습니다.');
    if(a.type==='ACCEPT_EXCHANGE'){
      if(request.memberId!==memberId||request.status!=='견적 안내'||!validMoney(request.offerAmount)||+request.offerAmount<=0)return fail('수락 가능한 본인 견적을 확인해 주세요.');request.status='견적 수락';request.acceptedAt=stamp();return finish();
    }
    if(a.type==='PAY_EXCHANGE'){
      if(request.status!=='검수 완료'||request.paidAt||!validMoney(request.offerAmount)||+request.offerAmount<=0)return fail('검수 완료된 유효 견적만 지급할 수 있습니다.');
      const member=s.members.find(m=>m.id===request.memberId);if(!member)return fail('지급 대상 회원을 찾을 수 없습니다.');
      const amount=Number(request.offerAmount);if(request.memberId===memberId)s.wallet.bonus+=amount;else {if(!validMoney(Number(member.points||0)+amount))return fail('회원 잔액을 확인해 주세요.');member.points=Number(member.points||0)+amount;}
      request.status='지급 완료';request.paidAt=stamp();s.ledger.unshift(entry({type:'물품 매입 포인트 지급',amount,memberId:request.memberId,exchangeId:request.id}));return finish();
    }
    if(['지급 완료','반려'].includes(request.status))return fail('완료된 매입 신청은 변경할 수 없습니다.');
    const patch=a.patch||{};if(patch.offerAmount!=null&&(!validMoney(patch.offerAmount)||+patch.offerAmount<=0))return fail('견적 금액은 0보다 큰 정수로 입력해 주세요.');
    if(request.acceptedAt&&patch.offerAmount!=null&&Number(patch.offerAmount)!==Number(request.offerAmount))return fail('수락한 견적 금액은 변경할 수 없습니다.');
    const allowed={'견적 요청':['견적 안내','반려'],'견적 안내':['견적 안내','반려'],'견적 수락':['발송','검수 중','반려'],'발송':['검수 중','반려'],'검수 중':['검수 완료','반려'],'검수 완료':['검수 완료','반려']};
    if(patch.status&&patch.status!==request.status&&!allowed[request.status]?.includes(patch.status))return fail('매입 처리 순서에 맞는 상태를 선택해 주세요.');
    if(patch.status==='견적 안내'&&Number(patch.offerAmount??request.offerAmount)<=0)return fail('안내할 견적 금액을 입력해 주세요.');
    for(const key of ['offerAmount','status','tracking','answer'])if(patch[key]!=null)request[key]=key==='offerAmount'?Number(patch[key]):String(patch[key]);request.updatedAt=stamp();return finish();
  }
  if(['BUY_PASS','CLAIM_PASS','MAKEUP_PASS','RENEW_PASS','CANCEL_PASS'].includes(a.type)){
    const today=kstDate();s.content.subscriptions||=[];
    const pay=(amount,method,label)=>{if(!validMoney(amount)||!['card','wallet'].includes(method))return false;if(method==='wallet'){if(s.wallet.paid+s.wallet.bonus<amount)return false;const bonus=Math.min(s.wallet.bonus,amount);s.wallet.bonus-=bonus;s.wallet.paid-=amount-bonus;ledger(label,-amount);}return true;};
    if(a.type==='BUY_PASS'){
      const plan=s.content.passPlans.find(p=>p.id===a.planId),box=s.boxes.find(b=>String(b.id)===String(plan?.boxId));
      if(!validPass(plan)||plan.status!=='판매 중'||!box||!validMoney(box.price))return fail('구매 가능한 패스를 선택해 주세요.');
      if(s.content.subscriptions.some(p=>p.memberId===memberId&&p.planId===plan.id&&p.endDate>=today))return fail('이미 이용 중인 패스입니다. 만료일이 가까워지면 연장할 수 있습니다.');
      const method=a.method||'card';if(!pay(Number(plan.price),method,'패스 구매'))return fail('결제 수단 또는 포인트 잔액을 확인해 주세요.');
      const subscription=entry({memberId,planId:plan.id,name:plan.name,planSnapshot:structuredClone(plan),boxPrice:Number(box.price),startDate:today,endDate:addDays(today,Number(plan.days)-1),status:'이용 중',amount:Number(plan.price),method,claims:[],renewals:[]});s.content.subscriptions.unshift(subscription);s.orders.unshift(entry({subscriptionId:subscription.id,items:[plan.name],total:Number(plan.price),status:'패스 구매 완료',method,memberId}));return finish();
    }
    const sub=s.content.subscriptions.find(p=>p.id===a.subscriptionId&&p.memberId===memberId);
    if(!sub||!validPass(sub.planSnapshot)||!sub.endDate||!sub.startDate)return fail('패스 이용 내역을 확인해 주세요.');
    const plan=sub.planSnapshot;sub.claims||=[];sub.renewals||=[];
    if(a.type==='CANCEL_PASS'){if(sub.status==='해지 예약'||sub.endDate<today)return fail('이미 종료되었거나 해지 예약된 패스입니다.');sub.status='해지 예약';sub.cancelledAt=stamp();return finish();}
    if(a.type==='RENEW_PASS'){
      const current=s.content.passPlans.find(p=>p.id===sub.planId);if(!validPass(current)||current.status!=='판매 중')return fail('현재 판매 중인 패스만 연장할 수 있습니다.');
      if(sub.endDate<today||today<addDays(sub.endDate,-Number(current.renewBeforeDays)))return fail('연장 가능 기간이 아닙니다. 만료 후에는 새로 구매해 주세요.');
      if(!pay(Number(current.price),a.method||'card','패스 연장'))return fail('결제 수단 또는 포인트 잔액을 확인해 주세요.');
      const startDate=addDays(sub.endDate,1),endDate=addDays(sub.endDate,Number(current.days));sub.renewals.push(entry({startDate,endDate,amount:Number(current.price),planSnapshot:structuredClone(current)}));sub.endDate=endDate;sub.status='이용 중';s.orders.unshift(entry({subscriptionId:sub.id,items:[sub.name+' 연장'],total:Number(current.price),status:'패스 연장 완료',method:a.method||'card',memberId}));return finish();
    }
    if(today<sub.startDate||today>sub.endDate)return fail('패스 이용 기간이 아닙니다.');
    const date=a.type==='CLAIM_PASS'?today:a.date;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||addDays(date,0)!==date||date<sub.startDate||date>sub.endDate||(a.type==='MAKEUP_PASS'&&date>=today))return fail('이용 기간 내 지난 미출석 날짜를 선택해 주세요.');
    if(sub.claims.some(c=>c.date===date))return fail('이미 출석 보상을 받은 날짜입니다.');
    const activePlan=sub.renewals.find(r=>date>=r.startDate&&date<=r.endDate)?.planSnapshot||plan;
    const cost=a.type==='MAKEUP_PASS'?Math.round(sub.boxPrice*Number(activePlan.makeupCostPercent)/100):0;
    if(cost&&!pay(cost,a.method||'wallet','패스 보충 출석'))return fail('보충 출석에 필요한 포인트가 부족합니다.');
    const reward=Number(activePlan.dailyReward);const record=entry({date,type:a.type==='CLAIM_PASS'?'출석':'보충 출석',reward,streakReward:0,cost});sub.claims.push(record);
    // Completed streak blocks are rewarded once, including when a missed day is made up later.
    sub.streakRewards||=[];const attended=new Set(sub.claims.map(c=>c.date));let streakReward=0;
    const segments=[{startDate:sub.startDate,endDate:sub.renewals[0]?addDays(sub.renewals[0].startDate,-1):sub.endDate,planSnapshot:plan},...sub.renewals];
    for(const segment of segments){const p=segment.planSnapshot;for(let start=segment.startDate;addDays(start,Number(p.streakDays)-1)<=segment.endDate&&addDays(start,Number(p.streakDays)-1)<=today;start=addDays(start,Number(p.streakDays))){const key=start+':'+p.streakDays;if(!sub.streakRewards.some(r=>r.key===key)&&Array.from({length:Number(p.streakDays)},(_,i)=>addDays(start,i)).every(d=>attended.has(d))){const amount=Number(p.streakReward);streakReward+=amount;sub.streakRewards.push(entry({key,amount}));}}}
    record.streakReward=streakReward;s.wallet.bonus+=reward+streakReward;ledger('패스 출석 보상',reward);if(streakReward)ledger('패스 연속 출석 보상',streakReward);return finish();
  }
  if(a.type==='RESET')return {ok:true,state:seedState()};
  if(a.type==='LOG'){s.logs.unshift(entry({action:String(a.action||'관리자 작업'),memberId}));return {ok:true,state:s};}
  if(a.type==='UPDATE_ORDER'){
    const order=s.orders.find(o=>o.id===a.id),patch=a.patch||{};
    if(!order?.inventoryIds?.length||order.address==='디지털 개봉')return fail('상품 배송 주문만 변경할 수 있습니다.');
    const statuses=['배송 요청','상품 준비 중','배송 준비','배송 중','배송 완료','배송 취소'];
    if(patch.status&&!statuses.includes(patch.status))return fail('배송 상태를 확인해 주세요.');
    if(['배송 완료','배송 취소'].includes(order.status)&&patch.status&&patch.status!==order.status)return fail('종료된 배송 주문의 상태를 되돌릴 수 없습니다.');
    if(patch.status==='배송 취소'&&order.status==='배송 중')return fail('배송 중인 상품은 바로 취소할 수 없습니다.');
    for(const key of ['status','address','carrier','tracking'])if(patch[key]!=null)order[key]=String(patch[key]);
    for(const item of s.inventory.filter(i=>order.inventoryIds.includes(i.id)))item.status=order.status==='배송 취소'?'보관 중':order.status;
    order.updatedAt=stamp();return finish();
  }
  if(a.type==='IMPORT_STATE'){
    const v=a.value;
    if(!v||v.version!==2||!v.wallet||!validMoney(v.wallet.paid)||!validMoney(v.wallet.bonus)||!['boxes','products','members','inventory','charges','openings','orders','refunds','ledger','logs'].every(k=>Array.isArray(v[k]))||!v.content||!v.settings)return fail('올바른 백업 파일이 아닙니다.');
    if(v.boxes.some(b=>!validMoney(b.price)||+b.price<=0||!validMoney(b.left)||!validTiers(b.tiers))||v.products.some(p=>!validMoney(p.stock)||!validMoney(p.value)))return fail('백업의 가격·재고·확률 정보가 올바르지 않습니다.');
    s=structuredClone(v);s.conversions||=[];s.settings={...conversionDefaults,...s.settings};return finish();
  }
  if(a.type==='UPDATE'){
    if(a.key==='content'&&a.value?.passPlans&&(!Array.isArray(a.value.passPlans)||a.value.passPlans.some(p=>!validPass(p)||!s.boxes.some(b=>String(b.id)===String(p.boxId)))))return fail('패스 기간·금액·보상·연결 박스 설정을 확인해 주세요.');
    if(!['boxes','products','members','inventory','orders','logs','content','selectedBoxId','checkoutQuantity'].includes(a.key))return fail('전용 거래 기능으로 변경해 주세요.');
    if(a.key==='boxes'&&(!Array.isArray(a.value)||a.value.some(b=>!validMoney(b.price)||Number(b.price)<=0||!validMoney(b.left)||!validTiers(b.tiers))))return fail('박스 가격·재고·확률 합계와 겹치는 금액 구간을 확인해 주세요.');
    if(a.key==='products'&&(!Array.isArray(a.value)||a.value.some(p=>!validMoney(p.value)||Number(p.value)<=0||!validMoney(p.stock))))return fail('상품 금액과 재고는 올바른 정수로 입력해 주세요.');
    s[a.key]=structuredClone(a.value);return finish();
  }
  if(a.type==='SETTINGS'){const patch={...(a.patch||{})};for(const key of ['refundFeePercent','bonusPercent','conversionPercent'])if(patch[key]!=null){if(!validRate(patch[key]))return fail('비율은 0~100%로 입력해 주세요.');patch[key]=Number(patch[key]);}for(const key of ['shippingFee','freeShippingThreshold','restoreWindowHours','restoreDailyLimit'])if(patch[key]!=null){if(!validMoney(patch[key]))return fail('금액과 제한은 0 이상의 정수로 입력해 주세요.');patch[key]=Number(patch[key]);}if(patch.chargeOptions){if(!Array.isArray(patch.chargeOptions)||!patch.chargeOptions.length||patch.chargeOptions.some(v=>!validMoney(v)||+v<=0))return fail('충전 금액은 0보다 큰 정수여야 합니다.');patch.chargeOptions=patch.chargeOptions.map(Number);}s.settings={...s.settings,...patch};return finish()}
  if(['LOGIN','SIGNUP'].includes(a.type)){const member=s.members.find(m=>m.id==='demo-member');s.session={id:'demo-member',name:a.fields?.name||'박스러버',email:a.fields?.email||'demo@example.com',phone:a.fields?.phone||member?.phone||''};s.members=s.members.map(m=>m.id==='demo-member'?{...m,...s.session}:m);return finish()}
  if(a.type==='LOGOUT'){s.session=null;return finish()}
  if(a.type==='ADJUST_POINTS'){const member=s.members.find(m=>m.id===a.memberId),amount=Number(a.amount);if(!member||!Number.isSafeInteger(amount)||!validMoney(Number(member.points||0)+amount))return fail('회원 또는 조정 금액을 확인해 주세요.');if(member.id==='demo-member'){if(s.wallet.paid+amount<0)return fail('유상 잔액을 초과해 차감할 수 없습니다.');s.wallet.paid+=amount}else member.points=Number(member.points||0)+amount;s.ledger.unshift(entry({type:'관리자 포인트 조정',amount,memberId:a.memberId,reason:a.reason||'운영자 조정'}));return finish()}
  if(a.type==='PROFILE'){s.session={id:memberId,name:'박스러버',email:'demo@example.com',...s.session,...a.fields};s.members=s.members.map(m=>m.id===memberId?{...m,...s.session}:m);return finish()}
  if(a.type==='CHARGE'){const amount=Number(a.amount);if(!validMoney(amount)||amount<=0||!validRate(s.settings.bonusPercent))return fail('충전 금액과 보너스 설정을 확인해 주세요.');const bonus=Math.floor(amount*Number(s.settings.bonusPercent)/100);s.wallet.paid+=amount;s.wallet.bonus+=bonus;s.charges.unshift(entry({memberId,amount,bonus,method:a.method||'카드',status:'충전 완료'}));ledger('충전',amount);if(bonus)ledger('충전 보너스',bonus);return finish()}
  if(a.type==='PURCHASE'){
    const box=s.boxes.find(b=>String(b.id)===String(a.boxId));const quantity=Number(a.quantity??1);
    if(!box||box.status!=='판매 중')return fail('판매 중인 박스를 선택해 주세요.');
    if(!Number.isInteger(quantity)||quantity<1||quantity>10)return fail('개봉 수량은 1~10개입니다.');
    if(!Number.isFinite(Number(box.left))||box.left<quantity)return fail('박스 잔여 수량이 부족합니다.');
    const tiers=box.tiers||[];if(!validTiers(tiers)||!validMoney(box.price)||+box.price<=0)return fail('박스 가격과 확률 설정을 확인해 주세요.');
    if(!['wallet','card'].includes(a.method))return fail('결제 수단을 선택해 주세요.');
    const candidatesFor=t=>s.products.filter(p=>validMoney(p.stock)&&p.stock>0&&validMoney(p.value)&&p.value>=Number(t.min)&&p.value<=Number(t.max));
    if(tiers.some(t=>Number(t.probability)>0&&candidatesFor(t).reduce((sum,p)=>sum+Number(p.stock),0)<quantity))return fail('확률 구간의 상품 재고가 부족합니다. 상품 재고를 보충한 후 개봉해 주세요.');
    let total=Number(box.price)*quantity,discount=0;
    if(a.couponId){const coupon=(s.content.coupons||[]).find(c=>c.id===a.couponId);const expiry=coupon?.expiresAt||coupon?.endDate;const starts=coupon?.startsAt||coupon?.startDate;const raw=String(coupon?.value??coupon?.amount??'');const value=Number(raw.replace('%',''));if(!coupon||coupon.status!=='사용 가능'||coupon.usedAt||(expiry&&new Date(expiry).getTime()<Date.now())||(starts&&new Date(starts).getTime()>Date.now())||!Number.isFinite(value)||value<=0||Number(coupon.minAmount||0)>total)return fail('사용 가능한 쿠폰을 선택해 주세요.');discount=Math.min(total,coupon.type==='percent'||raw.includes('%')?Math.floor(total*Math.min(value,100)/100):Math.floor(value));coupon.status='사용 완료';coupon.usedAt=stamp();coupon.usedBy=memberId;total-=discount;}
    if(!validMoney(total))return fail('결제 금액을 확인해 주세요.');
    let bonusUsed=0;if(a.method==='wallet'){if(s.wallet.paid+s.wallet.bonus<total)return fail('포인트가 부족합니다. 충전 후 이용해 주세요.');bonusUsed=Math.min(s.wallet.bonus,total);s.wallet.bonus-=bonusUsed;s.wallet.paid-=total-bonusUsed;ledger('박스 구매',-total)}
    const orderId=id();let remainingBonus=bonusUsed;const results=[];
    for(let i=0;i<quantity;i++){const draw=random();if(!Number.isFinite(draw)||draw<0||draw>=1)return fail('추첨 값을 확인해 주세요.');let n=draw*100;const tier=tiers.find(t=>(n-=Number(t.probability))<0);if(!tier)return fail('확률 설정을 확인해 주세요.');const candidates=candidatesFor(tier),pick=random();if(!Number.isFinite(pick)||pick<0||pick>=1)return fail('추첨 값을 확인해 주세요.');const product=candidates[Math.floor(pick*candidates.length)];if(!product)return fail('당첨 상품 재고가 부족합니다.');product.stock--;const value=Number(product.value),purchasePrice=Math.floor(total/quantity)+(i<total%quantity?1:0),itemBonus=Math.min(remainingBonus,purchasePrice);remainingBonus-=itemBonus;const item=entry({name:product.name,productId:product.id,value,purchasePrice,paymentMethod:a.method,paidUsed:a.method==='wallet'?purchasePrice-itemBonus:0,bonusUsed:itemBonus,orderId,grade:tier.label,status:'보관 중',boxId:box.id,image:product.image||box.image,memberId});results.push(item);s.openings.unshift(entry({inventoryId:item.id,orderId,productId:product.id,boxId:box.id,boxName:box.name,price:box.price,productName:item.name,value,grade:item.grade,memberId,memberName:s.session?.name||'박스러버',probability:Number(tier.probability),probabilitySnapshot:structuredClone(tiers),source:'개봉 기록'}));}
    box.left-=quantity;s.inventory.unshift(...results);s.lastResults=results;s.orders.unshift(entry({id:orderId,items:[`${box.name} × ${quantity}`],inventoryIds:results.map(i=>i.id),total,discount,couponId:a.couponId||null,status:'개봉 완료',method:a.method,memberId,address:'디지털 개봉'}));return finish();
  }
  if(a.type==='REFUND'){
    const item=s.inventory.find(i=>String(i.id)===String(a.inventoryId));if(!item||item.status!=='보관 중'||(item.memberId&&item.memberId!==memberId))return fail('본인 보관 상품만 환불할 수 있습니다.');
    const refundMethod=a.refundMethod||'points';if(!['points','original'].includes(refundMethod))return fail('환급 수단을 확인해 주세요.');
    if(refundMethod==='original'&&(item.paymentMethod!=='card'||!validMoney(item.purchasePrice)))return fail('원결제 내역이 확인되는 카드 구매 상품만 원결제 환불할 수 있습니다.');
    const gross=Number(item.purchasePrice??item.value);if(!validMoney(gross)||!validRate(s.settings.refundFeePercent))return fail('환불 기준가와 수수료를 확인해 주세요.');
    const fee=Math.round(gross*Number(s.settings.refundFeePercent)/100),net=gross-fee;
    const bonusNet=item.paymentMethod==='wallet'?Math.min(net,Math.round(net*Number(item.bonusUsed||0)/Math.max(gross,1))):0,paidNet=net-bonusNet;
    const pending=!!s.settings.refundApprovalRequired;item.status=pending?'환불 대기':'환불 완료';s.refunds.unshift(entry({inventoryId:item.id,orderId:item.orderId,productName:item.name,gross,fee,net,paidNet,bonusNet,status:pending?'승인 대기':'환불 완료',memberId,feePercent:s.settings.refundFeePercent,refundMethod}));if(!pending&&refundMethod==='points'){s.wallet.paid+=paidNet;s.wallet.bonus+=bonusNet;ledger('상품 미수령 환불',net)}return finish();
  }
  if(a.type==='CONVERT_ITEM'){
    const item=s.inventory.find(i=>i.id===a.inventoryId);if(!item||item.status!=='보관 중'||(item.memberId&&item.memberId!==memberId))return fail('본인 보관 상품만 포인트로 전환할 수 있습니다.');
    if(!validMoney(item.value)||!validRate(s.settings.conversionPercent))return fail('상품 기준가와 전환율을 확인해 주세요.');
    const amount=Math.floor(Number(item.value)*Number(s.settings.conversionPercent)/100);if(amount<=0)return fail('전환할 포인트가 없습니다.');
    const record=entry({inventoryId:item.id,memberId,productName:item.name,amount,conversionPercent:s.settings.conversionPercent,status:'전환 완료',restorableUntil:new Date(Date.now()+Number(s.settings.restoreWindowHours)*3600000).toISOString()});
    s.conversions.unshift(record);item.status='포인트 전환';item.conversionId=record.id;s.wallet.bonus+=amount;ledger('상품 포인트 전환',amount);return finish();
  }
  if(a.type==='RESTORE_ITEM'){
    const record=s.conversions.find(c=>a.conversionId?c.id===a.conversionId:c.inventoryId===a.inventoryId&&c.status==='전환 완료');const item=s.inventory.find(i=>i.id===record?.inventoryId);
    if(!record||record.status!=='전환 완료'||record.memberId!==memberId||!item||item.status!=='포인트 전환')return fail('복구 가능한 전환 상품이 없습니다.');
    if(Date.now()>new Date(record.restorableUntil).getTime())return fail('상품 복구 가능 시간이 지났습니다.');
    const recent=s.conversions.filter(c=>c.memberId===memberId&&c.restoredAt&&new Date(c.restoredAt).getTime()>Date.now()-86400000).length;
    if(recent>=Number(s.settings.restoreDailyLimit))return fail('최근 24시간 상품 복구 횟수를 초과했습니다.');
    if(s.wallet.bonus<record.amount)return fail('전환 포인트가 사용되어 복구할 수 없습니다.');
    s.wallet.bonus-=record.amount;record.status='복구 완료';record.restoredAt=stamp();item.status='보관 중';delete item.conversionId;ledger('전환 상품 복구',-record.amount);return finish();
  }
  if(a.type==='SHIP'){const ids=new Set(a.ids||[]),items=s.inventory.filter(i=>ids.has(i.id));if(!items.length||items.length!==ids.size||items.some(i=>i.status!=='보관 중'||(i.memberId&&i.memberId!==memberId)))return fail('본인 보관 상품을 선택해 주세요.');items.forEach(i=>i.status='배송 요청');s.orders.unshift(entry({items:items.map(i=>i.name),inventoryIds:items.map(i=>i.id),total:Number(s.settings.freeShippingThreshold)>0&&items.reduce((sum,i)=>sum+Number(i.value),0)>=Number(s.settings.freeShippingThreshold)?0:Number(s.settings.shippingFee),status:'배송 요청',address:a.address||'기본 배송지',memberId}));return finish()}
  if(a.type==='APPROVE_REFUND'){const refund=s.refunds.find(r=>r.id===a.id);if(!refund||refund.status!=='승인 대기')return fail('이미 처리된 환불입니다.');const item=s.inventory.find(i=>i.id===refund.inventoryId);if(!item||item.status!=='환불 대기'||!validMoney(refund.net))return fail('환불 상품과 금액을 확인해 주세요.');refund.status='환불 완료';item.status='환불 완료';if(refund.refundMethod!=='original'){s.wallet.paid+=refund.paidNet??refund.net;s.wallet.bonus+=refund.bonusNet||0;ledger('관리자 환불 승인',refund.net);}return finish()}
  if(a.type==='REJECT_REFUND'){const refund=s.refunds.find(r=>r.id===a.id);if(!refund||refund.status!=='승인 대기')return fail('대기 중인 환불만 반려할 수 있습니다.');refund.status='반려';refund.reason=a.reason||'운영자 반려';const item=s.inventory.find(i=>i.id===refund.inventoryId);if(item)item.status='보관 중';return finish()}
  if(a.type==='CANCEL_CHARGE'){const charge=s.charges.find(c=>c.id===a.id);if(!charge||charge.status==='취소 완료')return fail('이미 취소된 충전입니다.');if(s.wallet.paid<charge.amount||s.wallet.bonus<charge.bonus)return fail('이미 사용한 충전금 또는 보너스가 있어 취소할 수 없습니다.');s.wallet.paid-=charge.amount;s.wallet.bonus-=charge.bonus;charge.status='취소 완료';ledger('충전 취소',-charge.amount-charge.bonus);return finish()}
  if(a.type==='REWARD'){const records=s.content.attendance||[];const today=kstDate();if(records.some(r=>r.date===today&&(r.memberId||'demo-member')===memberId))return fail('오늘 출석 보상을 이미 받았습니다.');s.wallet.bonus+=100;s.content.attendance=[entry({date:today,amount:100,memberId}),...records];ledger('출석 보상',100);return finish()}
  if(a.type==='REDEEM'){const product=s.products.find(p=>p.id===a.productId);const amount=Number(product?.value??a.amount);if(!product||!validMoney(product.stock)||product.stock<1)return fail('재고가 있는 등록 상품을 선택해 주세요.');if(!validMoney(amount)||amount<=0)return fail('교환 금액은 0보다 커야 합니다.');if(s.wallet.paid+s.wallet.bonus<amount)return fail('포인트가 부족합니다.');const bonus=Math.min(s.wallet.bonus,amount);s.wallet.bonus-=bonus;s.wallet.paid-=amount-bonus;product.stock--;s.inventory.unshift(entry({name:product.name,productId:product.id,value:amount,purchasePrice:amount,paymentMethod:'wallet',paidUsed:amount-bonus,bonusUsed:bonus,grade:'SHOP',status:'보관 중',image:'assets/box-life.png',memberId}));ledger('포인트샵 교환',-amount);return finish()}
  return fail('지원하지 않는 동작입니다.');
}
