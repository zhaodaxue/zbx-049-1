export interface BatchRecord {
  batchId: string;
  category: string;
  arrivalWeight: number;
  thawedWeight: number;
  arrivalDate: string;
}

export interface LossRecord extends BatchRecord {
  lossRate: number;
  isHighLoss: boolean;
}
