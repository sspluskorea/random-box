export const sellerFields = {
 companyName:'상호', representative:'대표자', businessNumber:'사업자등록번호', salesNumber:'통신판매업 신고번호',
 businessAddress:'사업장 주소', supportPhone:'고객센터 전화', supportEmail:'고객센터 이메일', supportHours:'상담 시간',
 privacyOfficer:'개인정보 보호책임자', returnAddress:'반품 주소',
};
export const policyKinds = {service:'서비스 이용약관',privacy:'개인정보 처리방침',points:'포인트 이용정책',refund:'취소·청약철회·반품 정책',shipping:'배송·상품 보관 정책',community:'당첨 공개·커뮤니티 정책'};
export const defaultPolicies = Object.entries(policyKinds).map(([kind,title])=>({id:'policy-'+kind,kind,title,version:'1.0',start:'2026-10-10',status:'활성',content:{
 service:'서비스는 포인트 충전 → 박스 구매·개봉 → 당첨 상품 보관 → 배송 신청 또는 별도 상품 전환 순서로 이용합니다.\n\n구매 전에 판매가, 수량, 구성 상품, 확률, 배송비 및 취소 기준을 확인할 수 있습니다. 구매 결과와 당시의 조건을 거래 기록으로 남깁니다. 평균 당첨 횟수는 당첨을 보장하지 않습니다.\n\n이용자는 회원정보를 수정하고 계정 복구, 탈퇴, 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다. 미성년자 가입·결제에 필요한 확인과 법정대리인 절차는 서비스 오픈 전에 별도로 확정해야 합니다.\n\n운영정책은 시행일과 버전으로 구분합니다. 불리한 변경은 사전 고지 및 필요한 동의를 거쳐야 하며, 이미 체결된 거래를 새 조건으로 소급 변경하지 않습니다. 관계 법령의 소비자 권리는 약관보다 우선합니다.\n\n현재 공개 화면은 실제 인증·결제·배송 접수 없이 브라우저에 이용 기록을 저장합니다. 실제 비밀번호, 카드번호, 주민등록번호 등은 입력하지 마세요.',
 privacy:'처리 목적: 계정 식별, 구매·배송·환급 확인, 고객 문의 처리입니다. 계정 정보(닉네임·이메일·휴대전화), 배송 신청 시 수령인·주소, 거래 및 문의 기록을 목적별로 구분합니다. 선택적 혜택 알림 동의는 서비스 이용 동의와 분리하며 거부·철회할 수 있습니다.\n\n현재 화면의 정보는 이 브라우저의 저장소에 보관되며 다른 기기와 공유되지 않습니다. 계정 탈퇴 요청만으로 저장된 거래가 자동 삭제되지는 않습니다. 실제 서비스의 개인정보 보유·파기 기간, 법적 거래 기록 보존, 수탁자(PG·택배·인증·클라우드), 제3자 제공, 국외 이전 여부 및 보호책임자 연락처는 운영 계약과 처리 현황에 맞춰 확정·공개해야 합니다.\n\n열람·정정·삭제·처리정지는 개인정보 권리 요청 메뉴에서 접수할 수 있습니다. 법정 보존 대상과 일반 회원정보는 분리하여 처리해야 합니다. 접근권한, 암호화, 접속기록 및 파기 절차는 실제 서버 운영 전에 구축해야 합니다.\n\n공개 당첨 기록은 이름 일부를 가리며, 공개 선택을 끈 회원의 기록은 공개 피드에서 제외합니다. 브라우저 저장소 자체는 본인확인이나 위변조 방지를 보장하지 않습니다.',
 points:'충전 포인트는 결제한 금액과 보너스를 구분하여 표시합니다. 1원당 1P이며 보너스율과 선택 금액은 충전 전에 안내합니다. 보너스는 현금 지급 또는 현금 출금과 다릅니다.\n\n미사용 충전 취소는 해당 충전 원금과 지급 보너스를 함께 회수합니다. 이미 사용한 잔액이 있으면 즉시 취소 대신 고객센터 검토가 필요합니다. 부분 사용 충전금의 환불 대상·산식은 실제 PG 및 법률 검토를 거쳐 확정해야 하며, 자동 거절을 최종 법적 판단으로 사용하지 않습니다.\n\n상품 포인트 전환은 당첨 상품을 포기하고 보너스 포인트를 받는 별도 기능입니다. 거래 전 지급액, 복원 기간·횟수를 안내합니다. 전환 지급분을 회수할 수 있을 때만 상품 복원이 가능합니다.\n\n포인트 소멸·유효기간, 환급 의무 및 선불전자지급수단 해당 여부는 사용처, 사업 구조와 발행 규모를 기준으로 확정해야 합니다. 현재 화면은 자동 소멸이나 실제 충전금 출금을 실행하지 않습니다.',
 refund:'미사용 충전 취소, 상품 미수령 환급, 법정 청약철회·반품은 서로 다른 절차입니다. 별도 상품 미수령 환급의 수수료를 모든 청약철회에 일괄 적용하지 않습니다.\n\n전자상거래의 일반적인 청약철회 기간은 계약내용 서면 수령 등을 기준으로 7일이며, 재화 공급 시점 등에 따라 기산점이 달라질 수 있습니다. 표시·광고 또는 계약과 다른 공급은 별도 기간과 요건이 적용됩니다. 상품 종류·훼손·사용 여부 등 법정 예외를 개별 확인해야 합니다. 단순히 랜덤박스를 열었다는 이유만으로 모든 권리를 배제하지 않습니다.\n\n적법한 청약철회에 위약금·손해배상 명목의 수수료를 일괄 부과하지 않습니다. 단순 변심의 반환 비용과 하자·오배송 등 사업자 귀책의 비용 부담을 구분합니다. 환급 기한은 반환 여부와 거래 유형에 따른 법정 기준을 적용합니다.\n\n취소·반품 신청에서 거래 번호, 사유와 상품 상태를 접수하고 고객센터에서 결과를 안내합니다. 이 화면의 접수는 PG 환불이나 택배 수거를 실행하지 않습니다. 원결제 환불은 실제 결제 내역 확인과 PG 승인 이후 완료로 표시해야 합니다.',
 shipping:'당첨 상품은 보관함에서 확인하며 배송을 신청해야 발송 절차가 시작됩니다. 신청 전 선택 상품, 주소, 배송비와 무료배송 기준을 확인합니다.\n\n택배사·송장·배송 상태는 주문·배송에서 확인합니다. 배송 지연·품절·파손·오배송은 고객센터 또는 취소·반품 신청으로 접수합니다. 출고 준비와 실제 출고를 구분하고 임의 대체 상품은 동의 없이 발송하지 않습니다.\n\n반품 주소와 회수 방식은 운영자가 등록한 안내 및 개별 접수 결과를 확인해야 합니다. 등록되지 않은 주소로 임의 발송하지 마세요. 상품 보관 만료·자동 처분은 현재 적용하지 않습니다. 실제 도입 시 사전 고지와 권리 검토가 필요합니다.',
 community:'언박싱 화면에는 이 브라우저에서 저장된 개봉 기록을 표시합니다. 여러 기기의 실제 회원 기록을 서버에서 수집·검증한 결과가 아닙니다. 예시·홍보 콘텐츠를 실제 당첨으로 표시하지 않습니다.\n\n회원정보의 당첨 내역 공개 선택과 이름 가림 설정을 적용합니다. 공개를 끄면 공개 피드·랭킹에서 제외하되 본인의 보관함과 거래 기록은 유지합니다.\n\n확률 공개 및 과거 확률표 보존은 운영 조건을 설명하기 위한 기능입니다. 외부 검증·암호학적 추첨 증명·위변조 방지가 완료됐다는 의미는 아닙니다.\n\n개인정보 노출, 허위 당첨 주장, 불법 거래 및 타인의 권리 침해는 고객센터로 신고할 수 있습니다. 게시물 삭제와 거래 취소는 별도로 판단합니다.',
 }[kind]}));
