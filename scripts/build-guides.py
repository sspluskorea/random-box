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
 P('모두의박스는 페이를 충전하고 포인트와 페이로 박스를 구매한 뒤, 당첨 상품을 배송받거나 포인트로 전환하는 서비스입니다. 페이는 환전 신청이 가능하고 포인트는 환전할 수 없습니다. 이 구분을 먼저 이해하면 결제와 상품 처리 화면을 쉽게 사용할 수 있습니다.'),
 L('회원가입과 로그인 후 마이페이지에서 보유 페이와 포인트를 확인합니다.','페이 충전에서 금액·결제수단·추가 포인트를 확인하고 승인합니다.','랜덤박스에서 구성품과 최종 확률을 확인한 후 수량과 쿠폰을 선택합니다. 포인트를 먼저 쓰고 부족한 금액만 페이에서 차감합니다.','개봉 결과를 확인합니다. 애니메이션을 건너뛰어도 이미 정해진 상품은 바뀌지 않습니다.','보관함에서 배송을 신청하거나 상품을 포기하고 표시된 포인트를 받습니다.'),
 H('화면 이용 범위'),P('현재 화면은 브라우저에 기록을 저장합니다. 같은 브라우저의 관리자와 사용자 화면에서 처리 결과를 확인할 수 있습니다. 다른 기기에는 기록이 공유되지 않습니다. 실제 DB, 본인인증, PG 승인, 계좌 송금, 택배 접수, 문자 발송과 서버 예약 작업은 연결되어 있지 않습니다.'),
 P('기본 체험 설정에서는 빈 입력으로 가입·로그인·결제 흐름을 확인할 수 있습니다. 관리자가 필수 동의 확인을 켜면 필수 항목에 동의해야 진행됩니다. 실제 비밀번호나 카드정보는 입력하지 않습니다.')]),
('페이와 포인트 관리',[
 T(['구분','사용 기준'],[['페이','직접 충전한 잔액입니다. 1페이=1원 상당이며 환전 신청할 수 있습니다.'],['포인트','충전 보너스·상품 포기·이벤트 등으로 지급합니다. 박스 구매에 쓰며 환전할 수 없습니다.']]),
 H('충전과 이용 내역'),P('마이페이지의 페이 충전에서 금액을 선택합니다. 승인 전 충전 페이와 추가 포인트를 따로 확인하세요. 지갑에는 두 잔액과 이용 내역이 표시됩니다. 예를 들어 10,000원 박스 구매 시 포인트가 3,000P 있으면 3,000P와 7,000페이가 사용됩니다.'),
 H('충전 취소'),P('지갑의 충전 내역에서 미사용 충전 취소를 누릅니다. 이미 취소된 금액을 제외한 남은 원금과 회수할 보너스를 확인합니다. 원금이나 포인트가 부족하면 취소가 제한되므로 고객센터에 문의합니다. 관리자 부분 취소도 원금과 비례 보너스를 함께 정산합니다.'),
 H('페이 환전'),L('마이페이지의 페이 환전에서 신청 금액을 입력합니다. 포인트는 신청 대상이 아닙니다.','금액과 포인트 환전 불가 안내를 확인하고 신청합니다. 신청 즉시 해당 페이가 예약 차감됩니다.','신청 상태에서는 직접 취소할 수 있습니다. 취소·거절 시 예약 페이가 한 번 반환됩니다. 승인 시 추가 차감은 없습니다.'),
 P('환전 승인은 화면상의 처리 상태이며 실제 송금 완료 증빙이 아닙니다. 별도 만료일이 없는 잔액은 기본 무기한이며 현재 자동 잔액 소멸을 실행하지 않습니다.')]),
('박스 구매와 상품 확인',[
 L('랜덤박스에서 이름·카테고리로 찾습니다. 담기는 장바구니, 하트는 관심 박스로 연결됩니다.','박스 열기를 누르면 구매 화면이 나옵니다. 상품별 이미지·등급·재고·최종 확률을 확인합니다. 상품명을 누르면 브랜드·사양·구성·기준가격·상세 설명을 볼 수 있습니다.','수량과 쿠폰을 선택합니다. 버닝 이용권이 있다면 적용 가능한 박스에서 선택하고 바뀐 확률을 확인합니다.','포인트 사용액, 페이 사용액, 총 결제금액과 상품 수령 기한을 확인한 후 구매합니다. 가입할 때 등록한 연락처를 다시 입력할 필요는 없습니다.'),
 P('여러 개를 한 번에 개봉하면 순서대로 결과가 결정됩니다. 각 회차에서 게이지가 달라질 수 있어 첫 회차 확률이 전체 회차에 똑같이 적용되지는 않습니다. 나의 언박싱에서 개별 기록의 실제 적용 확률표를 확인합니다.'),
 H('확률을 읽는 방법'),P('1%는 같은 확률로 반복할 때 평균 100회당 1회라는 뜻이며 100회 안에 반드시 당첨된다는 뜻은 아닙니다. 같은 1%가 유지되는 독립 추첨에서 100회 중 한 번 이상 당첨될 가능성은 약 63.4%입니다. 게이지로 확률이 바뀌면 이 고정확률 계산과 실제 결과를 구분해야 합니다.')]),
