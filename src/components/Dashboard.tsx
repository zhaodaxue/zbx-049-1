import { useMemo } from "react";
import { parseBatches } from "@/utils/parseData";
import { enrichWithLoss, filterValidRecords } from "@/utils/calcLoss";
import CategoryFilter from "@/components/CategoryFilter";
import LossBarChart from "@/components/LossBarChart";
import HighLossTable from "@/components/HighLossTable";
import CategoryLineChart from "@/components/CategoryLineChart";
import ComparisonBar from "@/components/ComparisonBar";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Snowflake, Fish } from "lucide-react";

export default function Dashboard() {
  const { selectedCategory } = useDashboardStore();

  const lossRecords = useMemo(() => {
    const parsed = parseBatches();
    return enrichWithLoss(parsed);
  }, []);

  const validRecords = useMemo(() => filterValidRecords(lossRecords), [lossRecords]);

  const filteredBatchIds = useMemo(() => {
    if (!selectedCategory) return validRecords.map((r) => r.batchId);
    return validRecords
      .filter((r) => r.category === selectedCategory)
      .map((r) => r.batchId);
  }, [validRecords, selectedCategory]);

  const visibleBatchIds = useMemo(() => {
    return validRecords
      .filter((r) => !selectedCategory || r.category === selectedCategory)
      .map((r) => r.batchId);
  }, [validRecords, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2447] via-[#0f2d5e] to-[#091b3a] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L45 15 L37 22 L40 32 L30 26 L20 32 L23 22 L15 15 L25 15Z' fill='%2319A7CE' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />

      <header className="relative z-10 border-b border-[#19A7CE]/15 bg-[#0B2447]/40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#19A7CE]/15 flex items-center justify-center">
              <Fish size={22} className="text-[#19A7CE]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Noto Sans SC, sans-serif" }}>
                冰鲜解冻损耗看板
              </h1>
              <p className="text-[#576CBC] text-xs mt-0.5">实时监控批次损耗 · 识别高损耗品类</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#576CBC] text-xs">
            <Snowflake size={14} className="text-[#19A7CE] animate-pulse" />
            <span>冷链数据镜像</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">
        <ComparisonBar records={lossRecords} visibleBatchIds={visibleBatchIds} />

        <div className="mb-5">
          <CategoryFilter records={lossRecords} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            <LossBarChart records={lossRecords} filteredBatchIds={filteredBatchIds} />
            <HighLossTable records={lossRecords} filteredBatchIds={filteredBatchIds} />
          </div>
          <div>
            <CategoryLineChart records={lossRecords} filteredBatchIds={visibleBatchIds} />
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#19A7CE]/10 mt-8 py-4 text-center text-[#3a4a7a] text-[10px]">
        损耗率 = (到货净重 − 解冻后净重) ÷ 到货净重 &nbsp;|&nbsp; 高损耗阈值 ≥ 8% &nbsp;|&nbsp; Ctrl+点击加入对比
      </footer>
    </div>
  );
}
