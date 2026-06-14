import type { BatchRecord } from "@/types";
import { rawBatches } from "@/data/batches";

export function parseBatches(): BatchRecord[] {
  return rawBatches.map((row) => ({
    batchId: row.batchId.trim(),
    category: row.category.trim(),
    arrivalWeight: Number(row.arrivalWeight),
    thawedWeight: Number(row.thawedWeight),
    arrivalDate: row.arrivalDate.trim(),
  }));
}