export function mergePolicyDefaults(rows=[]){
 const legacyIds=new Set(['terms-service','terms-privacy']);
 const migrated=rows.filter(r=>!legacyIds.has(r.id)||!(/^(포인트 충전 후|회원정보는 계정)/.test(r.content||'')));
 return [...migrated,...defaultPolicies.filter(p=>!migrated.some(r=>r.id===p.id||r.kind===p.kind))].map(r=>({...r,kind:r.kind||(/개인정보/.test(r.title)?'privacy':'service'),version:r.version||'1.0'}));
}
export function visiblePolicies(state,today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'})){
 const eligible=(state.content?.terms||[]).filter(r=>r.status==='활성'&&(!r.start||r.start<=today)).sort((a,b)=>String(b.start||'').localeCompare(String(a.start||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const selected=new Map();for(const row of eligible){const kind=row.kind||(/개인정보/.test(row.title)?'privacy':'service');if(!selected.has(kind))selected.set(kind,row);}return [...selected.values()];
}
export function policySnapshot(state){return visiblePolicies(state).map(({id,kind,title,version,start,content})=>({id,kind,title,version,start,content}));}
export function ownRecords(rows,state){return rows.filter(r=>(r.memberId||'demo-member')===(state.session?.id||'demo-member'));}
export function publicOpenings(state){return state.settings.winnerFeedEnabled===false?[]:state.openings.filter(r=>r.createdAt&&r.inventoryId&&r.orderId&&state.members.find(m=>m.id===r.memberId)?.publicWins!==false);}
export function validPolicyRows(rows){return Array.isArray(rows)&&rows.every(r=>r&&typeof r.title==='string'&&r.title.trim()&&typeof r.content==='string'&&r.content.trim()&&(!r.kind||Object.hasOwn(policyKinds,r.kind))&&(!r.start||(/^\d{4}-\d{2}-\d{2}$/.test(r.start)&&Number.isFinite(Date.parse(r.start+'T00:00:00Z'))&&new Date(r.start+'T00:00:00Z').toISOString().slice(0,10)===r.start)));}
