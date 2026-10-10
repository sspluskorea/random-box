import { useEffect, useMemo, useRef, useState } from "react";
import AdminConsole from './AdminConsole.jsx';
import CustomerFlows from './CustomerFlows.jsx';
import { loadState, transition, STORAGE_KEY } from './demoStore.js';
import MeetingExtras from './MeetingExtras.jsx';
import Transparency,{WinnerFeed} from './Transparency.jsx';
import './meeting.css';
import {CartPage} from './CustomerEnhancements.jsx';
import {AccountPage,TutorialPage} from './ServicePages.jsx';
import PolicyPages,{policyRoutes} from './PolicyPages.jsx';
import {
  ArrowRight, Bell, BoxArrowDown, CalendarCheck, CaretDown, CaretRight,
  ChartBar, ChatCircleDots, Check, CircleNotch, Coins, Crown, Cube,
  CubeFocus, DotsThree, Gift, Heart, House, Lightning, List,
  MagnifyingGlass, Medal, Package, Percent, Plus, Question, Receipt,
  RocketLaunch, SealCheck, ShoppingCart, SignOut, SlidersHorizontal,
  Sparkle, SquaresFour, Ticket, TrendUp, Truck, User, UserCircle,
  Users, Wallet, X,
} from "@phosphor-icons/react";

const userNav = [
 ["tutorial","이용방법"],["boxes","랜덤박스"],["ranking","당첨 랭킹"],["wins","언박싱"],["inventory","보관함"],["trust","확률 안내"],
];

const boxProducts = [
  { id: 1, name: "네뷸라 스타터 박스", category: "테크", price: 9900, left: 1248, total: 2000, image: "assets/box-tech.png", color: "blue" },
  { id: 2, name: "스트리트 컬렉션 박스", category: "패션", price: 19900, left: 482, total: 1200, image: "assets/box-fashion.png", color: "pink" },
  { id: 3, name: "라이프 스타일 박스", category: "라이프", price: 29900, left: 731, total: 1000, image: "assets/box-life.png", color: "gold" },
  { id: 4, name: "크리에이터 드림 박스", category: "테크", price: 49900, left: 198, total: 500, image: "assets/box-tech.png", color: "violet" },
  { id: 5, name: "시그니처 럭셔리 박스", category: "프리미엄", price: 79900, left: 86, total: 300, image: "assets/box-fashion.png", color: "pink" },
  { id: 6, name: "갤럭시 마스터 박스", category: "프리미엄", price: 99900, left: 34, total: 200, image: "assets/hero-nebula.png", color: "violet" },
];

const initialInventory = [
  { id: 101, name: "무선 노이즈캔슬링 헤드폰", value: 189000, acquired: "2026.09.28", image: "assets/box-tech.png", status: "보관 중", grade: "A" },
  { id: 102, name: "프리미엄 스니커즈", value: 129000, acquired: "2026.09.26", image: "assets/box-fashion.png", status: "보관 중", grade: "B" },
  { id: 103, name: "무드 테이블 램프", value: 79000, acquired: "2026.09.22", image: "assets/box-life.png", status: "배송 준비", grade: "C" },
];

const winners = [
  ["김하늘", "무선 이어폰 2세대", "2분 전"], ["이준호", "프리미엄 스니커즈", "5분 전"],
  ["서예린", "스마트워치 SE", "8분 전"], ["박재훈", "상품권 10만원", "11분 전"],
];

const adminMenu = [
  ["admin", "대시보드", SquaresFour], ["admin-boxes", "박스 관리", Gift],
  ["admin-products", "상품 관리", Package], ["admin-probability", "확률 관리", Percent],
  ["admin-orders", "주문·배송", Truck], ["admin-members", "회원 관리", Users],
  ["admin-points", "포인트·쿠폰", Coins], ["admin-trade", "트레이드 관리", CubeFocus],
  ["admin-events", "이벤트·배너", CalendarCheck], ["admin-community", "커뮤니티", ChatCircleDots],
  ["admin-stats", "통계", ChartBar], ["admin-settings", "환경 설정", SlidersHorizontal],
];

