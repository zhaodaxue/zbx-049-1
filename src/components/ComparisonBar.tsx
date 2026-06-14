import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, GitCompare, EyeOff } from "lucide-react";

interface Props {
  records: LossRecord[];
  visibleBatchIds: string[];
}

const LINE_COLORS = ["#19A7CE", "#FED36A", "#FF6B6B"];

export default function ComparisonBar({ records, visibleBatchIds }: Props) {
  const { compareBatchIds, removeCompareBatch, clearCompareBatches } = useDashboardStore();

  if (compareBatchIds.length === 0) return null;

  const selectedRecords = compareBatchIds
    .map((id) => records.find((r) => r.batchId === id))
    .filter((r): r is LossRecord => r !== undefined);

  return (
    <div className="rounded-2xl border border-[#FED36A]/40 bg-gradient-to-r from-[#FED36A]/10 via-[#0B2447]/80 to-[#FED36A]/10 backdrop-blur p-4 shadow-lg shadow-[#FED36A]/5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FED36A]/15 flex items-center justify-center">
            <GitCompare size={16} className="text-[#FED36A]" />
          </div>
          <div>
            <h3 className="text-[#FED36A] text-sm font-semibold">批次对比模式</h3>
            <p className="text-[#576CBC] text-[10px]">最多对比 3 个批次 · Ctrl+点击加入对比</p>
          </div>
        </div>
        <button
          onClick={clearCompareBatches}
          className="flex items-center gap-1.5 rounded-lg border border-[#E94560]/40 px-3 py-1.5 text-[11px] text-[#E94560] hover:bg-[#E94560]/10 transition-all"
        >
          <X size={12} />
          清空全部
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedRecords.map((rec, idx) => {
          const isVisible = visibleBatchIds.includes(rec.batchId);
          const color = LINE_COLORS[idx % LINE_COLORS.length];

          return (
            <div
              key={rec.batchId}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                isVisible
                  ? "border-[#19A7CE]/30 bg-[#0B2447]/60"
                  : "border-[#3a4a7a]/30 bg-[#0B2447]/30 opacity-70"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[#A5D7E8] text-xs font-mono font-medium">{rec.batchId}</span>
                  <span className="inline-block rounded-full border border-[#19A7CE]/60 px-1.5 py-0 text-[9px] text-[#19A7CE]">
                    {rec.category}
                  </span>
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: rec.isHighLoss ? "#E94560" : "#19A7CE" }}
                  >
                    {(rec.lossRate * 100).toFixed(2)}%
                  </span>
                </div>
                {!isVisible && (
                  <div className="flex items-center gap-1 text-[#576CBC] text-[9px] mt-0.5">
                    <EyeOff size={9} />
                    已被品类筛选隐藏
                  </div>
                )}
              </div>
              <button
                onClick={() => removeCompareBatch(rec.batchId)}
                className="ml-1 p-1 rounded hover:bg-[#19A7CE]/10 transition-colors text-[#576CBC] hover:text-[#A5D7E8]"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
