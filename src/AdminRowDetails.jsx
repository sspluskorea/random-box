import {detailLabels,formatAdminValue,rowDetails} from './adminTableModel.js';

export function AdminValue({field,value,state,menu,labels={}}){
 const label=k=>labels[k]||detailLabels[k]||k;
 if(field==='image'&&typeof value==='string'&&value)return <span className="ac-image-value"><img src={value} alt="상품·배너 이미지" loading="lazy"/><span>{value.startsWith('data:')?'업로드 이미지':'기본 이미지'}</span></span>;
 if(Array.isArray(value)){
  if(!value.length)return <span>내역 없음</span>;
  if(value.every(v=>v&&typeof v==='object'&&!Array.isArray(v))){
   const keys=[...new Set(value.flatMap(v=>Object.keys(v)))];
   return <div className="ac-nested-scroll"><table className="ac-nested-table"><thead><tr>{keys.map(k=><th key={k}>{label(k)}</th>)}{field==='tiers'||field==='probabilitySnapshot'?<th>평균 당첨 간격</th>:null}</tr></thead><tbody>{value.map((v,i)=><tr key={i}>{keys.map(k=><td key={k}><AdminValue field={k} value={v[k]} state={state} menu={menu} labels={labels}/></td>)}{field==='tiers'||field==='probabilitySnapshot'?<td>{Number(v.probability)>0?`${(100/Number(v.probability)).toLocaleString('ko-KR',{maximumFractionDigits:2})}회당 1회`:'당첨 불가'}</td>:null}</tr>)}</tbody></table>{field==='tiers'||field==='probabilitySnapshot'?<small>평균값이며, 해당 횟수 안에 당첨을 보장하지 않습니다.</small>:null}</div>;
  }
  return <ul className="ac-value-list">{value.map((v,i)=><li key={i}><AdminValue field={field} value={v} state={state} menu={menu} labels={labels}/></li>)}</ul>;
 }
 if(value&&typeof value==='object')return <dl className="ac-nested-fields">{Object.entries(value).map(([k,v])=><div key={k}><dt>{label(k)}</dt><dd><AdminValue field={k} value={v} state={state} menu={menu} labels={labels}/></dd></div>)}</dl>;
 return <span>{formatAdminValue(field,value,state,menu)}</span>;
}
export default function AdminRowDetails({row,columns,state,menu,labels}){
 const entries=rowDetails(row,columns).filter(([key])=>!(['boxes','probability'].includes(menu)&&['image','detailImages'].includes(key)));
 if(['members','member-points'].includes(menu)&&row.id==='demo-member'&&state.wallet){entries.push(['paid',state.wallet.paid],['bonus',state.wallet.bonus]);}
 return <dl className="ac-inline-details" aria-label="펼쳐진 상세 정보">{entries.map(([key,value])=><div className={value&&typeof value==='object'||['content','answer','description','image'].includes(key)?'ac-detail-wide':''} key={key}><dt>{detailLabels[key]||labels[key]||key}</dt><dd><AdminValue field={key} value={value} state={state} menu={menu} labels={labels}/></dd></div>)}</dl>;
}