('개봉 게이지 이해하기',[
 P('사용자 화면에서는 개봉 게이지, 관리자 메뉴에서는 천장 게이지로 표시합니다. 현재 방식은 누적 결제금액으로 상품을 확정 지급하지 않습니다. 정해진 개봉 횟수 이후 해당 등급에 당첨될 때 그 등급의 게이지가 쌓입니다. A~E는 서로 독립적입니다.'),
 L('적립 시작 개봉수를 채웁니다. 시작값이 10이면 첫 10회 뒤부터 해당 등급 당첨 시 적립합니다.','설정된 증가량만큼 해당 당첨 등급 게이지가 올라갑니다. 다른 등급 게이지를 대신 올리지 않습니다.','100%가 되면 다음 개봉부터 정해진 횟수만큼 확률을 높입니다. 준비된 등급 중 A→E 순서로 하나를 적용합니다.','적용 횟수를 모두 쓰면 해당 게이지만 0이 됩니다. 대상 상품이 없거나 이미 해당 등급이 100%라면 강화 횟수를 쓰지 않습니다.'),
 P('예를 들어 A등급 기본 합산 확률 2%에 +5%p를 적용하면 7%가 됩니다. 나머지 등급 합계는 93%가 되도록 비례 조정합니다. 최대값은 100%이며 게이지 100% 자체가 상품 당첨을 보장하지 않습니다.'),
 P('현재 시연 초기값은 A·B 활성, 시작 10회, 해당 등급 당첨 시 20% 적립, 확률 +5%p, 강화 1회입니다. 운영 확정값이 아니며 관리자가 바꿀 수 있습니다. 새 제도 이전 개봉은 소급하지 않아 게이지 적용 개봉과 전체 언박싱 건수가 다를 수 있습니다. 이전 확정보상은 별도 이력에서 조회만 합니다.')]),
('보관함과 상품 포인트 전환',[
 H('배송받을 상품'),P('보관함에서 상품을 선택해 배송 신청을 누릅니다. 수령인·주소·배송비를 확인하고 필요한 정보 제공에 동의합니다. 주문·배송에서 상태와 송장을 확인할 수 있습니다.'),
 H('상품을 포기할 때'),P('상품 포인트 전환을 누르면 기준가격, 당첨 당시 반환율, 지급 포인트가 표시됩니다. 기본 반환율은 60%이며 상품별 비율이 있으면 우선합니다. 기준가격 100,000원과 반환율 60%이면 60,000P입니다. 0%도 유효한 설정이므로 지급액이 0P인지 확인해야 합니다.'),
 P('소수점 아래는 버립니다. 당첨 당시 반환 조건을 저장하므로 이후 설정 변경으로 이미 보관한 상품의 금액이 달라지지 않습니다. 과거 고정 전환액을 보존한 상품은 현재 비율을 다시 계산하지 않고 기존 확정 반환액을 동일 금액의 포인트로 표시합니다. 포인트는 환전 불가입니다.'),
 P('전환 후 상품 복구가 허용된 경우, 표시된 기한과 하루 허용 횟수 안에서 지급 포인트를 회수하고 상품을 복구합니다. 포인트가 부족하거나 기한이 지나면 복구되지 않습니다.'),
 H('수령 기한'),P('새 일반 상품의 기본 기한은 240시간입니다. 미신청 상품은 당시 반환액의 포인트로 전환됩니다. 기한 전 알림함 안내를 확인하세요. 배송 신청 상품·이전 확정보상 등 제외 대상과 기한 없는 과거 상품을 구분합니다. 실제 상시 자동 작업과 문자 발송은 연결되지 않습니다.')]),
