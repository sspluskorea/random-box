const valid=n=>Number.isSafeInteger(Number(n))&&Number(n)>=0;
export function ensureFinancialModel(s){
 s.platform.settings.pointReturnPercent??=s.platform.settings.cashPercent??60;s.payWithdrawals??=[];
 if(!s.platform.financialVersion)for(const item of s.inventory||[]){if(item.returnPointsSnapshot==null&&item.cashAmountSnapshot!=null){const amount=Number(item.cashAmountSnapshot);if(!valid(amount))throw Error('과거 상품 전환액을 확인해 주세요.');item.returnPointsSnapshot=amount;item.returnBaseValueSnapshot=Number(item.value||0);item.returnPointPercentSnapshot=item.value>0?amount/Number(item.value)*100:0;item.legacyCapturedAmount=true;}}
 if(!s.platform.financialVersion){
  const amount=Number(s.wallet.cash||0);if(!valid(amount)||!valid(s.wallet.bonus+amount))throw Error('기존 캐시 잔액을 확인해 주세요.');
  s.wallet.bonus+=amount;s.wallet.cash=0;
  for(const m of s.members){
   if(m.id===(s.session?.id||'demo-member')){m.cash=0;if(m.wallet)m.wallet={...m.wallet,paid:s.wallet.paid,bonus:s.wallet.bonus,cash:0};continue;}
   const cash=Number(m.cash||m.wallet?.cash||0),wallet=m.wallet||{paid:0,bonus:Number(m.points||0),cash:0};
   if(!valid(cash)||!valid(Number(wallet.bonus)+cash)||!valid(wallet.paid))throw Error('회원 캐시 잔액을 확인해 주세요.');
   wallet.bonus=Number(wallet.bonus)+cash;wallet.cash=0;m.wallet=wallet;m.points=wallet.paid+wallet.bonus;m.cash=0;
   if(cash)s.ledger.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),memberId:m.id,type:'기존 캐시 포인트 이관',amount:cash,balanceType:'bonus'});
  }
  s.platform.financialVersion=1;if(amount)s.ledger.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),memberId:s.session?.id||'demo-member',type:'기존 캐시 포인트 이관',amount,balanceType:'bonus'});
 }
}
export function snapshotPointReturn(s,item,product){
 if(item.returnPointsSnapshot!=null)return item;
 const rate=Number(product?.returnPointPercent!==''&&product?.returnPointPercent!=null?product.returnPointPercent:s.platform.settings.pointReturnPercent??60),value=Number(item.value||0);
 if(!Number.isFinite(rate)||rate<0||rate>100||!valid(value))throw Error('상품 포인트 반환율과 기준가를 확인해 주세요.');
 item.returnBaseValueSnapshot=value;item.returnPointPercentSnapshot=rate;item.returnPointsSnapshot=Math.floor(value*rate/100);return item;
}
export function pointReturnValue(s,item){if(item.returnPointsSnapshot!=null)return Number(item.returnPointsSnapshot);const p=s.products.find(p=>p.id===(item.productId||item.id))||item,rate=p?.returnPointPercent!==''&&p?.returnPointPercent!=null?Number(p.returnPointPercent):Number(s.platform.settings.pointReturnPercent??60);return Math.floor(Number(item.value||0)*rate/100);}
function memberWallet(s,id){if(id===(s.session?.id||'demo-member'))return s.wallet;const m=s.members.find(m=>m.id===id);if(!m)throw Error('회원을 찾을 수 없습니다.');m.wallet??={paid:0,bonus:Number(m.points||0),cash:0};return m.wallet;}
export function financialAction(s,a,now){
 if(['REFUND','CASH_CONVERT','CONVERT_ITEM'].includes(a.type)){
  const memberId=s.session?.id||'demo-member',item=s.inventory.find(i=>i.id===(a.inventoryId||a.id)&&(i.memberId||'demo-member')===memberId);
  if(!item||item.status!=='보관 중')return {error:'본인 보관 상품만 포인트로 반환할 수 있습니다.'};
  if(item.expiresAt&&Date.parse(item.expiresAt)<=now)return {error:'수령 기한이 지났습니다. 자동 전환 내역을 확인해 주세요.'};
  if((s.substitutions||[]).some(r=>r.inventoryId===item.id&&r.status==='제안 대기'))return {error:'대체 상품 제안에 먼저 답변해 주세요.'};
  snapshotPointReturn(s,item,s.products.find(p=>p.id===item.productId));const amount=pointReturnValue(s,item);if(!valid(amount)||!valid(s.wallet.bonus+amount))return {error:'반환 포인트를 확인해 주세요.'};s.wallet.bonus+=amount;
  const record={id:crypto.randomUUID(),createdAt:new Date(now).toISOString(),memberId,inventoryId:item.id,productName:item.name,boxId:item.boxId,source:item.source,amount,balanceType:'bonus',currency:'points',conversionPercent:item.returnPointPercentSnapshot,returnPointPercentSnapshot:item.returnPointPercentSnapshot,returnPointsSnapshot:amount,status:'전환 완료',returnBaseValueSnapshot:item.returnBaseValueSnapshot,legacyCapturedAmount:!!item.legacyCapturedAmount,restorableUntil:new Date(now+Number(s.settings.restoreWindowHours??24)*3600000).toISOString()};s.conversions.unshift(record);item.status='포인트 전환';item.conversionId=record.id;s.ledger.unshift({...record,id:crypto.randomUUID(),type:'상품 포인트 반환'});return {handled:true};
 }
 if(!['REQUEST_PAY_WITHDRAWAL','CANCEL_PAY_WITHDRAWAL','APPROVE_PAY_WITHDRAWAL','REJECT_PAY_WITHDRAWAL'].includes(a.type))return null;
 const memberId=s.session?.id||'demo-member',log=(w,type)=>s.ledger.unshift({id:crypto.randomUUID(),createdAt:new Date(now).toISOString(),memberId:w.memberId,type,amount:type==='페이 환전 예약'?-w.amount:w.amount,withdrawalId:w.id,balanceType:'paid'});
 if(a.type==='REQUEST_PAY_WITHDRAWAL'){const amount=Number(a.amount),wallet=memberWallet(s,memberId);if(!valid(amount)||amount<=0||wallet.paid<amount)return {error:'환전 가능한 페이 잔액과 신청 금액을 확인해 주세요.'};wallet.paid-=amount;const w={id:crypto.randomUUID(),memberId,amount,status:'신청',createdAt:new Date(now).toISOString(),requestId:a.requestId||''};s.payWithdrawals.unshift(w);log(w,'페이 환전 예약');return {handled:true};}
 const w=s.payWithdrawals.find(w=>w.id===a.id);if(!w||w.status!=='신청')return {error:'처리 가능한 환전 신청이 없습니다.'};if(a.type==='CANCEL_PAY_WITHDRAWAL'&&w.memberId!==memberId)return {error:'본인 환전 신청만 취소할 수 있습니다.'};if(a.type!=='CANCEL_PAY_WITHDRAWAL'&&!String(a.reason||'').trim())return {error:'환전 처리 사유를 입력해 주세요.'};
 if(a.type!=='APPROVE_PAY_WITHDRAWAL'){const wallet=memberWallet(s,w.memberId);if(!valid(wallet.paid+w.amount))return {error:'잔액 범위를 초과했습니다.'};wallet.paid+=w.amount;log(w,'페이 환전 예약 반환');}const member=s.members.find(m=>m.id===w.memberId);if(member&&w.memberId!==memberId&&member.wallet)member.points=member.wallet.paid+member.wallet.bonus;w.status=a.type==='APPROVE_PAY_WITHDRAWAL'?'승인':a.type==='REJECT_PAY_WITHDRAWAL'?'거절':'취소';w.reason=String(a.reason||'회원 취소');w.processedAt=new Date(now).toISOString();w.actor=a.type==='CANCEL_PAY_WITHDRAWAL'?'회원':'관리자';return {handled:true};
}
