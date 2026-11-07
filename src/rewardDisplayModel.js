// The current reward keeps its saved threshold. Later rewards use the latest setting.
// This estimates eligible rewards only; category stock is checked separately at payout.
export function availableRewardCount(progress, nextThreshold) {
  const amount = Number(progress?.progress);
  const current = Number(progress?.threshold);
  const next = Number(nextThreshold ?? current);
  if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(current) || !Number.isSafeInteger(next) || current <= 0 || next <= 0 || amount < current) return 0;
  return 1 + Math.floor((amount - current) / next);
}
