// The current reward keeps its saved threshold. Later rewards use the latest setting.
// One confirmed reward resets the entire grade gauge; stock is checked at payout.
export function availableRewardCount(progress, nextThreshold) {
  const amount = Number(progress?.progress);
  const current = Number(progress?.threshold);
  const next = Number(nextThreshold ?? current);
  if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(current) || !Number.isSafeInteger(next) || current <= 0 || next <= 0 || amount < current) return 0;
  return 1;
}