const won = (value) => `${value.toLocaleString("ko-KR")}원`;

function useHashRoute() {
  const current = () => window.location.hash.replace(/^#\/?/, "") || "home";
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onHash = () => setRoute(current());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (next) => {
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return [route, go];
}

function AppLogo({ compact = false }) {
  return (
    <button className="brand" onClick={() => (window.location.hash = "home")} aria-label="모두의 박스 홈">
      <span className="brand-mark"><Cube weight="duotone" /></span>
      {!compact && <span>모두의 박스</span>}
    </button>
  );
}

function Header({ route, go, onSearch, onMenu, state }) {
  return (
    <header className="site-header"><div className="header-inner">
      <AppLogo />
      <nav className="main-nav" aria-label="주요 메뉴">{userNav.map(([key, label]) => <button key={key} className={route === key ? "active" : ""} onClick={() => go(key)}>{label}</button>)}</nav>
      <div className="header-actions">
        <button className="icon-button" onClick={onSearch} aria-label="통합 검색"><MagnifyingGlass /></button>
        <button className="icon-button has-dot" onClick={() => go("notifications")} aria-label="알림"><Bell /></button>
        <button className="icon-button" onClick={() => go("cart")} aria-label="장바구니"><ShoppingCart /></button>
        <button className="login-button" onClick={() => go("charge")}><Coins /> <span>충전</span></button>
        <button className="login-button" onClick={() => go(state.session ? "mypage" : "login")}><User /> <span>{state.session?.name || '로그인'}</span></button>
        {!state.session && <button className="login-button" onClick={() => go('signup')}>회원가입</button>}
        <button className="menu-button" onClick={onMenu} aria-label="메뉴 열기"><List /></button>
      </div>
    </div></header>
  );
}

function MobileMenu({ open, onClose, go }) {
  if (!open) return null;
  return (
    <div className="mobile-overlay" role="dialog" aria-modal="true" aria-label="전체 메뉴"><div className="mobile-sheet">
      <div className="mobile-sheet-head"><AppLogo /><button className="icon-button" onClick={onClose}><X /></button></div>
      {userNav.map(([key, label]) => <button key={key} onClick={() => { go(key); onClose(); }}>{label}<ArrowRight /></button>)}
      {[['events','이벤트'],['community','커뮤니티']].map(([key,label])=><button key={key} onClick={()=>{go(key);onClose();}}>{label}<ArrowRight/></button>)}
      {[['mypage','마이페이지'],['wallet','내 지갑'],['charge','포인트 충전'],['cart','장바구니'],['login','로그인'],['signup','회원가입'],['notices','공지사항'],['support','고객센터'],['terms','약관 및 정책']].map(([key,label])=><button key={key} onClick={()=>{go(key);onClose()}}>{label}<ArrowRight/></button>)}
    </div></div>
  );
}

function Home({ go, openBox, boxes=boxProducts, state }) {
  return (
    <>
      <section className="hero">
        <img src="assets/hero-nebula.png" alt="네뷸라 랜덤박스" className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content shell">
          <span className="eyebrow"><Sparkle weight="fill" /> SEASON 01 · LIVE NOW</span>
          <h1>오늘의 행운을<br /><em>열어보세요</em></h1>
          <p>예상할 수 없는 특별한 아이템이 가득한<br />모두의 박스에서 새로운 설렘을 경험하세요.</p>
          <div className="hero-price"><strong>{won(boxes[0]?.price||0)}</strong><span>SEASON SPECIAL</span></div>
          <div className="hero-stock"><span>남은 수량</span><strong>{boxes[0]?.left||0}</strong><span>/ {boxes[0]?.total||0}</span></div>
          <div className="hero-buttons"><button className="primary-cta" disabled={!boxes.length} onClick={() => openBox(boxes[0])}><Cube /> 박스 열기 <ArrowRight /></button><button className="secondary-cta" onClick={() => go("boxes")}>전체 박스 보기</button></div>
        </div>
      </section>
      <WinnerFeed state={state} go={go}/>
      <section className="popular shell section-block">
        <div className="section-heading"><div><span className="eyebrow">SPECIAL RANDOM BOX</span><h2>지금 주목할 인기 박스</h2></div><button className="text-link" onClick={() => go("boxes")}>전체 보기 <ArrowRight /></button></div>
        <div className="box-showcase">{boxes.slice(0, 3).map((box) => <BoxCard key={box.id} box={box} onOpen={() => openBox(box)} />)}</div>
      </section>
      <section className="feature-links shell">
        {[["attendance","매일 출석","연속 출석 보상 받기",CalendarCheck],["ranking","언박싱 랭킹","최근 2주 당첨 상품",Medal],["events","진행 중 이벤트","신규 박스와 혜택",Ticket],["tutorial","이용방법","충전부터 상품 수령까지",Question]].map(([key,title,sub,Icon])=><button key={key} onClick={() => go(key)}><Icon /><span><b>{title}</b><small>{sub}</small></span><ArrowRight /></button>)}
      </section>
    </>
  );
}

function BoxCard({ box, onOpen, compact = false }) {
  return (
    <article className={`box-card ${box.color} ${compact ? "compact" : ""}`}>
      <img src={box.image} alt="" /><div className="card-overlay" />
      <div className="card-copy"><span>{box.category.toUpperCase()}</span><h3>{box.name}</h3>{!compact && <p>{box.category === "테크" ? "최신 전자기기로 만나는 일상의 업그레이드" : box.category === "패션" ? "한정판 스타일과 프리미엄 패션 아이템" : "일상을 특별하게 만드는 감성 아이템"}</p>}<div className="card-bottom"><strong>{won(box.price)}</strong><button onClick={onOpen}>열어보기 <ArrowRight /></button></div></div>
    </article>
  );
}

function PageShell({ eyebrow, title, description, actions, children }) {
  return <main className="page shell"><div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions}</div>{children}</main>;
}

function BoxesPage({ openBox, boxes=boxProducts, state, dispatch, notify }) {
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("추천순");
  const filtered = boxes.filter((b) => category === "전체" || b.category === category).sort((a,b)=>sort==='낮은 가격순'?a.price-b.price:sort==='높은 가격순'?b.price-a.price:sort==='마감 임박순'?a.left-b.left:0);
  return (
    <PageShell eyebrow="DROP COLLECTION" title="나에게 맞는 랜덤박스" description="가격, 구성품, 확률을 확인하고 원하는 드롭을 선택하세요.">
      <div className="filter-bar"><div className="chips">{["전체", "테크", "패션", "라이프", "프리미엄"].map((c) => <button className={category === c ? "active" : ""} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><label className="select-wrap"><SlidersHorizontal /><select value={sort} onChange={(e) => setSort(e.target.value)}><option>추천순</option><option>낮은 가격순</option><option>높은 가격순</option><option>마감 임박순</option></select><CaretDown /></label></div>
      <div className="catalog-grid">{filtered.map((box) => <CatalogCard key={box.id} box={box} onOpen={() => openBox(box)} state={state} dispatch={dispatch} notify={notify}/>)}</div>
    </PageShell>
  );
}

function CatalogCard({ box, onOpen, state, dispatch, notify }) {
  const percent = Math.round((box.left / box.total) * 100);
  return <article className="catalog-card"><div className="catalog-image"><img src={box.image} alt="" /><span>{box.category}</span><button aria-label={box.name+' 관심 박스'} aria-pressed={(state.content.wishlist||[]).some(r=>r.boxId===box.id)} onClick={()=>{const rows=state.content.wishlist||[];dispatch({type:'UPDATE',key:'content',value:{...state.content,wishlist:rows.some(r=>r.boxId===box.id)?rows.filter(r=>r.boxId!==box.id):[...rows,{boxId:box.id}]}});notify('관심 목록을 변경했습니다.')}}><Heart /></button></div><div className="catalog-content"><h3>{box.name}</h3><p>{box.tiers?.length||4}개 금액대 · 공개 확률 확인 · {box.status}</p><div className="catalog-price"><strong>{won(box.price)}</strong><button disabled={box.status!=='판매 중'||box.left<1} onClick={onOpen}>박스 열기</button><button onClick={()=>{const rows=state.content.cart||[];dispatch({type:'UPDATE',key:'content',value:{...state.content,cart:rows.some(r=>r.boxId===box.id)?rows:[...rows,{boxId:box.id,quantity:1}]}});notify('장바구니에 담았습니다.')}}>담기</button></div><div className="stock-bar"><i style={{ width: `${percent}%` }} /><span>{box.left.toLocaleString()}개 남음</span></div><button className="probability-link" onClick={onOpen}>구성품 및 확률 보기 <ArrowRight /></button></div></article>;
}

function SearchModal({ open, onClose, go, boxes=boxProducts }) {
  const [query,setQuery]=useState("");
  if(!open)return null;
  const results=boxes.filter((b)=>b.name.includes(query)||b.category.includes(query));
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="search-modal" onMouseDown={(e)=>e.stopPropagation()}><div className="search-box"><MagnifyingGlass/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="박스, 상품, 게시글 검색"/><button onClick={onClose}><X/></button></div>{query?<div className="search-results"><span>검색 결과 {results.length}건</span>{results.map((b)=><button key={b.id} onClick={()=>{go("boxes");onClose();}}><img src={b.image} alt=""/><div><b>{b.name}</b><small>{b.category} · {won(b.price)}</small></div><ArrowRight/></button>)}</div>:<div className="search-suggestions"><span>추천 검색어</span>{["마스터 박스","무선 이어폰","상품 구성","무료배송","랜덤박스"].map((v)=><button key={v} onClick={()=>setQuery(v)}>{v}</button>)}</div>}</div></div>;
}

function Toast({ message }) { return message?<div className="toast"><Check/><span>{message}</span></div>:null; }

function Footer({ go,state }) {
  const seller=state.settings.seller||{};
  return <footer className="site-footer"><div className="shell"><div><AppLogo/><p>열어보는 순간이 가장 재미있는 랜덤박스 플랫폼</p></div><div><b>서비스</b><button onClick={()=>go("boxes")}>랜덤박스</button><button onClick={()=>go("charge")}>포인트 충전</button><button onClick={()=>go("wins")}>언박싱</button><button onClick={()=>go("trust")}>확률 안내</button></div><div><b>이용안내</b><button onClick={()=>go("tutorial")}>이용방법</button><button onClick={()=>go("notices")}>공지사항</button><button onClick={()=>go("events")}>이벤트</button><button onClick={()=>go("terms")}>이용약관</button><button onClick={()=>go('privacy')}>개인정보 처리방침</button><button onClick={()=>go('refund-policy')}>취소·반품 기준</button></div><div><b>고객지원</b><p>{seller.supportHours||'상담 시간 등록 예정'}<br/>{seller.supportEmail||'고객센터 연락처 등록 예정'}</p><button onClick={()=>go('support')}>고객센터</button><button onClick={()=>go('company')}>사업자 정보</button></div></div><div className="footer-seller shell">상호 {seller.companyName||'등록 예정'} · 대표자 {seller.representative||'등록 예정'} · 사업자등록번호 {seller.businessNumber||'등록 예정'} · 통신판매업 신고번호 {seller.salesNumber||'등록 예정'}<br/>사업장 주소 {seller.businessAddress||'등록 예정'} · 고객센터 전화 {seller.supportPhone||'등록 예정'}</div><div className="footer-bottom shell"><span>© 2026 MODU'S BOX. All rights reserved.</span><span>한국어 <CaretDown/></span></div></footer>;
}

export function App() {
  const [route, go] = useHashRoute();
  const [state,setState]=useState(()=>loadState(localStorage));
  const stateRef=useRef(state);
  const [message,setMessage]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const toast=(text)=>{setMessage(text);clearTimeout(window.__moduToast);window.__moduToast=setTimeout(()=>setMessage(''),3200)};
  const dispatch=(action)=>{const result=transition(stateRef.current,action);if(result.ok){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(result.state))}catch{const error='저장 공간이 부족합니다. 등록할 이미지 수나 크기를 줄여 주세요.';toast(error);return {ok:false,error};}stateRef.current=result.state;setState(result.state);}else toast(result.error);return result};
  useEffect(()=>{const sync=e=>{if(e.key===STORAGE_KEY){const next=loadState(localStorage);stateRef.current=next;setState(next)}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
  const openBox=box=>{dispatch({type:'UPDATE',key:'selectedBoxId',value:box.id});dispatch({type:'UPDATE',key:'checkoutQuantity',value:1});go('checkout')};
  const isAdmin=route.startsWith('admin');
  const flowRoutes=['login','signup','charge','wallet','checkout','open','inventory','refunds','orders','profile','support'];
  let page;
  if(isAdmin)page=<AdminConsole state={state} dispatch={dispatch} go={go} notify={toast}/>;
  else if(route==='home')page=<Home state={state} go={go} openBox={openBox} boxes={state.boxes.filter(b=>b.status==='판매 중')}/>;
  else if(['cart','wishlist'].includes(route))page=<CartPage state={state} dispatch={dispatch} go={go} notify={toast} wishlist={route==='wishlist'}/>;
  else if(['wins','mywins','trust','ranking'].includes(route))page=<Transparency state={state} go={go} dispatch={dispatch} ranking={route==='ranking'} trust={route==='trust'} personal={route==='mywins'}/>;
  else if(route==='mypage')page=<AccountPage state={state} go={go} dispatch={dispatch}/>;
  else if(route==='tutorial')page=<TutorialPage state={state} go={go} dispatch={dispatch}/>;
  else if(['subscription','exchange','services'].includes(route))page=<TutorialPage state={state} go={go} dispatch={dispatch}/>;
  else if(route==='boxes')page=<BoxesPage openBox={openBox} boxes={state.boxes} state={state} dispatch={dispatch} notify={toast}/>;
  else if(policyRoutes.includes(route))page=<PolicyPages key={route} route={route} state={state} dispatch={dispatch} go={go}/>;
  else if(flowRoutes.includes(route))page=<CustomerFlows key={route} route={route==='mypage'?'profile':route} state={state} dispatch={dispatch} go={go} notify={toast}/>;
  else if(['notices','events','community','coupons','notifications','trade','gifts','referral','attendance','pointshop'].includes(route))page=<MeetingExtras key={route} route={route} state={state} dispatch={dispatch} go={go} notify={toast}/>;
  else page=<PolicyPages key={route} route="notfound" state={state} dispatch={dispatch} go={go}/>;
  return <div className={isAdmin?'app admin-mode':'app'}>
    {!isAdmin&&<Header route={route} go={go} state={state} onSearch={()=>setSearchOpen(true)} onMenu={()=>setMenuOpen(true)}/>}
    {page}
    {!isAdmin&&<Footer go={go} state={state}/>}
    <MobileMenu open={menuOpen} onClose={()=>setMenuOpen(false)} go={go}/>
    <SearchModal boxes={state.boxes} open={searchOpen} onClose={()=>setSearchOpen(false)} go={go}/>
    <Toast message={message}/>
  </div>;
}
