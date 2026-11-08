export const adminGroups = [
 ['박스·상품', [['boxes','랜덤박스 관리'],['probability','상품별 당첨 확률'],['products','상품 등록·재고'],['openings','개봉·당첨 이력']]],
 ['페이·포인트', [['charges','충전 내역'],['charge-settings','페이 충전·보너스'],['refunds','상품 포인트 전환'],['pay-withdrawals','페이 환전'],['conversion-settings','상품 포인트 전환 설정'],['ledger','페이·포인트 원장']]],
 ['주문·회원', [['orders','주문·배송 관리'],['shipping-settings','배송비·배송 정책'],['inventory','회원 보관함'],['members','회원 관리'],['member-points','회원별 페이·포인트'],['pity','천장 게이지']]],
 ['콘텐츠·고객지원', [['banners','홈 배너'],['events','이벤트'],['notices','공지사항'],['faq','자주 묻는 질문'],['inquiries','1:1 문의'],['coupons','쿠폰'],['terms','약관·정책'],['winner-feed','당첨 공개 설정']]],
];
export const tableColumns = {
 boxes:['name','price','category','total','left','status'], probability:['name','price','left','status'],
 products:['name','grade','value','stock','status'], openings:['createdAt','memberId','boxName','productName','value','grade'],
 charges:['createdAt','memberId','amount','bonus','status'], refunds:['createdAt','memberId','productName','amount','conversionPercent','status'],
 orders:['orderKind','createdAt','memberId','items','total','status','carrier','tracking'], inventory:['createdAt','memberId','name','value','grade','status'],
 members:['name','email','phone','payBalance','pointBalance','status'], 'member-points':['name','email','payBalance','pointBalance','status'],
 ledger:['createdAt','memberId','type','amount','reason'],
 banners:['title','image','link','start','end','status'], events:['title','start','end','status'], notices:['title','status','createdAt'],
 faq:['question','category','status'], inquiries:['title','customer','status','createdAt'], coupons:['name','code','amount','limit','start','end','status'], terms:['title','start','status'],
};
export const detailLabels = {appliedGaugeGrade:'강화 적용 등급',gaugeSnapshot:'개봉 전후 게이지',baseProbabilitySnapshot:'강화 전 확률',gaugeBeforePercent:'강화 전 등급 확률',gaugeAfterPercent:'강화 후 등급 확률',returnBaseValueSnapshot:'전환 당시 기준가격',returnPointPercentSnapshot:'전환 당시 반환비율',returnPointsSnapshot:'반환 포인트',legacyCapturedAmount:'이전 방식 산정 금액',restorableUntil:'전환 취소 가능 시각',payBalance:'보유 페이',pointBalance:'보유 포인트',returnPointPercent:'상품 포인트 반환비율',pointReturnPercent:'기본 포인트 반환비율',totalOpenings:'개봉 횟수',gauge:'천장 게이지',remainingUses:'남은 강화 횟수',gainPerOpening:'해당 등급 당첨 시 게이지 증가',startAfterOpenings:'적립 시작 개봉수',boostPercent:'당첨 확률 증가',boostUses:'강화 적용 횟수',boostUsesSnapshot:'적용 당시 강화 횟수',remainingToStart:'적립 시작까지 남은 개봉',rule:'적용 규칙',active:'강화 적용 가능',gaugeGrade:'강화 적용 등급',gaugeBoostSnapshot:'적용 당시 강화 조건',
 before:'변경 전 확률',after:'변경 후 확률',rewards:'천장 게이지 정책',rewardGrantId:'보상 지급 번호',campaignSnapshot:'지급 당시 이벤트 조건',burningPercent:'A등급 최종 확률',burningUses:'버닝 횟수',maxClaims:'최대 지급 횟수',referrerId:'추천 회원',referrerReward:'추천인 보상',refereeReward:'신규 가입자 보상',minCharge:'최소 충전금액',paidAt:'지급 시각',referralCode:'친구 추천 코드',
 refundedAmount:'누적 취소 원금',balanceType:'지급 잔액 구분',cashUsed:'사용 캐시',cashAmountSnapshot:'당첨 당시 캐시 전환액',conversionPercentSnapshot:'당첨 당시 전환율',expiresAt:'수령 신청 마감',automatic:'자동 전환 여부',note:'검토 메모',resolvedAt:'검토 완료 시각',pityClaimId:'보상 수령 번호',actor:'처리 담당',chargeIds:'관련 충전 번호',consumed:'게이지 초기화 금액',resetPolicy:'게이지 초기화 방식',earned:'인정 결제금액',adjustment:'관리자 정정액',progress:'천장 게이지 금액',available:'보상 수령 가능',
 brand:'브랜드',specification:'주요 사양',cashAmount:'이전 고정 캐시 전환액',cash:'이전 캐시 기록',rewardCategory:'천장 게이지 카테고리',rewardOnly:'천장 게이지 전용',productOdds:'상품별 최종 확률',eventEligible:'이벤트 적용 가능',detailImages:'상세 이미지',policyVersion:'적용 정책 버전',autoConvertAt:'자동 전환 예정 시각',cashValue:'캐시 전환 예정액',rewardType:'보상 종류',campaignId:'이벤트 번호',cycle:'보상 회차',threshold:'확정보상 기준금액',conversionTarget:'전환 지급 구분',netPaid:'누적 순결제금액',debt:'보상 정산 필요액',
 requestKind:'서비스 요청 유형',policySnapshot:'거래 당시 적용 정책',kind:'정책 유형',version:'정책 버전',consents:'가입 동의 선택 기록',service:'이용약관 선택',privacy:'개인정보 안내 선택',marketing:'혜택 알림 선택',age:'가입 연령 안내 선택',recordedAt:'선택 기록 시각',verification:'검증 상태',publicWins:'당첨 공개 선택',
 id:'기록 번호',total:'총 수량·금액',tiers:'금액대별 당첨 확률',label:'등급',min:'최저 상품 가치',max:'최고 상품 가치',color:'박스 테마 색상',paidNet:'유료 포인트 환급액',bonusNet:'보너스 포인트 환급액',refundMethod:'환급 방식',
 items:'주문 상품',method:'결제 방식',paymentMethod:'결제 방식',orderId:'주문 번호',chargeId:'충전 번호',refundId:'환급 번호',
 memberId:'회원',boxId:'랜덤박스',productId:'상품 번호',inventoryIds:'보관 상품 번호',inventoryId:'보관 상품 번호',
 paid:'페이',paidUsed:'사용 페이',bonusUsed:'사용 포인트',remaining:'미사용 충전 잔액',paidRemaining:'미사용 유료 잔액',bonusRemaining:'미사용 보너스 잔액',
 cancelledAt:'취소 일시',cancelled:'취소 여부',used:'사용 여부',usedAt:'사용 일시',approvedAt:'승인 일시',rejectedAt:'반려 일시',shippedAt:'출고 일시',deliveredAt:'배송 완료 일시',updatedAt:'수정 일시',
 convertedAt:'전환 일시',restoredAt:'복원 일시',conversionId:'전환 번호',conversionPoints:'전환 포인트',restored:'복원 여부',
 recipient:'받는 분',receiver:'받는 분',postcode:'우편번호',zip:'우편번호',detail:'상세 주소',memo:'배송 요청사항',shippingFee:'배송비',discount:'할인 금액',couponId:'사용 쿠폰',
 cost:'매입원가',probabilitySnapshot:'구매 당시 금액대·확률',candidateSnapshot:'당첨 후보 상품',probability:'당첨 금액대 확률',effectiveProbability:'상품 최종 확률',source:'기록 출처',provenance:'당첨 근거',
 feePercent:'적용 수수료율',feeRate:'적용 수수료율',paidRefund:'유료 포인트 환급',bonusRefund:'보너스 포인트 환급',refundPaid:'유료 포인트 환급',refundBonus:'보너스 포인트 환급',
 value:'상품 가치',purchasePrice:'실제 구매가',address:'배송 주소',name:'이름',status:'처리 상태',createdAt:'등록 일시',title:'제목',content:'본문',description:'설명',answer:'답변',reason:'처리 사유',image:'상품 이미지',
 date:'일자',amount:'금액',bonus:'포인트',points:'보유 포인트',price:'판매가',stock:'재고',category:'카테고리',start:'시작일',end:'종료일',phone:'연락처',email:'이메일',link:'연결 주소',tracking:'송장 번호',carrier:'택배사',code:'쿠폰 코드',limit:'총 사용 가능 횟수',grade:'당첨 등급',
};
const pointKeys = new Set(['points','bonus','paid','paidUsed','bonusUsed','remaining','paidRemaining','bonusRemaining','conversionPoints','paidRefund','bonusRefund','refundPaid','refundBonus','paidNet','bonusNet']);
const wonKeys = new Set(['price','value','cost','purchasePrice','gross','fee','net','shippingFee','discount','min','max','consumed','earned','progress','threshold','netPaid','debt','adjustment']);
export function formatAdminValue(key,value,state={},menu='') {
 if(value==null||value==='')return '—';
 if(key==='memberId'){const m=state.members?.find(m=>m.id===value);return m?`${m.name} · ${value}`:String(value);}
 if(key==='boxId'){const b=state.boxes?.find(b=>String(b.id)===String(value));return b?`${b.name} · ${value}`:String(value);}
 if(key==='productId'){const p=state.products?.find(p=>String(p.id)===String(value));return p?`${p.name} · ${value}`:String(value);}
 if(['rewardCategory','category','categoryId'].includes(key)){const category=state.platform?.rewardCategories?.find(c=>c.id===value);if(category)return category.name;if(['men','women','appliance'].includes(value))return ({men:'남성 명품',women:'여성 명품',appliance:'가전제품'})[value];}
 if(key==='type'&&['SAVE_REWARD_RULES','SAVE_REWARD_CATEGORY','SAVE_REWARD_MAPPING','PLATFORM_SETTINGS'].includes(value))return ({SAVE_REWARD_RULES:'등급·기준금액 변경',SAVE_REWARD_CATEGORY:'상품 종류 변경',SAVE_REWARD_MAPPING:'지급 상품 연결 변경',PLATFORM_SETTINGS:'보상·전환 설정 변경'})[value];
 if(key==='resetPolicy')return value==='full-gauge'?'해당 등급 게이지를 0으로 초기화':String(value);
 if(key==='rewardType')return ({points:'보너스 포인트',cash:'이전 캐시 기록',box:'특별 박스 이용권',product:'확정 상품',burning:'A등급 버닝 이용권'})[value]||String(value);
 if(typeof value==='boolean')return value?'예':'아니요';
 if(typeof value==='number'){
  const n=value.toLocaleString('ko-KR',{maximumFractionDigits:4});
  if(key==='gauge')return n+'%';
  if(['gainPerOpening','boostPercent'].includes(key))return n+'%p';
  if(/probability|Percent|Rate/.test(key))return n+'%';
  if(menu==='pity-progress'&&key==='remaining')return n+'원';
  if(['paid','paidUsed','paidRemaining','paidNet','payBalance'].includes(key)||(menu==='pay-ledger'&&key==='amount'))return n+' 페이';
  if(key==='pointBalance'||(menu==='refunds'&&key==='amount'))return n+' P';
  if(pointKeys.has(key)||(menu==='ledger'&&key==='amount'))return n+' P';
  if(wonKeys.has(key)||key==='amount'||(key==='total'&&menu==='orders'))return n+'원';
  if(['stock','left','count'].includes(key)||(key==='total'&&['boxes','probability'].includes(menu)))return n+'개';
  return n;
 }
 if(key.endsWith('At')&&Number.isFinite(Date.parse(value)))return new Date(value).toLocaleString('ko-KR');
 if(key==='color')return ({blue:'블루',pink:'핑크',gold:'골드'})[value]||String(value);
 if(key==='requestKind')return ({returns:'취소·반품',withdrawal:'회원 탈퇴',rights:'개인정보 권리',recovery:'계정 복구'})[value]||String(value);
 if(key==='kind')return ({service:'이용약관',privacy:'개인정보',points:'포인트',refund:'취소·반품',shipping:'배송',community:'당첨 공개·커뮤니티'})[value]||String(value);
 return ({wallet:'페이·포인트',paid:'페이',bonus:'포인트',points:'포인트',original:'원 결제 수단',card:'카드',bank:'계좌이체'})[value]||String(value);
}
export function rowDetails(row,primaryColumns){return Object.entries(row).filter(([key])=>!primaryColumns.includes(key));}
