import type { BatchRecord, LossRecord } from "@/types";

const HIGH_LOSS_THRESHOLD = 0.08;

export function calcLossRate(arrivalWeight: number, thawedWeight: number): number {
  if (arrivalWeight <= 0) return 0;
  return (arrivalWeight - thawedWeight) / arrivalWeight;
}

export function enrichWithLoss(records: BatchRecord[]): LossRecord[] {
  return records
    .map((r) => {
      const lossRate = calcLossRate(r.arrivalWeight, r.thawedWeight);
      return { ...r, lossRate, isHighLoss: lossRate >= HIGH_LOSS_THRESHOLD };
    })
    .sort((a, b) => b.lossRate - a.lossRate);
}

export function filterHighLoss(records: LossRecord[]): LossRecord[] {
  return records.filter((r) => r.isHighLoss);
}

export function filterByCategory(records: LossRecord[], category: string): LossRecord[] {
  return records
    .filter((r) => r.category === category)
    .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));
}

export function getCategories(records: LossRecord[]): string[] {
  return [...new Set(records.map((r) => r.category))];
}
