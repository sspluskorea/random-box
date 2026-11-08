// Proposed fulfillment substitutions never rewrite the original draw or its monetary snapshot.
const stored=i=>i?.status==='보관 중';
const active=p=>p&&!['비활성','판매 중지','판매중지','중지','삭제'].includes(p.status);
const fail=error=>({ok:false,error});
export const pendingSubstitution=(s,inventoryId)=>(s.substitutions||[]).find(r=>r.inventoryId===inventoryId&&r.status==='제안 대기');
export function handleSubstitutionAction(s,a){
 if(!['OFFER_SUBSTITUTION','RESPOND_SUBSTITUTION'].includes(a.type))return null;
 if(a.type==='OFFER_SUBSTITUTION'){
  const item=s.inventory.find(i=>i.id===a.inventoryId),product=s.products.find(p=>p.id===a.productId);
  if(!stored(item))return fail('보관 중인 상품만 대체 제안할 수 있습니다.');
  if(item.expiresAt&&Date.parse(item.expiresAt)<=Date.now())return fail('수령 기한이 지난 상품입니다.');
  if(pendingSubstitution(s,item.id))return fail('답변을 기다리는 대체 제안이 있습니다.');
  if(!String(a.reason||'').trim())return fail('대체 제안 사유를 입력해 주세요.');
  if(!active(product)||!Number.isSafeInteger(product.stock)||product.stock<1)return fail('재고가 있는 대체 상품을 선택해 주세요.');
  if(product.id===(item.deliveryProductId||item.productId))return fail('기존 배송 상품과 다른 상품을 선택해 주세요.');
  const current=s.products.find(p=>p.id===(item.deliveryProductId||item.productId));
  if(current&&current.stock>0&&active(current))return fail('품절 또는 판매 중지된 상품에만 대체 제안할 수 있습니다.');
  s.substitutions||=[];
  s.substitutions.unshift({id:crypto.randomUUID(),inventoryId:item.id,memberId:item.memberId||'demo-member',productId:product.id,productName:product.name,image:product.image,value:product.value,grade:product.grade,reason:String(a.reason).trim(),status:'제안 대기',createdAt:new Date().toISOString(),originalSnapshot:structuredClone(item)});
  return {ok:true};
 }
 const proposal=(s.substitutions||[]).find(r=>r.id===a.id),memberId=s.session?.id||'demo-member';
 if(!proposal||proposal.memberId!==memberId)return fail('본인에게 제안된 상품만 확인할 수 있습니다.');
 if(proposal.status!=='제안 대기')return fail('이미 답변한 대체 제안입니다.');
 if(typeof a.accept!=='boolean')return fail('수락 또는 거절을 선택해 주세요.');
 const item=s.inventory.find(i=>i.id===proposal.inventoryId);
 if(!stored(item))return fail('보관 상품 상태가 변경되어 처리할 수 없습니다.');
 if(item.expiresAt&&Date.parse(item.expiresAt)<=Date.now())return fail('수령 기한이 지난 상품입니다. 기한 처리 내역을 확인해 주세요.');
 if(a.accept){
  const product=s.products.find(p=>p.id===proposal.productId);
  if(!active(product)||!Number.isSafeInteger(product.stock)||product.stock<1)return fail('대체 상품이 품절되었습니다. 고객센터에 새 제안을 요청해 주세요.');
  if(item.deliveryProductId&&!item.substitutionStockReleased){const reserved=s.products.find(p=>p.id===item.deliveryProductId);if(reserved)reserved.stock+=1;}
  product.stock-=1;
  item.deliveryProductId=product.id;item.deliveryProductName=proposal.productName;item.deliveryImage=proposal.image;
  item.substitutionId=proposal.id;item.substitutionAcceptedAt=new Date().toISOString();
  item.substitutionStockReleased=false;
 }
 proposal.status=a.accept?'수락':'거절';proposal.respondedAt=new Date().toISOString();proposal.requestId=a.requestId||null;
 return {ok:true};
}
