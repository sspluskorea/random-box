from pathlib import Path
from html import escape
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/guides'; OUT.mkdir(parents=True,exist_ok=True)
def P(text): return ('p',text)
def H(text): return ('h',text)
def L(*items): return ('list',list(items))
def T(headers,rows): return ('table',headers,rows)
service=[
('서비스 이용 순서',[
 P('모두의박스는 포인트를 충전하고 랜덤박스를 구매한 뒤, 당첨 상품을 배송받거나 캐시로 전환하는 서비스입니다. 충전 실적에 따른 천장 보상과 누적 혜택은 마이페이지에서 함께 확인합니다.'),
 H('처음 이용할 때'),
 L('회원가입에서 회원정보와 동의 항목을 확인합니다. 로그인 후 마이페이지에서 포인트와 보관 상품을 확인합니다.','포인트 충전에서 금액과 보너스를 확인하고 승인을 진행합니다. 충전금과 보너스는 따로 표시됩니다.','랜덤박스에서 구성 상품과 확률을 확인합니다. 박스 열기를 누르면 수량과 결제수단을 선택할 수 있습니다. 연락처를 다시 입력할 필요는 없습니다.','구매가 완료되면 박스가 열리고 결과가 표시됩니다. 애니메이션을 건너뛰어도 이미 결정된 결과와 결제금액은 바뀌지 않습니다.','보관함에서 상품을 선택해 배송을 신청하거나, 표시된 금액을 확인하고 캐시로 전환합니다.'),
 H('화면을 확인하는 방법'),
 P('사용자와 관리자 화면을 같은 브라우저에서 열면 설정과 거래 기록이 서로 반영됩니다. 가입·로그인·결제 입력란은 비워 두고도 흐름을 확인할 수 있습니다. 실제 본인인증, 카드 승인, 배송 접수는 연결되지 않았으므로 실제 개인정보나 카드정보는 입력하지 않습니다.'),
 P('다른 기기나 브라우저에는 별도의 기록이 보입니다. 현재 화면은 서비스 흐름을 검토하는 제작본이며, 공개된 관리자 주소에도 실제 운영 권한 인증이 적용되어 있지 않습니다.')]),
('나의 쇼핑과 이용 기록',[
 T(['메뉴','사용 방법과 확인할 내용'],[
 ['랜덤박스와 검색','박스 이름·카테고리로 찾습니다. 박스 열기는 구매 화면, 담기는 장바구니, 하트는 관심 박스로 연결됩니다.'],
 ['구성과 확률','상품 이미지·등급·재고·최종 확률을 확인합니다. 상품명을 누르면 브랜드, 사양, 구성, 기준가격, 설명과 상세 이미지가 나옵니다.'],
 ['장바구니와 관심 박스','담은 박스를 확인하고 구매할 박스를 선택합니다. 구매 화면에서 수량·잔액·최종 결제금액을 다시 확인합니다.'],
 ['마이페이지','포인트·캐시·보관 상품·배송 진행과 천장 보상을 한 번에 확인합니다. 세부 내역은 왼쪽 메뉴로 이동합니다.'],
 ['보관함','배송을 기다리는 상품과 기한을 확인합니다. 배송 신청, 캐시 전환, 미수령 환급 중 가능한 처리를 선택합니다.'],
 ['주문·배송','신청 상품, 주소, 배송비와 상태를 확인합니다. 관리자가 등록한 택배사와 송장번호가 표시됩니다.'],
 ['나의 언박싱','본인의 박스 구매와 당첨 기록을 확인합니다. 공개 언박싱과 구분되어 있습니다.'],
 ['언박싱과 당첨 랭킹','공개 선택이 켜진 개봉 기록을 확인합니다. 현재 브라우저 기록과 예시 표시는 실제 전체 회원의 검증 자료를 뜻하지 않습니다.'],
 ['거래 명세','본인의 충전·구매 등 거래 내용을 확인합니다. 실제 세금계산서나 PG 영수증 발급 기능과는 별도입니다.'],
 ['이용방법과 확률 안내','충전부터 수령까지의 순서, 추첨 방식과 확률 해석을 확인합니다.']]),
 P('평균 당첨 간격은 장기간 반복했을 때의 평균입니다. 1%는 평균 100회당 1회라는 뜻이며, 100회 안에 반드시 당첨된다는 뜻은 아닙니다. 100회 중 한 번 이상 당첨될 확률은 약 63.4%입니다.')]),
('포인트와 캐시 및 취소',[
 H('잔액은 세 가지로 구분합니다'),
 T(['잔액','용도'],[['충전 포인트','승인된 충전 원금입니다. 천장과 누적 이벤트의 인정 결제금액에 포함됩니다.'],['보너스 포인트','충전 보너스·출석·이벤트·자동 전환으로 받습니다. 천장 인정금액에는 포함되지 않습니다.'],['캐시','상품 전환이나 이벤트로 받는 사이트 내 구매용 잔액입니다. 계좌 출금 기능은 없습니다.']]),
 H('충전 내역과 취소'),
 P('포인트 내역에서 충전금, 보너스, 사용 기록을 확인합니다. 미사용 충전은 취소 버튼으로 남은 원금과 회수 보너스를 확인한 뒤 처리합니다. 관리자는 금액을 입력해 부분 취소할 수도 있습니다. 원금이나 회수할 보너스가 부족하면 즉시 취소되지 않으며 고객센터 검토가 필요합니다.'),
 H('상품을 배송받지 않을 때'),
 P('캐시 전환은 상품 기준가격의 기본 60%를 받는 방식입니다. 상품별 고정 전환액이 있으면 그 금액이 우선합니다. 당첨 당시의 조건을 보존하므로 이후 관리자가 전환율을 바꿔도 이미 받은 상품의 금액은 달라지지 않습니다.'),
 P('상품 미수령 환급은 구매금액을 기준으로 수수료를 계산하는 별도 절차입니다. 상품 가치가 높아도 환급 기준이 커지지 않습니다. 캐시로 구매한 상품은 캐시로, 포인트 구매분은 사용한 잔액 종류에 맞춰 반환합니다. 관리자 승인 방식이면 승인 전에는 잔액이 늘어나지 않습니다.'),
 P('새 일반 당첨 상품은 기본 10일 이내 수령을 신청해야 합니다. 기한이 지나면 당시 전환액을 보너스 포인트로 지급합니다. 3일 전과 1일 전 구간에 화면을 열면 알림함에 안내합니다. 문자·이메일은 발송하지 않습니다. 천장 확정보상과 배송 신청 상품은 제외하며, 기한이 없던 과거 상품에는 소급 적용하지 않습니다.'),
 P('취소·반품 신청은 상품 하자나 배송 문제 등을 접수하는 창구입니다. 상품 미수령 환급 수수료가 모든 반품에 일괄 적용되는 것은 아닙니다. 접수 후 고객센터 답변을 확인합니다.')]),
('천장 보상과 참여 혜택',[
 H('A와 B는 각각 쌓입니다'),
 P('기본 기준은 B등급 1,000만원, A등급 4,000만원입니다. 승인된 충전 원금에서 취소한 금액을 차감합니다. 같은 포인트로 박스를 구매하거나 캐시를 다시 사용해도 적립금액은 늘지 않습니다. 일반 추첨으로 A~E 상품을 받아도 게이지는 초기화되지 않습니다.'),
 P('천장 화면에서 남성 명품·여성 명품·가전제품 중 카테고리를 선택하고 지급 예정 상품을 확인합니다. 수령하면 상품이 보관함에 들어오고 해당 등급의 기준금액만 차감됩니다. 재고가 없으면 지급하지 않고 받을 권리를 유지합니다.'),
 T(['예시','처리 결과'],[['4,000만원 충전','A 4,000만원, B 4,000만원으로 각각 계산합니다.'],['B 보상 1회 수령','B는 3,000만원이 남고 A는 4,000만원을 유지합니다.'],['이후 A 보상 수령','A는 0원, B는 3,000만원입니다.'],['보상 후 100만원 충전 취소','A에 정산 필요액 100만원이 생기며 B는 2,900만원입니다. 받은 상품을 자동 회수하지는 않습니다.']]),
 H('누적 결제 혜택'),
 P('기본 구간은 100만·200만·300만·500만·1,000만원입니다. 충전 조건을 충족하면 설정된 포인트, 캐시, 특별 박스 이용권, 버닝 이용권 또는 상품을 지급합니다. 반복 이벤트는 다음 회차에 추가 기준금액을 채워야 합니다. 재고 등으로 지급되지 못한 혜택은 조건을 확인한 뒤 다시 받을 수 있습니다.'),
 P('버닝은 지정 박스의 A등급 합산 확률을 기본 10%로 조정하는 이용권입니다. 나머지 등급은 비율에 맞게 조정됩니다. 구매 전에 최종 확률과 남은 사용 횟수를 확인합니다.'),
 P('가입 축하 보상은 최초 1회, 출석은 한국 시간 기준 하루 1회 지급합니다. 친구 초대는 추천 코드를 등록하고 신규 회원의 유효 충전 조건을 충족하면 양쪽에 지급합니다. 기본 보상은 가입 1,000P, 출석 100P, 추천 양쪽 각 1,000P이며 최소 충전 조건은 1만원입니다.')]),
('관리자에서 상품과 거래 처리하기',[
 P('관리자 상단의 서비스 이용 가이드와 개발자 전달 문서 버튼으로 이 안내서를 다시 열 수 있습니다. 메뉴 검색으로 필요한 화면을 찾고, 목록에서 상세 기록을 바로 확인합니다. 제공되는 CSV 내보내기는 현재 목록을 확인할 때 사용합니다.'),
 T(['관리자 메뉴','처리 순서와 반영 결과'],[
 ['랜덤박스 관리','새로 등록 또는 수정 → 이름·가격·수량·판매 상태 설정 → 이미지 업로드 → 구성과 확률 확인 → 저장합니다. 대표·상세 이미지는 수정창에서 관리합니다.'],
 ['상품별 당첨 확률','박스별 상품과 확률을 입력합니다. 합계 100%, 평균 간격, 누적 가능성, 등급 합계와 예상 원가를 확인합니다. 변경 전후 기록을 남깁니다.'],
 ['상품 등록·재고','A~E 등급, 브랜드·사양·가격·재고·판매 상태를 입력합니다. 대표·상세 이미지를 업로드하면 사용자 상품 화면에 표시됩니다.'],
 ['개봉·당첨 이력','회원·박스·상품·구매금액과 당시 확률을 확인합니다. 현재 확률을 바꿔도 과거 거래 조건은 보존됩니다.'],
 ['충전 내역','충전 원금·보너스·취소금액을 확인합니다. 취소 금액을 입력하면 원금과 비례 보너스를 회수하고 천장 인정액을 정산합니다.'],
 ['충전 금액·보너스','선택 충전금액과 보너스율을 저장합니다. 사용자의 다음 충전 화면에 반영됩니다.'],
 ['상품 미수령 환불','요청별 구매가·수수료·반환액을 확인합니다. 승인 또는 반려 후 상품 상태와 원장을 확인합니다.'],
 ['환불·수수료 정책','환급 수수료와 승인 방식을 설정합니다. 기존 거래와 법정 반품 절차를 구분합니다.'],
 ['상품 전환·복원 정책','기본 캐시율과 자동 전환 시간을 설정합니다. 전환 기록과 취소 후 정산 검토를 확인합니다. 현재 기한 확인 버튼은 실행 시점의 만료를 처리합니다.'],
 ['포인트 원장','충전·사용·지급·회수 내역의 회원과 잔액 종류, 금액, 사유를 확인합니다. 캐시도 종류를 구분해 기록합니다.']])]),
('관리자에서 회원과 보상 운영하기',[
 T(['관리자 메뉴','처리 순서와 반영 결과'],[
 ['주문·배송 관리','신청 상품·주소·배송비 확인 → 상태·택배사·송장 등록 → 저장합니다. 사용자 주문 화면에 반영됩니다.'],
 ['배송비·배송 정책','기본 배송비와 무료배송 조건 등 수령 비용을 설정합니다. 사용자는 신청 전 적용 금액을 확인합니다.'],
 ['회원 보관함','회원별 당첨 상품, 수령 상태, 구매 조건과 전환 기한을 확인합니다. 중복 환급·배송 여부를 조회할 때 사용합니다.'],
 ['회원 관리','회원정보와 상태를 확인·수정합니다. 결제 인정금액, 천장과 보상 기록은 천장·보상에서 함께 확인합니다.'],
 ['회원별 포인트·캐시','회원과 잔액 종류를 확인하고 지급·차감 사유를 입력합니다. 저장 후 해당 회원 잔액과 원장 반영을 확인합니다.'],
 ['천장·보상','A·B 기준과 카테고리별 보상 재고를 확인합니다. 회원별 진행금액·수령 횟수·정산 필요액, 지급·초기화 이력을 조회합니다. 수동 정정·지급에는 사유를 남깁니다.'],
 ['홈 배너','이미지 파일, 제목, 연결 주소와 노출 상태를 등록합니다. 현재는 운영 등록 목록이며 홈의 고정 이미지와 자동 연결되지 않습니다.'],
 ['이벤트','소식 게시와 금액별 자동 보상을 구분해 관리합니다. 누적 이벤트의 기간·금액·횟수·종류·상품·버닝 확률을 설정합니다. 가입·출석·추천 보상도 관리합니다.'],
 ['공지사항','제목과 본문을 등록하고 게시 상태를 설정합니다. 사용자 공지 목록과 상세 내용에 반영됩니다.'],
 ['자주 묻는 질문','질문·답변·분류를 등록해 고객센터 안내를 관리합니다.'],
 ['1:1 문의','일반 문의와 계정 복구·탈퇴·권리 요청·취소반품 접수를 확인하고 답변과 처리 상태를 기록합니다.'],
 ['쿠폰','코드·혜택·기간·총 사용 가능 횟수를 등록합니다. 구매 시 한국 날짜 기준 기간과 남은 횟수를 확인하고 사용 기록을 남깁니다. 자동 발급은 별도 연결 대상입니다.'],
 ['약관·정책','정책 유형·버전·시행일·본문을 등록합니다. 미래 시행일은 아직 적용되지 않습니다. 사업자와 고객센터 공개 정보도 이곳에서 관리합니다.'],
 ['당첨 공개 설정','공개 피드와 이름 가림을 설정합니다. 회원 본인의 공개 선택을 끈 기록은 공개 피드에서 제외됩니다.']])]),
('운영 중 자주 확인할 내용',[
 H('상품과 보상 설정 순서'),
 L('상품 등록·재고에서 이미지와 상품정보를 먼저 저장합니다. 천장 전용 상품은 등급과 남성·여성·가전 카테고리를 함께 지정합니다.','랜덤박스에 상품을 연결하고 확률 합계를 100%로 맞춥니다. 사용 중인 구성 상품은 먼저 박스에서 제외한 뒤 삭제합니다.','사용자 화면에서 이미지·가격·확률을 확인합니다. 기본 6개 박스의 기존 금액대 방식은 유지되며 개별 상품 확률로 전환할 수 있습니다. 신규 리워드 시그니처 박스는 상품별 확률을 사용합니다.','천장 기준을 변경해도 진행 중인 회차는 기존 기준을 유지합니다. 보상 수령 후 시작하는 다음 회차부터 새 기준을 적용합니다.'),
 H('문제가 생겼을 때'),
 P('품절 보상은 재고를 보충하고 다시 지급합니다. 임의 대체 상품에 대한 동의 절차는 별도 개발 대상이므로 다른 상품을 임의로 배송하지 않습니다. 취소 후 정산 검토의 완료 버튼은 검토 메모를 저장하는 기능입니다. 캐시 회수나 천장 부족액 해소가 자동으로 처리되지는 않습니다.'),
 P('커뮤니티는 글 등록과 열람, 선물함은 등록된 선물 기록을 확인하는 화면입니다. 공개 안내 이벤트의 참여 버튼은 참여 기록을 남깁니다. 이 기능만으로 실물 발송이나 모든 이벤트 보상이 자동 지급되지는 않습니다. 포인트샵과 상품 교환 게시판은 선택 기능으로 기본 주요 메뉴에서 제외했습니다. 해시패스는 제공하지 않습니다.'),
 P('회원정보 수정에서 공개 선택과 기본 정보를 관리합니다. 알림함에서는 보상·수령 마감 안내를 확인합니다. 개인정보 권리 요청, 탈퇴와 계정 복구는 고객센터 접수로 연결되며 자동 인증·파기·비밀번호 변경을 실행하지 않습니다.'),
 H('실제 운영을 시작하기 전'),
 P('운영사는 상품 공급·재고 확보, 결제 계약, 환불 기준, 보관 기한, 보상 후 취소 처리와 개인정보 처리 항목을 확정해야 합니다. 제작본에 들어간 정책 문구만으로 법률 검토가 완료된 것은 아닙니다. 실제 서버 인증·결제·추첨·예약 처리와 관리자 권한은 개발자 전달 문서의 범위에 따라 구축해야 합니다.')])]

