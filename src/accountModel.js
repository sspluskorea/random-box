export function accountSummary(state,now=Date.now()){
 const memberId=state.session?.id||'demo-member';
 const own=rows=>(rows||[]).filter(r=>!r.memberId||r.memberId===memberId);
 const stored=own(state.inventory).filter(i=>i.status==='보관 중');
 const orders=own(state.orders).filter(o=>['배송 요청','상품 준비 중','배송 준비','배송 중','배송 완료','배송 취소'].includes(o.status));
 const coupons=own(state.content.coupons).filter(c=>c.status==='사용 가능'&&!c.usedAt&&(!(c.expiresAt||c.endDate)||Date.parse(c.expiresAt||c.endDate)>=now)&&(!(c.startsAt||c.startDate)||Date.parse(c.startsAt||c.startDate)<=now));
 const inquiries=own(state.content.inquiries).filter(i=>!i.answer&&!i.reply&&!['답변 완료','완료','종료'].includes(i.status));
 const count={inventory:stored.length,orders:orders.length,refunds:own(state.refunds).filter(r=>r.status==='승인 대기').length,cart:own(state.content.cart).length,wishlist:own(state.content.wishlist).length,coupons:coupons.length,support:inquiries.length};
 const recent=(state.openings||[]).filter(r=>r.memberId===memberId).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,3);
 const deliveryCount=status=>orders.filter(o=>o.status===status||(status==='배송 준비'&&o.status==='상품 준비 중')).length;
 return {stored,orders,coupons,inquiries,count,recent,deliveryCount};
}
