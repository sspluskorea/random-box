export const adminGroups = [
 ['박스·상품', [['boxes','랜덤박스 관리'],['probability','금액대별 확률'],['products','상품 등록·재고'],['openings','개봉·당첨 이력']]],
 ['충전·환급', [['charges','충전 내역'],['charge-settings','충전 금액·보너스'],['refunds','상품 미수령 환불'],['refund-settings','환불·수수료 정책'],['conversion-settings','상품 전환·복원 정책'],['ledger','포인트 원장']]],
 ['주문·회원', [['orders','주문·배송 관리'],['shipping-settings','배송비·배송 정책'],['inventory','회원 보관함'],['members','회원 관리'],['member-points','회원별 포인트']]],
 ['콘텐츠·고객지원', [['banners','홈 배너'],['events','이벤트'],['notices','공지사항'],['faq','자주 묻는 질문'],['inquiries','1:1 문의'],['coupons','쿠폰'],['terms','약관·정책'],['winner-feed','당첨 공개 설정']]],
];
export const tableColumns = {
 boxes:['name','price','category','total','left','status'], probability:['name','price','left','status'],
 products:['name','value','cost','stock','category'], openings:['createdAt','memberId','boxName','productName','value','grade'],
 charges:['createdAt','memberId','amount','bonus','status'], refunds:['createdAt','memberId','productName','gross','fee','net','status'],
 orders:['createdAt','memberId','items','total','status','carrier','tracking'], inventory:['createdAt','memberId','name','value','grade','status'],
 members:['name','email','phone','points','status'], 'member-points':['name','email','phone','points','status'],
 ledger:['createdAt','memberId','type','amount','reason'],
 banners:['title','image','link','start','end','status'], events:['title','start','end','status'], notices:['title','status','createdAt'],
 faq:['question','category','status'], inquiries:['title','customer','status','createdAt'], coupons:['name','code','amount','limit','start','end','status'], terms:['title','start','status'],
};
export const detailLabels = {
 requestKind:'서비스 요청 유형',policySnapshot:'거래 당시 적용 정책',kind:'정책 유형',version:'정책 버전',consents:'가입 동의 선택 기록',service:'이용약관 선택',privacy:'개인정보 안내 선택',marketing:'혜택 알림 선택',age:'가입 연령 안내 선택',recordedAt:'선택 기록 시각',verification:'검증 상태',publicWins:'당첨 공개 선택',
 id:'기록 번호',total:'총 수량·금액',tiers:'금액대별 당첨 확률',label:'등급',min:'최저 상품 가치',max:'최고 상품 가치',color:'박스 테마 색상',paidNet:'유료 포인트 환급액',bonusNet:'보너스 포인트 환급액',refundMethod:'환급 방식',
 items:'주문 상품',method:'결제 방식',paymentMethod:'결제 방식',orderId:'주문 번호',chargeId:'충전 번호',refundId:'환급 번호',
 memberId:'회원',boxId:'랜덤박스',productId:'상품 번호',inventoryIds:'보관 상품 번호',inventoryId:'보관 상품 번호',
 paid:'유료 포인트',paidUsed:'사용 유료 포인트',bonusUsed:'사용 보너스 포인트',remaining:'미사용 충전 잔액',paidRemaining:'미사용 유료 잔액',bonusRemaining:'미사용 보너스 잔액',
 cancelledAt:'취소 일시',cancelled:'취소 여부',used:'사용 여부',usedAt:'사용 일시',approvedAt:'승인 일시',rejectedAt:'반려 일시',shippedAt:'출고 일시',deliveredAt:'배송 완료 일시',updatedAt:'수정 일시',
 convertedAt:'전환 일시',restoredAt:'복원 일시',conversionId:'전환 번호',conversionPoints:'전환 포인트',restored:'복원 여부',
 recipient:'받는 분',receiver:'받는 분',postcode:'우편번호',zip:'우편번호',detail:'상세 주소',memo:'배송 요청사항',shippingFee:'배송비',discount:'할인 금액',couponId:'사용 쿠폰',
 cost:'매입원가',probabilitySnapshot:'구매 당시 금액대·확률',candidateSnapshot:'당첨 후보 상품',probability:'당첨 금액대 확률',effectiveProbability:'상품 최종 확률',source:'기록 출처',provenance:'당첨 근거',
 feePercent:'적용 수수료율',feeRate:'적용 수수료율',paidRefund:'유료 포인트 환급',bonusRefund:'보너스 포인트 환급',refundPaid:'유료 포인트 환급',refundBonus:'보너스 포인트 환급',
 value:'상품 가치',purchasePrice:'실제 구매가',address:'배송 주소',name:'이름',status:'처리 상태',createdAt:'등록 일시',title:'제목',content:'본문',description:'설명',answer:'답변',reason:'처리 사유',image:'상품 이미지',
 date:'일자',amount:'금액',bonus:'보너스 포인트',points:'보유 포인트',price:'판매가',stock:'재고',category:'카테고리',start:'시작일',end:'종료일',phone:'연락처',email:'이메일',link:'연결 주소',tracking:'송장 번호',carrier:'택배사',code:'쿠폰 코드',limit:'사용 한도',grade:'당첨 등급',
};
const pointKeys = new Set(['points','bonus','paid','paidUsed','bonusUsed','remaining','paidRemaining','bonusRemaining','conversionPoints','paidRefund','bonusRefund','refundPaid','refundBonus','paidNet','bonusNet']);
const wonKeys = new Set(['price','value','cost','purchasePrice','gross','fee','net','shippingFee','discount','min','max']);
export function formatAdminValue(key,value,state={},menu='') {
 if(value==null||value==='')return '—';
 if(key==='memberId'){const m=state.members?.find(m=>m.id===value);return m?`${m.name} · ${value}`:String(value);}
 if(key==='boxId'){const b=state.boxes?.find(b=>String(b.id)===String(value));return b?`${b.name} · ${value}`:String(value);}
 if(typeof value==='boolean')return value?'예':'아니요';
 if(typeof value==='number'){
  const n=value.toLocaleString('ko-KR',{maximumFractionDigits:4});
  if(/probability|Percent|Rate/.test(key))return n+'%';
  if(pointKeys.has(key)||(menu==='ledger'&&key==='amount'))return n+' P';
  if(wonKeys.has(key)||key==='amount'||(key==='total'&&menu==='orders'))return n+'원';
  if(['stock','left','count'].includes(key)||(key==='total'&&['boxes','probability'].includes(menu)))return n+'개';
  return n;
 }
 if(key.endsWith('At')&&Number.isFinite(Date.parse(value)))return new Date(value).toLocaleString('ko-KR');
 if(key==='color')return ({blue:'블루',pink:'핑크',gold:'골드'})[value]||String(value);
 if(key==='requestKind')return ({returns:'취소·반품',withdrawal:'회원 탈퇴',rights:'개인정보 권리',recovery:'계정 복구'})[value]||String(value);
 if(key==='kind')return ({service:'이용약관',privacy:'개인정보',points:'포인트',refund:'취소·반품',shipping:'배송',community:'당첨 공개·커뮤니티'})[value]||String(value);
 return ({wallet:'포인트',points:'포인트',original:'원 결제 수단',card:'카드',bank:'계좌이체'})[value]||String(value);
}
export function rowDetails(row,primaryColumns){return Object.entries(row).filter(([key])=>!primaryColumns.includes(key));}
