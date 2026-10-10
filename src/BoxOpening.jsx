import {useEffect,useRef,useState} from 'react';
import {Sparkle,Gift,CheckCircle} from '@phosphor-icons/react';
import './box-opening.css';

export const OPENING_DURATION=4600;
export default function BoxOpening({box,count,onComplete}){
 const [stage,setStage]=useState('ready');
 const complete=useRef(onComplete);complete.current=onComplete;
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers=[];
  const start=()=>{
   timers.forEach(clearTimeout);
   if(media.matches){setStage('reduced');timers=[setTimeout(()=>complete.current(),500)];return;}
   setStage('ready');
   timers=[setTimeout(()=>setStage('shake'),1100),setTimeout(()=>setStage('open'),2600),setTimeout(()=>complete.current(),OPENING_DURATION)];
  };
  start();media.addEventListener('change',start);
  return()=>{timers.forEach(clearTimeout);media.removeEventListener('change',start)};
 },[]);
 const caption=stage==='open'?'박스가 열렸어요!':stage==='shake'?'안에 어떤 선물이 있을까요?':stage==='reduced'?'당첨 상품을 확인합니다.':'당신의 박스를 준비하고 있어요';
 return <div className="box-opening" data-stage={stage} aria-label="랜덤박스 오픈 애니메이션">
  <span className="bo-label">{box?.name||'랜덤박스'} · {count}개</span>
  <div className="bo-scene" aria-hidden="true"><div className="bo-light"/><div className="bo-aura"/>
   <div className="bo-gift"><div className="bo-body"><div className="bo-ribbon"/><Gift size={42} weight="duotone"/></div><div className="bo-lid"><div className="bo-ribbon"/><div className="bo-bow"><Gift size={58} weight="duotone"/></div></div></div>
   <div className="bo-reward"><Sparkle size={76} weight="fill"/></div>
   {[0,1,2,3,4,5,6,7].map(i=><Sparkle key={i} className="bo-spark" size={i%2?16:24} weight="fill" style={{'--i':i,'--x':`${[-130,120,-95,95,-150,145,-55,55][i]}px`,'--y':`${[-140,-145,-205,-220,-50,-60,-260,-275][i]}px`}}/>)}</div>
  <h2 aria-live="polite">{caption}</h2><p>개봉 후 당첨 상품이 보관함에 저장됩니다.</p>
  <div className="bo-steps" aria-hidden="true"><span className="active"><CheckCircle/>구매 완료</span><span className={stage!=='ready'?'active':''}>박스 오픈</span><span className={stage==='open'?'active':''}>상품 확인</span></div>
  <button className="cf-secondary bo-skip" onClick={()=>complete.current()}>연출 건너뛰기</button>
 </div>;
}
