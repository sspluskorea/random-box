// Coupon date-only bounds include the entire Korean calendar day.
function boundary(value,end){
 if(value==null||value==='')return null;
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)){const time=Date.parse(`${value}T${end?'23:59:59.999':'00:00:00'}+09:00`);return Number.isFinite(time)&&new Date(time+9*3600000).toISOString().slice(0,10)===value?time:NaN;}
 return Date.parse(value);
}
export function couponLimit(c){return c?.limit==null||c.limit===''?1:Number(c.limit);}
export function couponUsed(c){return c?.usedCount!=null?Number(c.usedCount):Array.isArray(c?.uses)?c.uses.length:c?.usedAt?1:0;}
export function couponAvailable(c,memberId='demo-member',now=Date.now(),subtotal=Infinity){
 if(!c||c.status!=='사용 가능'||c.memberId&&c.memberId!==memberId)return false;
 const limit=couponLimit(c),used=couponUsed(c),start=boundary(c.start??c.startsAt??c.startDate,false),end=boundary(c.end??c.expiresAt??c.endDate,true);
 return Number.isSafeInteger(limit)&&limit>0&&Number.isSafeInteger(used)&&used>=0&&used<limit&&(start===null||Number.isFinite(start)&&now>=start)&&(end===null||Number.isFinite(end)&&now<=end)&&(start===null||end===null||start<=end)&&Number(c.minAmount||0)<=subtotal;
}
export function couponDiscount(c,subtotal){const raw=String(c?.value??c?.amount??''),value=Number(raw.replace('%',''));if(!Number.isFinite(value)||value<=0)return NaN;return Math.min(subtotal,c.type==='percent'||raw.includes('%')?Math.floor(subtotal*Math.min(value,100)/100):Math.floor(value));}
export function useCoupon(c,memberId,orderId,now=Date.now()){c.usedCount=couponUsed(c)+1;c.usedAt=new Date(now).toISOString();c.usedBy=memberId;c.uses=[...(c.uses||[]),{memberId,orderId,usedAt:c.usedAt}];c.status=c.usedCount>=couponLimit(c)?'사용 완료':'사용 가능';}
