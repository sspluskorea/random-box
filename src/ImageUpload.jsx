import {useState} from 'react';
export const IMAGE_TYPES=['image/jpeg','image/png','image/webp'];
export function checkImageFile(file){if(!IMAGE_TYPES.includes(file.type))throw Error('JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.');if(file.size>10*1024*1024)throw Error('이미지는 파일당 10MB 이하로 선택해 주세요.');}
async function readImage(file){
 checkImageFile(file);
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;await img.decode();
  const scale=Math.min(1,1280/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  let data=canvas.toDataURL('image/webp',.82);
  if(data.length>350000)data=canvas.toDataURL('image/webp',.55);
  if(data.length>350000)throw Error('이미지가 너무 복잡합니다. 크기를 줄인 뒤 다시 업로드해 주세요.');
  return data;
 }finally{URL.revokeObjectURL(url);}
}
export default function ImageUpload({label,value,onChange,multiple=false,onBusy=()=>{}}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const images=multiple?(value||[]):value?[value]:[];
 return <div className="ac-upload full"><strong>{label}</strong><label className="ac-upload-input">{busy?'이미지 처리 중…':'파일 선택하여 업로드'}<input aria-label={label} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} disabled={busy} onChange={async e=>{const files=[...e.target.files];e.target.value='';if(!files.length)return;setError('');if(multiple&&images.length+files.length>8){setError('상세 이미지는 최대 8장까지 등록할 수 있습니다.');return;}setBusy(true);onBusy(true);try{const next=await Promise.all(files.map(readImage));onChange(multiple?[...images,...next]:next[0]);}catch(err){setError(err.message||'이미지를 읽지 못했습니다.');}finally{setBusy(false);onBusy(false);}}}/></label><small>JPG·PNG·WEBP / 파일당 10MB 이하{multiple?' / 최대 8장, 등록 순서대로 노출':''}. 저장 공간에 맞춰 자동으로 크기를 줄입니다.</small><div className="ac-upload-previews">{images.map((src,i)=><div key={i}><img src={src} alt={`${label} 미리보기 ${i+1}`}/><button type="button" disabled={busy} aria-label={`${label} ${i+1} 삭제`} onClick={()=>onChange(multiple?images.filter((_,j)=>i!==j):'')}>삭제</button>{multiple&&i>0&&<button type="button" disabled={busy} aria-label={`${label} ${i+1} 앞으로`} onClick={()=>{const next=[...images];[next[i-1],next[i]]=[next[i],next[i-1]];onChange(next);}}>앞으로</button>}</div>)}</div>{error&&<p className="ac-error" role="alert">{error}</p>}{busy&&<p role="status">이미지를 업로드하고 있습니다.</p>}</div>;
}
