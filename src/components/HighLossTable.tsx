import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { filterHighLoss } from "@/utils/calcLoss";
import { AlertTriangle } from "lucide-react";

interface Props {
  records: LossRecord[];
  filteredBatchIds?: string[];
}

const COMPARE_COLORS = ["#19A7CE", "#FED36A", "#FF6B6B"];

export default function HighLossTable({ records, filteredBatchIds }: Props) {
  const { selectedCategory, setSelectedCategory, compareBatchIds, toggleCompareBatch, isComparing } = useDashboardStore();

  const allHighLoss = filterHighLoss(records);
  const highLoss = filteredBatchIds
    ? allHighLoss.filter((r) => filteredBatchIds.includes(r.batchId))
    : allHighLoss;

  const handleClick = (e: React.MouseEvent, record: LossRecord) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (isCtrlOrCmd) {
      toggleCompareBatch(record.batchId);
    } else {
      if (!isComparing) {
        setSelectedCategory(selectedCategory === record.category ? null : record.category);
      }
    }
  };

  if (highLoss.length === 0) {
    return (
      <div className="rounded-2xl border border-[#19A7CE]/20 bg-[#0B2447]/60 backdrop-blur p-5 shadow-lg shadow-[#19A7CE]/5">
        <h3 className="text-[#A5D7E8] text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#19A7CE]" />
          高损耗警示
        </h3>
        <p className="text-[#576CBC] text-xs">当前无损耗率 ≥ 8% 的批次</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E94560]/30 bg-[#0B2447]/60 backdrop-blur p-5 shadow-lg shadow-[#E94560]/5">
      <h3 className="text-[#E94560] text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle size={16} />
        高损耗警示（≥ 8%）
      </h3>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
        {highLoss.map((r) => {
          const compareIdx = compareBatchIds.indexOf(r.batchId);
          const isSelected = compareIdx !== -1;
          const compareColor = isSelected ? COMPARE_COLORS[compareIdx % COMPARE_COLORS.length] : null;

          return (
            <div
              key={r.batchId}
              onClick={(e) => handleClick(e, r)}
              className={`border-l-4 bg-[#0B2447]/80 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-[#193257]/80 ${
                isSelected
                  ? "ring-2"
                  : selectedCategory === r.category
                  ? "ring-1 ring-[#19A7CE]"
                  : ""
              }`}
              style={{
                borderLeftColor: isSelected && compareColor ? compareColor : "#E94560",
                boxShadow: isSelected && compareColor ? `0 0 0 2px ${compareColor}` : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#A5D7E8] text-xs font-mono">{r.batchId}</span>
                  <span className="inline-block rounded-full border border-[#19A7CE]/60 px-2 py-0.5 text-[10px] text-[#19A7CE]">
                    {r.category}
                  </span>
                  {isSelected && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      style={{ backgroundColor: `${compareColor}20`, color: compareColor }}
                    >
                      ✓ 对比 #{compareIdx + 1}
                    </span>
                  )}
                </div>
                <span className="text-[#E94560] font-bold text-sm font-mono">
                  {(r.lossRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="text-[#576CBC] text-[11px] mt-1 font-mono">
                到货 {r.arrivalWeight}kg → 解冻 {r.thawedWeight}kg &nbsp;|&nbsp; {r.arrivalDate}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