('품절 대체와 취소 문의',[
 L('품절 상품의 대체 제안은 보관함 상단에서 확인합니다. 원상품·대체 상품·사유·상태를 비교합니다.','수락하면 배송 대상이 대체 상품으로 연결됩니다. 원당첨 결과, 당시 확률과 반환 기준은 유지됩니다.','거절하면 원상품을 유지합니다. 이후 배송이나 취소 방법은 고객센터에 문의합니다.','제안 대기 중에는 배송·전환을 진행할 수 없습니다. 신청 기한이 끝나면 제안이 종료되고 예약 재고가 반환됩니다.'),
 P('취소·반품 신청은 상품 포기와 다른 절차입니다. 하자·오배송·배송 지연·청약철회 사유와 대상 거래를 선택해 접수합니다. 상품 반환율을 법정 청약철회에 일괄 적용하지 않습니다. 실제 회수나 PG 취소는 별도 연결이 필요합니다.'),
 H('문의 후 확인'),P('고객센터의 나의 문의에서 접수 상태와 답변을 확인합니다. 상품·주문 번호를 함께 적으면 운영자가 기록을 찾기 쉽습니다. 개인정보 권리 요청, 계정 복구, 회원 탈퇴 요청도 처리 내역을 남기는 접수 기능이며 실제 인증 메일이나 개인정보 삭제를 자동 실행하지 않습니다.')]),
('혜택과 개인 메뉴',[
 T(['메뉴','확인할 내용'],[['누적 결제 혜택','이벤트 기간 안의 유효 충전금과 회차별 목표를 확인합니다. 취소금은 제외하고 반복 이벤트는 다음 목표를 채워야 합니다.'],['출석체크와 친구 초대','출석은 한국 시간 기준 하루 한 번입니다. 추천 코드를 등록하고 충전 조건을 충족하면 설정된 양쪽 보상을 받습니다.'],['내 쿠폰과 이용권','유효기간·잔여횟수·최소금액을 확인합니다. 특별 박스와 버닝 이용권은 적용 조건에 맞게 사용합니다.'],['선물함과 포인트샵','운영자가 활성화한 기능만 이용합니다. 상품·잔액·제한을 확인하며 포인트는 환전되지 않습니다.'],['알림','수령 마감과 처리 결과를 확인합니다. 실제 문자·메일 발송과 구분됩니다.'],['언박싱과 커뮤니티','공개 설정에 따른 기록과 게시물을 확인합니다. 브라우저 기록을 전체 실회원 검증 결과로 해석하지 않습니다.'],['회원정보와 약관','닉네임·연락처·공개 선택·마케팅 선택을 관리합니다. 필수와 선택 동의를 구분합니다.'],['거래 명세','본인의 충전·주문 기록과 당시 정책을 확인합니다. PG 영수증이나 세금계산서는 아닙니다.']]),
 P('공지사항·이벤트·자주 묻는 질문·이용방법·확률 안내·사업자 안내는 해당 메뉴에서 확인합니다. 지급 포인트는 현금 보상과 구분하며 누적 혜택은 개봉 게이지와 별도입니다.')]),
('관리자 업무 시작하기',[
 P('관리자는 목록에서 필수 항목을 비교한 후 상세보기를 눌러 행 아래에서 전체 값과 기록을 확인합니다. 메뉴 검색으로 화면을 찾고 필터를 사용해 대상을 좁힙니다. 변경 전 회원 ID와 상품 ID를 먼저 확인하세요.'),
 L('상품 등록·재고에서 구성 상품을 준비합니다.','랜덤박스 관리와 상품별 당첨 확률에서 박스 구성과 합계 100%를 확인합니다.','페이 충전·보너스, 상품 포인트 전환 설정, 천장 게이지에서 운영값을 저장합니다.','배송비·배송 정책과 약관·정책에 실제 안내를 입력합니다.','사용자 화면에서 가입·충전·구매·배송 또는 포인트 전환을 확인하고 관리자 원장과 대조합니다.'),
 P('저장 오류가 나면 메시지에 표시된 필수값·금액·단위·기간·재고를 먼저 수정합니다. 실패한 작업을 완료로 안내하지 마세요. 다른 탭에서 상태가 바뀌었다는 안내가 나오면 최신 상태를 불러온 뒤 다시 확인합니다. 저장소 오류가 해결되기 전 반복 처리하지 않습니다.'),
 P('현재 공개 관리자 화면에는 실제 서버 권한 통제가 없습니다. 실회원이나 실거래를 관리하는 운영 도구로 바로 사용하지 않습니다. 관리자 역할별 권한과 승인 절차는 실제 서비스 개발에서 구현해야 합니다.')]),
