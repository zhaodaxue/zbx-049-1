import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { filterByCategory, filterValidRecords } from "@/utils/calcLoss";

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, LegendComponent, CanvasRenderer]);

interface Props {
  records: LossRecord[];
  filteredBatchIds?: string[];
}

const COMPARE_COLORS = ["#19A7CE", "#FED36A", "#FF6B6B"];

export default function CategoryLineChart({ records, filteredBatchIds }: Props) {
  const { selectedCategory, compareBatchIds, isComparing } = useDashboardStore();

  const validRecords = useMemo(() => filterValidRecords(records), [records]);

  const categoryFiltered = useMemo(() => {
    if (!selectedCategory) return validRecords;
    return filterByCategory(validRecords, selectedCategory);
  }, [validRecords, selectedCategory]);

  const visibleRecords = useMemo(() => {
    if (!filteredBatchIds) return categoryFiltered;
    return categoryFiltered.filter((r) => filteredBatchIds.includes(r.batchId));
  }, [categoryFiltered, filteredBatchIds]);

  const compareRecords = useMemo(() => {
    return compareBatchIds
      .map((id) => validRecords.find((r) => r.batchId === id))
      .filter((r): r is LossRecord => r !== undefined);
  }, [validRecords, compareBatchIds]);

  const visibleCompareRecords = useMemo(() => {
    if (!filteredBatchIds) return compareRecords;
    return compareRecords.filter((r) => filteredBatchIds.includes(r.batchId));
  }, [compareRecords, filteredBatchIds]);

  const option = useMemo(() => {
    if (isComparing) {
      if (visibleCompareRecords.length > 0) {
        const allDates = [...new Set(visibleCompareRecords.map((r) => r.arrivalDate))];
        const hasDuplicateDates = allDates.length !== visibleCompareRecords.length;

        interface AxisPoint {
          label: string;
          date: string;
        }

        const axisPoints: AxisPoint[] = hasDuplicateDates
          ? visibleCompareRecords.map((r) => ({ label: r.batchId, date: r.arrivalDate }))
          : allDates.map((d) => ({ label: d, date: d }));

        axisPoints.sort((a, b) => a.date.localeCompare(b.date));

        const series = visibleCompareRecords.map((rec, idx) => {
          const color = COMPARE_COLORS[idx % COMPARE_COLORS.length];
          const data = axisPoints.map((pt) => {
            const match = hasDuplicateDates
              ? visibleCompareRecords.find((r) => r.batchId === pt.label)
              : visibleCompareRecords.find((r) => r.arrivalDate === pt.label);
            return match?.batchId === rec.batchId ? +(rec.lossRate * 100).toFixed(2) : null;
          });

          return {
            name: rec.batchId,
            type: "line" as const,
            data,
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            connectNulls: false,
            lineStyle: { color, width: 3 },
            itemStyle: {
              color: rec.isHighLoss ? "#E94560" : color,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${color}4D` },
                { offset: 1, color: `${color}05` },
              ]),
            },
            markLine: idx === 0 ? {
              silent: true,
              lineStyle: { color: "#E94560", type: "dashed" as const, width: 1 },
              label: { formatter: "8% 警戒线", color: "#E94560", fontSize: 10 },
              data: [{ yAxis: 8 }],
            } : undefined,
          };
        });

        const legendData = visibleCompareRecords.map((rec, idx) => ({
          name: rec.batchId,
          itemStyle: { color: COMPARE_COLORS[idx % COMPARE_COLORS.length] },
        }));

        return {
          title: {
            text: "批次对比 — 损耗率趋势",
            left: "center",
            top: 8,
            textStyle: { color: "#A5D7E8", fontSize: 15, fontFamily: "Noto Sans SC, sans-serif" },
            subtext: compareRecords.length > visibleCompareRecords.length
              ? `已选 ${compareRecords.length} 个批次（${compareRecords.length - visibleCompareRecords.length} 个被筛选隐藏）`
              : `已选 ${visibleCompareRecords.length} 个批次`,
            subtextStyle: { color: "#576CBC", fontSize: 11 },
          },
          tooltip: {
            trigger: "axis" as const,
            backgroundColor: "rgba(11,36,71,0.92)",
            borderColor: "#19A7CE",
            textStyle: { color: "#A5D7E8", fontSize: 12 },
            formatter: (params: unknown) => {
              const ps = Array.isArray(params) ? params : [params];
              const parts: string[] = [];
              for (const p of ps) {
                const idx = p.dataIndex as number;
                const pt = axisPoints[idx];
                const match = visibleCompareRecords.find(
                  (r) => (hasDuplicateDates ? r.batchId === pt.label : r.arrivalDate === pt.label)
                );
                if (match) {
                  parts.push(
                    `<b>${match.batchId}</b> (${match.category})<br/>到货日：${match.arrivalDate}<br/>损耗率：<span style="color:#E94560;font-weight:bold">${(match.lossRate * 100).toFixed(2)}%</span><br/>到货：${match.arrivalWeight}kg → 解冻：${match.thawedWeight}kg`
                  );
                }
              }
              return parts.join("<br/><br/>");
            },
          },
          legend: {
            data: legendData,
            top: 35,
            textStyle: { color: "#A5D7E8", fontSize: 11 },
            formatter: (name: string) => {
              const rec = visibleCompareRecords.find((r) => r.batchId === name);
              return rec ? `${name} · ${rec.category}` : name;
            },
          },
          grid: { left: 55, right: 30, top: 90, bottom: 40 },
          xAxis: {
            type: "category" as const,
            show: true,
            data: axisPoints.map((p) => p.label),
            axisLabel: {
              color: "#576CBC",
              fontSize: 10,
              rotate: hasDuplicateDates ? 30 : 25,
              fontFamily: hasDuplicateDates ? "JetBrains Mono, monospace" : "inherit",
            },
            axisLine: { lineStyle: { color: "rgba(87,108,188,0.3)" } },
          },
          yAxis: {
            type: "value" as const,
            show: true,
            axisLabel: { color: "#576CBC", formatter: "{value}%", fontSize: 11 },
            splitLine: { lineStyle: { color: "rgba(87,108,188,0.15)" } },
          },
          series,
        };
      } else {
        return {
          title: {
            text: "批次对比 — 损耗率趋势",
            subtext: `已选 ${compareRecords.length} 个批次（全部被筛选隐藏）\n请调整品类筛选或移除对比`,
            left: "center",
            top: "center",
            textStyle: { color: "#576CBC", fontSize: 14, fontFamily: "Noto Sans SC, sans-serif" },
            subtextStyle: { color: "#3a4a7a", fontSize: 12, lineHeight: 1.8 },
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: [],
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
        };
      }
    }

    if (!selectedCategory || visibleRecords.length === 0) {
      return {
        title: {
          text: "品类损耗率趋势",
          subtext: "请点选左侧品类查看趋势",
          left: "center",
          top: "center",
          textStyle: { color: "#576CBC", fontSize: 14, fontFamily: "Noto Sans SC, sans-serif" },
          subtextStyle: { color: "#3a4a7a", fontSize: 12 },
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
      };
    }

    const hasDuplicateDates = (() => {
      const dates = visibleRecords.map((r) => r.arrivalDate);
      return new Set(dates).size !== dates.length;
    })();

    const xLabels = hasDuplicateDates
      ? visibleRecords.map((r) => r.batchId)
      : visibleRecords.map((r) => r.arrivalDate);

    const lossValues = visibleRecords.map((r) => +(r.lossRate * 100).toFixed(2));

    return {
      title: {
        text: `${selectedCategory} — 损耗率趋势`,
        left: "center",
        top: 8,
        textStyle: { color: "#A5D7E8", fontSize: 15, fontFamily: "Noto Sans SC, sans-serif" },
        subtext: "",
      },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(11,36,71,0.92)",
        borderColor: "#19A7CE",
        textStyle: { color: "#A5D7E8", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx = p.dataIndex as number;
          const rec = visibleRecords[idx];
          if (!rec) return "";
          return `<b>${rec.batchId}</b><br/>到货日：${rec.arrivalDate}<br/>损耗率：<span style="color:#E94560;font-weight:bold">${(rec.lossRate * 100).toFixed(2)}%</span><br/>到货：${rec.arrivalWeight}kg → 解冻：${rec.thawedWeight}kg`;
        },
      },
      grid: { left: 55, right: 30, top: 55, bottom: 40 },
      xAxis: {
        type: "category" as const,
        show: true,
        data: xLabels,
        axisLabel: {
          color: "#576CBC",
          fontSize: 10,
          rotate: hasDuplicateDates ? 30 : 25,
          fontFamily: hasDuplicateDates ? "JetBrains Mono, monospace" : "inherit",
        },
        axisLine: { lineStyle: { color: "rgba(87,108,188,0.3)" } },
      },
      yAxis: {
        type: "value" as const,
        show: true,
        axisLabel: { color: "#576CBC", formatter: "{value}%", fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(87,108,188,0.15)" } },
      },
      series: [
        {
          type: "line",
          data: lossValues,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { color: "#19A7CE", width: 3 },
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              const rec = visibleRecords[params.dataIndex];
              return rec?.isHighLoss ? "#E94560" : "#19A7CE";
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(25,167,206,0.3)" },
              { offset: 1, color: "rgba(25,167,206,0.02)" },
            ]),
          },
          markLine: {
            silent: true,
            lineStyle: { color: "#E94560", type: "dashed" as const, width: 1 },
            label: { formatter: "8% 警戒线", color: "#E94560", fontSize: 10 },
            data: [{ yAxis: 8 }],
          },
        },
      ],
    };
  }, [visibleRecords, selectedCategory, isComparing, visibleCompareRecords, compareRecords]);

  return (
    <div className="rounded-2xl border border-[#19A7CE]/20 bg-[#0B2447]/60 backdrop-blur p-4 shadow-lg shadow-[#19A7CE]/5 h-full">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge={true}
        style={{ height: 520 }}
      />
    </div>
  );
}