dev=[
('인수 범위와 실행',[
 P('이 저장소는 사용자 화면과 관리자 기능을 연결한 React·Vite 프로토타입입니다. 브라우저 안에서 거래와 보상 상태를 변경하며, 실제 서버·DB·PG·본인인증은 연결하지 않았습니다. 현재 화면을 기능 명세의 기준으로 사용하되 서버 권한과 거래 원장은 별도로 구현해야 합니다.'),
 T(['항목','위치 또는 방법'],[['사용자','https://sspluskorea.github.io/random-box/#home'],['관리자','https://sspluskorea.github.io/random-box/#admin'],['소스','https://github.com/sspluskorea/random-box'],['설치와 실행','Node.js 22 이상 / npm ci / npm run dev -- --host 127.0.0.1 --port 4173'],['검증','npm test / npm run test:harness / npm run build:pages'],['게시 방식','main 브랜치의 docs 폴더를 GitHub Pages로 게시합니다.'],['안내서 원본','scripts/build-guides.py → public/guides → 빌드 시 docs/guides로 복사합니다.']]),
 P('가입·로그인은 빈 입력으로도 진행되도록 의도적으로 허용했습니다. 공개 관리자 경로에도 인증 장벽이 없습니다. 이를 실서비스 인증 설계로 재사용하지 않습니다. 카드번호·실제 비밀번호를 수집하는 결제 폼을 추가하지 말고 PG와 인증 제공자의 화면을 연결합니다.'),
 P('기존 docs의 조사·기획 자료는 참고 이력입니다. 현재 기능과 정책은 이 문서, 소스, 테스트를 기준으로 확인합니다. 브라우저 저장 내용을 서버에 자동 이전하는 기능은 없습니다.')]),
('화면과 코드 연결',[
 T(['파일 또는 경로','역할'],[['src/App.jsx','해시 라우팅, 상태 저장, 탭 동기화, 주기 처리, 사용자 공통 화면'],['src/demoStore.js','transition과 seedState/loadState, 구매·충전·환급 등 기존 거래'],['src/platformModel.js','천장, 순결제 집계, 캠페인, 버닝, 캐시, 자동 전환'],['src/CustomerFlows.jsx','회원가입·로그인·충전·지갑·구매·개봉·보관함·환급·배송·문의'],['src/RewardsPages.jsx','천장·누적 혜택·캐시·출석·추천·알림·상품 상세'],['src/AdminConsole.jsx와 RewardsAdmin.jsx','관리자 기본 CRUD와 확률 편집, 천장·이벤트·캐시 운영'],['src/adminTableModel.js와 adminMenuHelp.js','24개 메뉴 구성, 표시 열, 사용 설명'],['src/policyModel.js와 PolicyPages.jsx','정책 버전·공개 조건·거래 스냅샷·권리 요청'],['src/Transparency.jsx와 BoxOpening.jsx','공개 당첨·개인 이력·확률 안내 및 결과 애니메이션']]),
 P('주요 경로는 #boxes, #checkout, #open, #inventory, #charge, #wallet, #refunds, #orders, #mypage입니다. 새 보상 경로는 #rewards, #benefits, #cash, #attendance, #referral, #notifications, #product/{상품ID}입니다. #admin에서 관리자 내부 메뉴를 선택합니다.'),
 P('약관은 #terms, #privacy, #point-policy, #refund-policy, #shipping-policy, #reward-policy입니다. #recovery, #withdrawal, #rights, #returns는 관리자 문의로 연결되는 신청 화면이고 #receipts는 거래 명세입니다. 알 수 없는 경로는 안내 화면으로 처리합니다.')]),
('상태 구조와 거래 계약',[
 P('저장 키는 modu-meeting-v2입니다. 최상위 version은 2, platform.version은 1입니다. loadState가 구형 상태에 새 설정·보상 배열·등급·카탈로그를 보완합니다. 기존 거래, 이미지와 운영자가 수정한 정책을 보존합니다. migration은 반복 실행해도 시드 상품을 중복 추가하지 않아야 합니다.'),
 T(['데이터','주요 내용'],[['wallet와 members','paid·bonus·cash, 회원별 잔액·공개 선택·추천 코드'],['products와 boxes','A~E 등급, 원가·가치·재고·이미지, productOdds 또는 기존 tiers'],['charges·orders·inventory','승인·취소 원금, 구매·배송, 당첨 당시 가치·전환액·기한·정책'],['ledger·refunds·conversions','잔액 종류와 회원, 입출금 사유, 환급·전환·복원 기록'],['platform.pityCycles·pityClaims','회원·등급별 회차 기준, 지급 상품·회차·기준금액·요청번호'],['platform.campaigns·rewardGrants','이벤트 조건과 지급 당시 조건·회차'],['platform.burningTickets·boxTickets','지정 박스와 확률·남은 횟수, 특별박스 사용권'],['platform.adjustments·settlements','사유가 있는 정정과 취소 후 정산 검토'],['platform.probabilityHistory·requests','확률 변경 전후와 중복 요청 기록']]),
 P('transition(state, action)은 성공 시 {ok:true,state}, 실패 시 {ok:false,error}를 반환합니다. 실패한 거래를 일부 반영하지 않습니다. App은 저장 성공 후 화면 상태를 바꿉니다. 저장 공간 부족 시 이미지를 줄이도록 안내합니다.'),
 P('현재 localStorage 동기화는 동일 출처 탭 간 변경 반영입니다. 다중 브라우저 동시 결제, 서버 트랜잭션, 장애 복구나 감사 보안을 보장하지 않습니다. 서버 구현에서 해당 제약을 해결해야 합니다.')]),
('금액과 천장 산정',[
 P('인정 결제금액은 해당 회원의 충전 완료·부분 취소 행에서 원금에서 누적 취소액을 뺀 금액을 합산합니다. 승인 대기·실패·완전 취소는 제외합니다. 무료 지급, 캐시, 쿠폰, 포인트 재사용과 박스 구매금액은 추가 적립하지 않습니다.'),
 P('등급별 유효 진행액 = 순충전액 + 관리자 정정 합계 − 해당 등급 수령 기준금액 합계입니다. 화면 진행액은 0 이상으로 표시하고, 음수분은 정산 필요액으로 따로 남깁니다. A와 B의 수령 합계는 서로 공유하지 않습니다.'),
 P('기본 B 10,000,000원, A 40,000,000원입니다. 최초 인정 충전 시 각 회차의 기준을 고정합니다. 기준 변경 후에도 진행 중 회차는 기존 값을 사용하며, 수령 후 다음 회차에 새 기준을 적용합니다. 한 번 수령할 때 한 회차만 차감하고 초과분을 유지합니다.'),
 T(['작업','입력과 처리'],[['CHARGE','amount·method·requestId. 승인 원금과 보너스 기록 후 누적 보상 확인'],['REFUND_CHARGE','id·memberId·amount. 잔여 원금 내 부분 취소, 보너스 비례 회수, 인정액 재계산'],['CLAIM_PITY','grade·category·requestId. 조건·재고 확인 후 상품 지급과 해당 회차 소진'],['ADMIN_CLAIM_PITY','memberId와 reason 추가. 동일 조건을 확인하고 처리 담당·사유 저장'],['ADMIN_PITY_ADJUST','memberId·grade·amount·reason. 진행금액만 정정하고 이력 저장'],['RESOLVE_SETTLEMENT','id·note. 검토 메모 저장이며 채무나 잔액을 자동 해소하지 않음']]),
 P('수령은 보관함 확정 지급 시점입니다. 배송 완료 시점과 혼동하지 않습니다. 남성·여성·가전 중 선택한 카테고리의 지급 가능한 지정 상품을 사용합니다. 품절이면 권리를 보존하고 차감하지 않습니다. 실제 대체 상품 제안과 동의 수집은 후속 개발 범위입니다.')]),
('확률과 이벤트 및 전환',[
 H('추첨 조건'),
 P('상품별 확률은 productOdds 배열로 저장합니다. 합계 100%, 중복 상품, 존재 여부와 재고·상태를 검증합니다. 0%를 포함해 박스에서 참조하는 상품은 참조 해제 전 삭제하지 않습니다. 확률표를 구매 결과에 보존하고 공개 화면과 실제 선택 계산이 같은 데이터를 사용합니다.'),
 P('기존 6개 박스는 금액대 선택 후 해당 구간 내 재고 상품을 균등 선택합니다. 새 7번 박스는 A~E 개별 확률입니다. 관리자는 기존 박스도 상품별 방식으로 변경할 수 있습니다. 평균 간격은 100/p, n회 중 한 번 이상은 1−(1−p/100)^n이며 보장 횟수로 표현하지 않습니다.'),
 P('버닝은 지정 박스의 A 합계를 설정 비율로 맞추고 다른 등급 합계를 나머지 비율로 조정합니다. 기본 10%는 10%포인트 가산이 아닙니다. 화면에 최종 표를 표시하고 구매 결과에도 적용 표를 저장합니다.'),
 H('캠페인과 참여 보상'),
 P('SAVE_CAMPAIGN은 금액·기간·종류·지급액·상품·횟수 등을 저장합니다. 기본 구간은 100만·200만·300만·500만·1,000만원이며 points/cash/box/burning/product를 지원합니다. 기간은 한국 날짜 기준, 반복 회차 목표는 기준금액×회차입니다. 동일 이벤트·회원·회차의 중복 지급을 막습니다.'),
 P('회원가입은 최초 1회, 출석은 KST 하루 1회입니다. 추천은 본인·중복 등록을 제한하고 충전 조건을 확인합니다. 신원 기반 다중 가입 탐지는 구현하지 않았습니다. 실서비스는 인증 식별자와 심사 기준이 필요합니다.'),
 H('캐시와 자동 전환'),
 P('CASH_CONVERT는 상품 고정액 또는 기준가×기본60%를 캐시에 반영합니다. 금액과 기한은 당첨 시 보존합니다. PROCESS_DUE는 새 일반 상품의 240시간 만료와 3일·1일 전 알림을 처리합니다. 천장 상품·배송 요청·과거 기한 없는 상품은 제외합니다. 자동 전환은 보너스 포인트로 지급합니다. 페이지 실행·포커스·60초 점검으로만 동작하므로 서버 예약 작업을 별도 구축해야 합니다.')]),
('실서비스 구현 순서와 운영 확정 사항',[
 L('회원 인증과 관리자 권한부터 분리합니다. 일반 회원에게 관리자 API 접근을 허용하지 않고 역할별 조회·수정·환급 권한을 둡니다.','서버 DB에 회원별 지갑, 승인·취소 원장, 주문·당첨·재고를 구축합니다. 금액은 정수로 처리하고 거래번호·요청번호에 유일성 제약을 둡니다.','PG 승인·취소 콜백을 검증합니다. 승인·원장·천장 적립을 하나의 거래로 처리하고 중복 콜백과 순서 역전·실패 재시도를 검증합니다.','서버 추첨과 재고 예약을 구현합니다. 잔액 차감·재고 차감·당첨·천장 수령·이벤트 지급이 원자적으로 성공하거나 실패하도록 구성합니다.','이미지 저장소, 업로드 검증, 배송 연동, 알림 발송과 예약 전환 작업을 연결합니다. 작업 재시작과 중복 실행에도 한 번만 처리되게 합니다.','관리자 승인 이력과 변경 전후 값을 서버에 보존합니다. 배포·접근권한·모니터링·백업 복구를 구성하고 운영 검수 후 공개합니다.'),
 H('운영사와 확정할 내용'),
 P('보상 수령 후 취소 시 상품 회수·캐시 회수·채무 조정의 순서, 사용한 이벤트 보상 회수, 품절 대체상품 동의, 자동 전환 전 통지와 이의 접수, 캐시 유효기간·소멸·현금성 여부를 확정해야 합니다. 현재 제작본은 정산 검토 기록을 남기며 실물 회수나 계좌 출금을 실행하지 않습니다.'),
 P('가입 연령, 미성년자 절차, PG 취급 가능 여부, 확률형 판매의 법적 분류, 전자상거래 청약철회와 선불 잔액 규율, 개인정보 수집·위탁·제3자 제공을 사업 구조에 맞춰 별도로 검토해야 합니다. 현재 동의 선택은 기록하지만 실제 본인인증이나 필수 동의 강제는 시연을 위해 완화했습니다.'),
 P('개발 견적과 일정은 인증·PG·상품 공급·배송 제공자, 서버 구조, 운영 정책을 확정한 뒤 산정합니다. 현재 문서에는 근거 없이 개발비나 납기를 확정하지 않았습니다.')]),
('검수 기준과 현재 확인 결과',[
 T(['검수 항목','통과 기준'],[['결제와 재시도','같은 요청번호로 재전송해도 승인·잔액·재고·보상은 한 번만 반영'],['천장','4천만원에서 B 4회와 A 1회 가능, 초과금액 이월, 일반 당첨 초기화 없음'],['취소와 회원 분리','부분 취소 합계가 원금을 넘지 않음, 타회원 환급은 그 회원 지갑에만 반영'],['재고와 실패 원자성','품절·잘못된 확률·만료 상품 실패 시 잔액과 다른 기록에 부분 반영 없음'],['확률','공개 표와 추첨 경계 일치, 합계100%, 과거 거래표 불변'],['전환','전환액 스냅샷 유지, 만료 후 환급 차단, 자동 전환 중복 없음'],['이벤트','KST 기간·다음회차 목표·최대횟수·중복 지급·버닝 표 일치'],['UI와 저장','업로드 이미지 반영, 관리자 변경 사용자 반영, 모바일 넘침·폼·오류 표시 확인'],['배포','공개 URL과 안내서·Word 다운로드의 HTTP 정상 응답, 게시 소스·빌드 일치']]),
 P('수정 후 자동 테스트 120개가 통과했습니다. 이 중 독립 QA가 추가한 경계 테스트는 15개입니다. 별도 사용자·관리자 상태 연동 하네스 14개도 통과했습니다. 실제 Chrome에서 충전, 독립 A/B 수령, 부분 취소 후 정산 반영을 확인했으며 모바일 천장·상품 화면의 가로 넘침도 점검했습니다.'),
 P('독립 검수에서 승인 대기 금액 집계, 만료 상품 환급, 타회원 환급 승인 지갑, 0% 참조 상품 삭제, 반복 이벤트 목표와 캐시 환급 단위 불일치를 찾아 수정하고 다시 검증했습니다. 관련 테스트는 tests/independent-platform-qa.test.mjs에 보존합니다.'),
 P('Vite 빌드는 성공했습니다. 단일 JS 번들이 약 580KB라 분할 권고 경고가 있습니다. 서버 보안·실제 결제·전 기종 검증이 통과했다는 의미는 아닙니다. 자동 테스트와 상태 하네스는 실제 PG 검수나 외부 확률 인증을 대신하지 않습니다.')])]