('상품과 박스 등록하기',[
 H('상품 등록 및 재고'),L('상품 등록·재고에서 이름·A~E 등급·기준가격·재고·판매 상태를 입력합니다. 브랜드·사양·설명도 준비합니다.','대표 이미지와 상세 이미지는 파일로 업로드합니다. 상품별 반환율을 비워 두면 기본값, 0~100 사이 값을 넣으면 개별값이 적용됩니다.','저장 후 사용자 상품 상세에서 이미지와 설명을 확인합니다. 잘못된 파일 형식이나 수치는 오류를 수정하고 다시 저장합니다.'),
 H('랜덤박스와 당첨 확률'),L('랜덤박스 관리에서 이름·가격·총수량·잔여수량·상태를 입력하고 대표·상세 이미지를 올립니다. 이미지는 수정창에서 관리합니다.','상품별 당첨 확률에서 상품과 확률을 등록합니다. 중복 상품, 합계 100%, 재고와 판매 상태를 확인합니다.','저장 후 사용자 결제 화면의 구성품 이미지와 최종 확률을 대조합니다. 재고가 없는 양의 확률 상품이 있으면 판매 상태와 재고를 먼저 수정합니다.'),
 P('상품 목록의 당첨내역과 판매내역 버튼은 해당 상품 ID 필터를 적용합니다. 목록의 필터 칩에서 해제하거나 다른 메뉴로 이동하면 초기화됩니다. 개봉·당첨 이력에서 당시 확률표를 펼쳐 확인하며 현재 설정값으로 과거 확률을 대체하지 않습니다.')]),
('페이와 포인트 처리하기',[
 H('충전과 원장'),P('페이 충전·보너스에서 선택 금액과 추가 포인트율을 저장합니다. 충전 내역에서 원금·보너스·취소액을 확인하고 필요한 취소 금액을 입력합니다. 처리 후 페이·포인트 원장과 사용자 지갑을 대조합니다.'),
 H('상품 전환 관리'),P('상품 포인트 전환 설정에서 기본 반환율과 복구 조건을 관리합니다. 상품 등록·재고의 개별 반환율이 기본값보다 우선합니다. 상품 포인트 전환 목록에서는 지급 포인트와 당시 기준가격·비율·기한을 상세보기로 확인합니다. 과거 확정액은 보존하며 현재 비율로 다시 계산하지 않습니다.'),
 H('페이 환전 승인'),L('페이 환전에서 신청 회원·금액·상태를 확인합니다. 신청 시 이미 예약 차감되었는지 원장과 대조합니다.','승인 또는 거절 사유를 입력하고 처리합니다. 승인 시 재차 차감하지 않으며 거절 시 예약액이 반환됩니다.','사용자 환전 내역과 지갑을 확인합니다. 화면상 승인을 실제 계좌 송금 완료로 안내하지 않습니다.'),
 H('잔액 조정'),P('회원별 페이·포인트 또는 회원 관리에서 회원을 선택합니다. 페이와 포인트 중 조정할 잔액을 고르고 양수 지급·음수 차감과 사유를 입력합니다. 저장 후 해당 회원의 두 잔액 및 원장을 확인합니다. 페이 조정은 환전 가능한 잔액을 바꾸므로 종류를 반드시 확인하세요.')]),
('게이지 운영값 설정하기',[
 P('관리자 천장 게이지는 회원별 게이지, 게이지·확률 설정, 강화 적용 기록, 이전 보상 기록의 네 탭으로 구성합니다. 결제금액 기반 확정보상 지급과 이전 게이지 금액 정정은 새 거래에서 사용하지 않습니다.'),
 L('게이지·확률 설정에서 활성 등급과 시작 개봉수, 해당 등급 당첨 시 증가량, 확률 증가 %p, 강화 횟수를 입력합니다.','변경 사유를 작성하고 저장합니다. 시작 횟수·증가량·횟수 범위 오류가 나오면 해당 값을 수정합니다.','회원별 게이지에서 새 규칙 적용 개봉수와 등급별 진행률을 확인합니다. 활성화 전 전체 개봉 기록과 혼동하지 않습니다.','사용자 개봉 게이지와 결제 화면에서 실제 적용 조건을 비교합니다. 강화 적용 기록에서는 강화 전후 확률과 해당 개봉을 확인합니다.'),
 P('이미 준비된 강화의 저장된 증가값과 횟수는 당시 조건을 보존합니다. 규칙 변경 후 기존 준비 상태와 새 적립 상태를 구분해 확인하세요. 여러 등급이 준비되면 A→E 순서로 적용 가능한 한 등급을 사용합니다.'),
 P('이전 보상 기록 탭은 과거 확정보상·정정·정산 기록을 조회하기 위한 화면입니다. 예전 결제금액을 새 개봉 게이지로 바꾸거나 과거 확정보상을 다시 지급하지 않습니다.')]),
