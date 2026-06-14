import type { BatchRecord, LossRecord } from "@/types";

const HIGH_LOSS_THRESHOLD = 0.08;

export function calcLossRate(arrivalWeight: number, thawedWeight: number): number {
  if (arrivalWeight <= 0) return NaN;
  return (arrivalWeight - thawedWeight) / arrivalWeight;
}

export function enrichWithLoss(records: BatchRecord[]): LossRecord[] {
  return records
    .map((r) => {
      let isInvalid = false;
      let invalidReason: string | undefined;

      if (r.arrivalWeight <= 0) {
        isInvalid = true;
        invalidReason = "到货净重异常";
      } else if (r.thawedWeight > r.arrivalWeight) {
        isInvalid = true;
        invalidReason = "解冻后净重 > 到货净重";
      }

      const lossRate = isInvalid ? NaN : calcLossRate(r.arrivalWeight, r.thawedWeight);
      const isHighLoss = !isInvalid && lossRate >= HIGH_LOSS_THRESHOLD;

      return { ...r, lossRate, isHighLoss, isInvalid, invalidReason };
    })
    .sort((a, b) => {
      if (a.isInvalid && b.isInvalid) return 0;
      if (a.isInvalid) return 1;
      if (b.isInvalid) return -1;
      return b.lossRate - a.lossRate;
    });
}

export function filterValidRecords(records: LossRecord[]): LossRecord[] {
  return records.filter((r) => !r.isInvalid);
}

export function filterHighLoss(records: LossRecord[]): LossRecord[] {
  return records.filter((r) => r.isHighLoss && !r.isInvalid);
}

export function filterByCategory(records: LossRecord[], category: string): LossRecord[] {
  return records
    .filter((r) => r.category === category && !r.isInvalid)
    .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));
}

export function getCategories(records: LossRecord[]): string[] {
  return [...new Set(records.filter((r) => !r.isInvalid).map((r) => r.category))];
}