admin_rows=service[5][1][0][2]
service[5]=('관리자에서 회원과 보상 운영하기',[P('배송 신청과 회원 잔액을 확인하고, 천장 조건을 충족한 보상을 처리합니다. 금액을 정정할 때는 원래 거래와 정정 사유를 함께 확인합니다.'),T(['관리자 메뉴','처리 순서와 반영 결과'],admin_rows[:6]),H('정산 기록 확인'),P('충전 취소 후 정산 필요액이 생기면 관련 회원과 보상 지급 내역을 확인합니다. 검토 완료는 메모 기록이며 지급 상품 회수나 금액 정정은 별도의 처리입니다.')])
service.insert(6,('콘텐츠와 고객지원 운영',[P('회원에게 공개할 안내와 문의 답변을 관리합니다. 게시 상태와 시행일을 확인한 뒤 저장하고 사용자 화면에서 내용을 확인합니다.'),T(['관리자 메뉴','처리 순서와 반영 결과'],admin_rows[6:])]))

STYLE='''body{margin:0;background:#f5f6fa;color:#202432;font:16px/1.8 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}header{background:#10152a;color:white;padding:35px max(24px,calc((100vw - 1050px)/2))}header h1{margin:8px 0;font-size:32px}header a{color:#d9ceff}nav{display:flex;gap:12px;flex-wrap:wrap}nav a{padding:8px 14px;border:1px solid #757b90;border-radius:8px;text-decoration:none}main{max-width:1050px;margin:auto;padding:28px 22px 70px}section{background:white;padding:30px;margin:24px 0;border:1px solid #e2e5ec;border-radius:12px;scroll-margin-top:20px}h2{font-size:25px;margin:0 0 20px}h3{font-size:19px;margin-top:28px}p{margin:14px 0}li{margin:10px 0}table{width:100%;border-collapse:collapse;font-size:15px}th,td{border:1px solid #d9d9d9;padding:12px 15px;text-align:left;vertical-align:top}th{background:#ecedf4}td:first-child{width:26%;font-weight:600}.toc{columns:2}.toc a{color:#423080}input{box-sizing:border-box;width:100%;padding:13px;font:inherit;border:1px solid #b9bfd0;border-radius:8px}footer{color:#626979;text-align:center;padding:25px}code{overflow-wrap:anywhere}@media(max-width:600px){header h1{font-size:26px}section{padding:20px 15px}.toc{columns:1}table{font-size:13px}td,th{padding:9px}td:first-child{width:29%}main{padding:12px}}@media print{body{background:white;font-size:11pt}header{background:white;color:black;padding:0}header nav,input,.toc{display:none}main{padding:0;max-width:none}section{border:0;padding:0;break-before:page}section:first-of-type{break-before:auto}a{color:black}footer{display:none}}'''
def make_html(slug,title,pages):
 blocks=[]
 for i,(heading,content) in enumerate(pages):
  b=[f'<section id="chapter-{i+1}"><h2>{i+1}. {escape(heading)}</h2>']
  for x in content:
   if x[0] in ('p','h'):b.append(f'<{"p" if x[0]=="p" else "h3"}>{escape(x[1])}</{"p" if x[0]=="p" else "h3"}>')
   elif x[0]=='list':b.append('<ol>'+''.join('<li>'+escape(t)+'</li>' for t in x[1])+'</ol>')
   else:b.append('<table><thead><tr>'+''.join('<th>'+escape(t)+'</th>' for t in x[1])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+escape(t)+'</td>' for t in r)+'</tr>' for r in x[2])+'</tbody></table>')
  blocks.append(''.join(b)+'</section>')
 toc='<ol class="toc">'+''.join(f'<li><a href="#chapter-{i+1}">{escape(h)}</a></li>' for i,(h,_) in enumerate(pages))+'</ol>'
 (OUT/(slug+'.html')).write_text('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+title+' | 모두의박스</title><style>'+STYLE+'</style><header><small>모두의박스</small><h1>'+title+'</h1><nav><a href="../#admin">관리자 화면</a><a href="../#home">사용자 화면</a><a href="'+slug+'.docx" download>Word 문서 다운로드</a><a href="'+('developer-guide' if slug=='service-guide' else 'service-guide')+'.html">'+('개발자 전달 문서' if slug=='service-guide' else '서비스 이용 가이드')+'</a></nav></header><main>'+toc+'<label for="find">문서에서 찾기</label><input id="find" type="search" placeholder="메뉴 이름이나 궁금한 내용을 입력하세요">'+''.join(blocks)+'</main><footer>모두의박스 · 서비스 화면과 함께 확인하는 안내서</footer><script>document.querySelector("#find").addEventListener("input",e=>{const q=e.target.value.trim();document.querySelectorAll("section").forEach(s=>s.hidden=q&&!s.textContent.includes(q))})</script></html>')
def make_docx(slug,title,pages):
 d=Document();sec=d.sections[0];sec.page_width=Inches(8.5);sec.page_height=Inches(11);sec.top_margin=Inches(.68);sec.bottom_margin=Inches(.65);sec.left_margin=Inches(.8);sec.right_margin=Inches(.8)
 for name,size in [('Normal',10.5),('Title',24),('Heading 1',18),('Heading 2',12.5),('Caption',9)]:
  st=d.styles[name];st.font.name='Noto Sans CJK KR';st.font.size=Pt(size);st.font.color.rgb=RGBColor(0,0,0);st.element.get_or_add_rPr().rFonts.set(qn('w:eastAsia'),'Noto Sans CJK KR');st.paragraph_format.space_after=Pt(5);st.paragraph_format.line_spacing=1.08
 d.styles['Normal'].font.size=Pt(11)
 for st in d.styles:
  if st.type==1:
   for border in list(st.element.findall('.//'+qn('w:pBdr'))):border.getparent().remove(border)
 sec.header.paragraphs[0].text='모두의박스  /  '+title;sec.header.paragraphs[0].style='Caption'
 f=sec.footer.paragraphs[0];f.alignment=2
 field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');f._p.append(field)
 for i,(heading,content) in enumerate(pages):
  if not i:d.add_paragraph(title,'Title')
  heading_p=d.add_paragraph(str(i+1)+'  '+heading,'Heading 1')
  if i:heading_p.paragraph_format.page_break_before=True
  for x in content:
   if x[0]=='p':d.add_paragraph(x[1])
   elif x[0]=='h':d.add_paragraph(x[1],'Heading 2')
   elif x[0]=='list':
    for n,t in enumerate(x[1],1):d.add_paragraph(str(n)+'. '+t)
   else:
    t=d.add_table(rows=1,cols=len(x[1]));t.autofit=False;t.columns[0].width=Inches(1.65);t.columns[1].width=Inches(5.25)
    for j,v in enumerate(x[1]):t.rows[0].cells[j].text=v
    for r in x[2]:
     cells=t.add_row().cells
     for j,v in enumerate(r):cells[j].text=v
    for ri,r in enumerate(t.rows):
     for ci,c in enumerate(r.cells):
      c.width=Inches(1.65 if ci==0 else 5.25);tcPr=c._tc.get_or_add_tcPr();b=OxmlElement('w:tcBorders')
      for edge in ('top','left','bottom','right','insideH','insideV'):
       el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');b.append(el)
      tcPr.append(b);m=OxmlElement('w:tcMar')
      for edge in ('top','bottom','left','right'):
       el=OxmlElement('w:'+edge);el.set(qn('w:w'),'60');el.set(qn('w:type'),'dxa');m.append(el)
      tcPr.append(m)
      if ri==0:
       sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E8EBF3');tcPr.append(sh)
      for p in c.paragraphs:
       p.paragraph_format.space_after=Pt(1);p.paragraph_format.line_spacing=1.0
       for run in p.runs:run.font.size=Pt(10);run.bold=ri==0
     pr=r._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))

 d.core_properties.title=title;d.core_properties.author='하하랩';d.core_properties.subject='모두의박스 기능 및 운영 안내';d.save(OUT/(slug+'.docx'))
for slug,title,pages in [('service-guide','서비스 이용 가이드',service),('developer-guide','개발자 전달 문서',dev)]:
 make_html(slug,title,pages);make_docx(slug,title,pages)
print('Created 2 HTML guides and 2 DOCX files in',OUT)