('주문과 회원 문의 처리하기',[
 H('배송 처리'),L('회원 보관함에서 대상 상품과 현재 상태를 확인합니다. 주문·배송 관리에서 구매·이벤트 개봉·배송 신청을 구분합니다.','배송 신청 건의 주소와 상품명을 확인하고 상태를 변경합니다. 배송 처리에는 택배사와 송장번호가 필요합니다.','품절로 대체가 필요하면 상품·사유를 제안하고 사용자 수락을 기다립니다. 제안 중 예약 재고와 수락·거절 상태를 확인합니다.','저장 후 사용자 주문·배송에 수락한 실제 배송 상품명과 송장이 보이는지 확인합니다.'),
 P('배송비·배송 정책에서 배송비·무료배송 기준·안내를 저장하면 다음 신청 화면에 반영됩니다. 배송비 계산과 실제 비용 청구는 별도입니다.'),
 H('회원과 문의'),P('회원 관리에서 연락처·상태와 연결 기록을 확인합니다. 1:1 문의에서는 접수 내용을 읽고 답변과 처리 상태를 저장합니다. 취소·반품, 탈퇴, 계정 복구와 개인정보 권리 요청도 내용과 실제 처리 범위를 구분합니다. 답변 저장만으로 외부 메일 발송·계정 인증·정보 삭제가 실행되지는 않습니다.')]),
('콘텐츠와 약관 운영하기',[
 L('공지사항·자주 묻는 질문에서 제목 또는 질문, 본문, 공개 상태를 입력합니다. 저장 후 사용자 목록과 상세 화면을 확인합니다.','이벤트에서 기간·금액 조건·보상·최대 횟수를 관리합니다. 기간 역전이나 지급 상품 재고 오류는 먼저 해결합니다.','쿠폰에서 코드·할인금액·사용 횟수·유효기간·상태를 입력합니다. 사용자 구매 화면에 사용 가능한 쿠폰만 나오는지 확인합니다.','홈 배너에서 이미지·연결 주소·기간·상태를 관리합니다. 등록 기록이 실제 홈 노출까지 연결되는지 확인하며, 연결되지 않은 항목을 노출 완료로 판단하지 않습니다.','당첨 공개 설정에서 공개 여부와 이름 가림을 확인합니다. 회원의 비공개 선택은 공개 피드에서 제외되어야 합니다.'),
 H('약관과 동의'),P('약관·정책에서 사업자 정보, 정책 유형·버전·시행일·활성 상태를 입력합니다. 미래 시행일이나 비활성 정책은 현재 거래에 적용되지 않습니다. 새 기본 정책은 4.0이며 운영자가 수정한 과거 본문을 자동 덮어쓰지 않습니다.'),
 P('필수 동의 확인은 기본 꺼짐입니다. 켜면 가입·충전·구매·배송·환전의 필요한 확인 항목을 검증합니다. 제3자 제공을 켤 때는 실제 업체, 목적, 항목, 보유기간을 모두 입력하세요. 배송 시 안내와 동의 기록을 보존하며 실제 외부 전송은 실행하지 않습니다.')]),
('관리자 메뉴 빠르게 찾기',[
 T(['업무','메뉴'],[['박스와 상품 4개','랜덤박스 관리 / 상품별 당첨 확률 / 상품 등록·재고 / 개봉·당첨 이력'],['페이와 포인트 6개','충전 내역 / 페이 충전·보너스 / 상품 포인트 전환 / 페이 환전 / 상품 포인트 전환 설정 / 페이·포인트 원장'],['주문과 회원 6개','주문·배송 관리 / 배송비·배송 정책 / 회원 보관함 / 회원 관리 / 회원별 페이·포인트 / 천장 게이지'],['콘텐츠와 지원 8개','홈 배너 / 이벤트 / 공지사항 / 자주 묻는 질문 / 1:1 문의 / 쿠폰 / 약관·정책 / 당첨 공개 설정']]),
 H('운영자가 확인할 순서'),L('대상 회원·상품·거래 ID가 맞는지 확인합니다.','변경 전 값과 저장할 값을 비교하고 필요한 사유를 입력합니다.','성공 안내 후 목록과 상세보기에 새 값이 남는지 확인합니다.','사용자 페이지에서 잔액·상품 상태·안내가 일치하는지 확인합니다.','오류는 표시된 조건을 고친 뒤 다시 처리하고, 실결제·실배송은 외부 처리 증빙과 별도로 확인합니다.'),
 P('노트북에서는 표 안을 좌우로 이동해 나머지 열을 확인할 수 있습니다. 상세보기는 행 아래에서 펼쳐지고 긴 수정창은 내부에서 위아래로 이동합니다. 입력·저장·닫기 버튼이 가려지면 화면 확대율과 창 크기를 확인하세요.')])]

