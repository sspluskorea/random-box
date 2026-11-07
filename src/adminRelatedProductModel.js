// Related transaction filters use stable product and inventory IDs, never display names.
export function matchesRelatedProduct(row, menu, productId, state) {
  if (!productId) return true;
  const same = value => value != null && String(value) === String(productId);
  const inventory = state.inventory || [];
  if (menu === 'openings') {
    if (row.productId != null) return same(row.productId);
    return inventory.some(item => String(item.id) === String(row.inventoryId) && same(item.productId));
  }
  if (menu === 'orders') {
    const ids = new Set((row.inventoryIds || []).map(String));
    return inventory.some(item => same(item.productId) && (ids.has(String(item.id)) || item.orderId != null && String(item.orderId) === String(row.id)))
      || (state.openings || []).some(opening => same(opening.productId) && opening.orderId != null && String(opening.orderId) === String(row.id));
  }
  return true;
}
export function adminOrderKind(row) {
  if (row.address === '디지털 개봉') return row.method === 'reward' ? '이벤트 박스 개봉' : '랜덤박스 구매';
  if (row.inventoryIds?.length) return '상품 배송';
  return '기타 주문';
}