dev=[
('인계 범위와 실행',[
 P('현재 산출물은 React 기반 브라우저 저장형 서비스 화면입니다. 사용자와 관리자 흐름을 검토하기 위한 구현이며 실제 DB·서버 인증·PG·계좌 송금·택배·문자·예약 작업은 미연동입니다. 공개 관리자 주소는 실제 운영 권한 통제를 제공하지 않습니다.'),
 P('Node.js 22.12 이상을 사용합니다. 의존성은 잠금파일 기준으로 설치하고 Vite 7.3.7을 유지합니다. source-map-js 1.2.2 패치와 pnpm audit 0건을 확인한 의존성 구성이며, 이 결과는 운영 보안 완료를 뜻하지 않습니다.'),
 L('잠금파일을 보존하고 의존성을 설치합니다.','개발 서버에서 사용자 #home과 관리자 #admin을 확인합니다.','node --test tests/*.test.mjs로 회귀를 실행하고 scripts/run-meeting-harness.mjs로 시나리오를 확인합니다.','빌드 후 배포 산출물의 사용자·관리자·가이드 주소를 각각 확인합니다.'),
 P('최종 기능 검증 기준은 회귀 191건과 하네스 32건 통과, 빌드 및 React SSR 검사 통과입니다. 실제 서버·PG·송금 검증 결과로 확대 해석하지 않습니다. 기존 박스 등급 디자인과 개봉 애니메이션은 이번 사업 구조 변경에서 수정하지 않았습니다.')]),
('모듈과 데이터 구조',[
 T(['모듈','책임'],[['demoStore와 platformModel','상태 변경·구매·이벤트·기록 연결과 확률 처리'],['financialModel','페이 환전, 포인트 반환, 과거 캐시 이관과 반환액 스냅샷'],['openingGaugeModel','등급별 개봉 게이지, 강화 적용 계획과 전후 기록'],['policyModel와 securityModel','정책 버전·동의·입력 및 외부 연결 방어'],['substitutionModel','품절 대체 제안·사용자 응답·재고 예약 및 반환'],['CustomerFlows와 RewardsPages','충전·구매·보관함·게이지·환전 화면'],['AdminConsole와 RewardsAdmin','24개 관리자 메뉴와 게이지 관리'],['storage 관련 모듈','브라우저 저장·실패 처리·다른 탭의 변경 감지']]),
 P('wallet.paid는 환전 가능한 페이, wallet.bonus는 환전 불가 포인트입니다. legacy wallet.cash는 1회 bonus로 이관 후 0이 됩니다. 상태 키를 현재 UI 명칭과 동일한 문자열로 바꾸지 않고 의미를 명확히 유지합니다.'),
 P('payWithdrawals, inventory, conversions, ledger, openings, orders는 회원 ID와 거래 ID로 연결합니다. 화면 필터만으로 서버 권한을 대신하지 않습니다. 실제 개발에서는 회원별 접근 통제를 데이터 조회와 변경 경로 모두에 적용해야 합니다.')]),
('페이와 포인트 거래 계약',[
 P('구매 method는 wallet입니다. 포인트부터 차감하고 부족분을 페이에서 차감합니다. 신규 method cash는 허용하지 않습니다. 유료 충전은 페이, 충전 보너스와 이벤트 지급은 포인트로 구분합니다.'),
 T(['액션','처리'],[['REQUEST_PAY_WITHDRAWAL','amount와 requestId를 받습니다. 잔액 확인 후 페이를 예약 차감하고 신청 기록을 생성합니다.'],['CANCEL_PAY_WITHDRAWAL','본인의 신청 상태만 취소하고 예약 페이를 한 번 반환합니다.'],['APPROVE_PAY_WITHDRAWAL','사유를 기록해 승인합니다. 이미 예약했으므로 추가 차감하지 않습니다.'],['REJECT_PAY_WITHDRAWAL','사유를 기록하고 예약 페이를 반환합니다.'],['CASH_CONVERT 또는 REFUND','호환 액션이지만 신규 결과는 상품 포기 포인트 반환입니다. 현금·캐시 지급으로 표시하지 않습니다.']]),
 P('환전 상태는 신청·승인·거절·취소입니다. createdAt, processedAt, reason, memberId, amount와 요청 식별자를 기록합니다. 실제 송금 API와 정산대사는 아직 없으므로 승인 상태를 은행 처리 결과로 취급하면 안 됩니다.'),
 P('금액은 안전한 정수로 검증합니다. 중복 요청·승인·취소는 중복 차감이나 반환을 만들지 않아야 합니다. 실제 서버에서는 원장·잔액·거래 상태를 하나의 원자적 트랜잭션으로 처리하고 PG·송금 웹훅 재전송을 멱등 처리해야 합니다.')]),
('상품 반환과 기존 데이터 이전',[
 P('platform.settings.pointReturnPercent 기본값은 60이며 관리자 변경이 가능합니다. product.returnPointPercent가 비어 있지 않으면 상품별 비율을 우선합니다. 0을 미입력으로 처리하지 않고 null 또는 빈 값과 구분합니다.'),
 P('당첨 시 returnBaseValueSnapshot, returnPointPercentSnapshot, returnPointsSnapshot을 저장합니다. 포인트는 floor(기준가격×비율/100)입니다. 이후 상품 기준가나 반환율 변경으로 보관 상품의 확정액을 다시 계산하지 않습니다.'),
 P('과거 cashAmountSnapshot이 있는 상품은 동일 금액을 반환 포인트로 이관하고 legacyCapturedAmount=true로 남깁니다. 이 상품은 기존 확정 반환액으로 안내하며 현재 비율 산식을 새로 적용하지 않습니다. 과거 캐시 잔액도 1회 포인트로 합산하며 이관 버전으로 중복 합산을 막습니다.'),
 P('전환 기록에는 당첨 상품·기준가·비율·지급액·원장 연결과 restorableUntil을 저장합니다. 복구 시 당시 허용 기한과 회수 가능한 포인트를 확인합니다. 제안 대기·배송 신청·기한 만료 상품 등 부적합 상태에서는 직접 반환을 제한합니다.'),
 P('PROCESS_DUE는 기한과 알림을 확인하는 브라우저 실행입니다. 서버 예약 작업이 아닙니다. 실제 운영 시 서버 시각과 작업 재시도, 중복 실행 방지, 예약 재고 정리, 알림 발송 결과를 별도로 구현해야 합니다.')]),
('개봉 게이지와 확률 계산',[
 P('platform.openingGaugeRules는 A~E별 enabled, startAfterOpenings, gainPerOpening, boostPercent, boostUses를 갖습니다. openingGauges는 회원별 totalOpenings와 등급별 gauge, remainingUses 및 준비 당시 강화값을 저장합니다. 기존 openings를 새 totalOpenings로 소급 집계하지 않습니다.'),
 P('recordOpeningGauge는 개봉 전 totalOpenings가 시작 기준 이상이고 당첨 등급이 적립 대상일 때 해당 등급만 증가시킵니다. 100% 도달 시 준비 횟수와 강화값을 저장합니다. 이 개봉에는 새 강화가 적용되지 않고 다음 개봉부터 적용됩니다.'),
 P('openingGaugePlan은 A→E 우선순위 또는 지정 gaugeGrade에 따라 적용 가능한 한 등급을 고릅니다. 해당 등급 합계를 base라 하면 boosted=min(100,base+boostPercent)입니다. 해당 등급 상품은 기존 내부 비율로 boosted를 나누고 다른 상품은 기존 비율에 (100-boosted)/(100-base)를 곱합니다.'),
 P('대상 등급 상품이 없거나 base가 0 또는 100이면 적용하지 않고 준비 횟수를 보존합니다. 실제 적용 등급만 횟수를 차감하며 모두 소진하면 그 등급만 초기화합니다. 다른 준비 등급은 유지됩니다.'),
 P('현재 초기값은 A·B 활성, 시작 10회, 증가 20%, 강화 +5%p, 1회입니다. 시연 기본값이며 운영 확정값이 아닙니다. 이미 준비된 강화는 저장된 값으로 처리하고 이후 적립은 변경 규칙을 적용합니다.')]),
('추첨 기록과 이벤트',[
 P('effectiveProductOdds는 박스 구성에 버닝 효과와 현재 게이지를 반영합니다. 구매 다중 수량은 각 개봉마다 재고·게이지·확률을 다시 계산해야 합니다. 첫 번째 확률표를 전체 결과에 재사용하면 안 됩니다.'),
 P('openings에는 probabilitySnapshot, baseProbabilitySnapshot, appliedGaugeGrade, gaugeBeforePercent, gaugeAfterPercent, gaugeSnapshot을 저장합니다. 당첨 상품 ID, orderId, inventoryId와 회원 ID를 연결합니다. 사용자 상세에서는 해당 회차의 최종 확률표와 적용 전후 등급 확률을 보여줍니다.'),
 P('박스의 양수 확률 상품에는 유효한 판매 상태와 재고가 필요합니다. 상품 중복과 100% 합계를 검증하고 재고 소진 시 임의 다른 상품으로 확률을 바꿔 지급하지 않습니다. 실제 서버 추첨에서는 암호학적 난수와 변경 불가 기록, 재고 잠금이 별도로 필요합니다.'),
 P('가입·출석·추천·누적 결제 이벤트는 개봉 게이지와 독립입니다. 이벤트 회차·기간·지급 횟수·재고·중복 지급을 검증하며 지급 포인트는 환전 불가입니다. 이전 CLAIM_PITY 신규 지급은 차단하고 pityClaims와 과거 정정·정산 기록은 읽기용으로 보존합니다.')]),
('배송 대체와 개인정보 동의',[
 P('OFFER_SUBSTITUTION은 보관 상품에 대체 상품과 사유를 제안합니다. RESPOND_SUBSTITUTION은 본인 제안에 수락·거절을 기록합니다. 제안 시 재고 예약, 응답·만료 시 예약 확정 또는 반환이 한 번만 발생해야 합니다.'),
 P('수락 후 실제 배송명은 대체 상품으로 표시하지만 원당첨 상품·확률·기준가격·반환액은 보존합니다. 제안 대기 중 배송·전환을 차단하며 만료 처리와 직접 사용자 응답이 경합해도 상품과 재고가 중복 변경되면 안 됩니다.'),
 P('state.settings.security.strictConsents는 기본 false입니다. true이면 가입 consentService/consentPrivacy/consentAge, 충전 consents.payment, 구매 consents.probability/rewards, 배송 address.deliveryConsent, 환전 consents.withdrawal을 검증합니다.'),
 P('thirdParty 설정은 enabled, recipient, purpose, items, retention으로 구성합니다. 활성 시 배송 단계에서 업체·목적·항목·기간과 동의를 표시하고 thirdPartyConsentSnapshot을 주문에 저장합니다. 외부 전송과 수탁/제3자 제공 법적 분류는 실제 계약에 맞춰 별도 확정해야 합니다.'),
 P('정책 기본본문 4.0은 페이·포인트와 개봉 게이지 구조를 설명합니다. 알려진 이전 기본본문과 완전히 일치하는 경우만 이전하고 운영자 편집본문·과거 거래 스냅샷은 보존합니다.')]),
('관리자 화면과 접근성 검수',[
 P('관리자 메뉴는 24개입니다. 회원·상품·재무·콘텐츠의 실제 메뉴명과 업무 위치는 서비스 이용 가이드의 관리자 메뉴 표를 기준으로 확인합니다. 목록은 필수 열만 보여주고 상세보기는 해당 행 아래에서 펼칩니다.'),
 L('상품 당첨내역·판매내역이 상품 ID 필터로 연결되고 필터 칩 해제·메뉴 변경 초기화가 동작하는지 확인합니다.','천장 게이지 네 탭의 현재 회원값·설정·강화 기록·이전 기록을 구분합니다.','환전 승인 사유, 잔액 종류와 조정 사유, 상품 반환율 0%, 쿠폰 상태·기간 오류를 확인합니다.','1366×768, 1280×720, 1024×768 및 모바일에서 표 내부 가로 스크롤과 모달 내부 세로 스크롤을 확인합니다.','키보드로 입력·상세보기·저장·닫기에 접근하고 긴 오류 문구·상품명·이미지가 가려지지 않는지 확인합니다.'),
 P('업로드는 파일 서명·형식·크기 검증을 적용합니다. 외부 링크 허용 범위, CSV 수식 입력 방어, 비정상 중첩 상태, 저장 실패와 오래된 탭 상태를 확인합니다. 현재 검증은 클라이언트 수준이며 서버 파일 검사와 권한 검증을 대체하지 않습니다.')]),
('검수 시나리오와 실서비스 개발',[
 L('충전 후 페이와 추가 포인트 분리, 포인트 우선 구매 차감, 취소 시 비례 보너스 회수를 확인합니다.','상품별 반환율 우선·기본값·0%·과거 고정액·당시 스냅샷·복구 기한을 확인합니다.','환전 신청 예약 차감, 승인 추가 차감 없음, 거절·취소 한 번 반환, 타회원 및 중복 요청 거절을 확인합니다.','게이지 시작 전후, 당첨 등급만 적립, 100% 다음 개봉 적용, A→E 한 등급, %p 계산, 후보 없음 보존, 다중 개봉별 스냅샷을 확인합니다.','대체 제안 수락·거절·만료·재고 반환과 원거래 보존, 필수 동의 및 정책4.0 이전을 확인합니다.','사용자와 관리자에서 동일 거래 ID의 잔액·상태·이력을 비교합니다.'),
 P('현 검수 결과는 회귀 191/191, 하네스 32/32, 빌드·React SSR 통과입니다. 실제 서비스 전에는 서버 권한·인증, DB 트랜잭션, PG/송금 대사, 개인정보 처리 계약, 서버 예약 작업, 운영자 감사 로그와 장애 복구를 구현하고 통합 검수해야 합니다.'),
 P('개발 순서는 정책·금융 구조 확정, 서버 데이터와 원장 설계, 인증·권한, 결제·송금 연동, 추첨·재고·예약 작업, 운영 도구와 알림, 부하·보안·정산 검수 순으로 권장합니다. 비용과 납기는 PG·송금 제공사 및 법률 검토, 운영 범위를 확정한 뒤 산정합니다. 이 문서는 견적이나 실제 서비스 적법성의 확정 의견이 아닙니다.')])]

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
