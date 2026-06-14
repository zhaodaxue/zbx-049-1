import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent, MarkLineComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, CanvasRenderer]);

interface Props {
  records: LossRecord[];
}

export default function CategoryLineChart({ records }: Props) {
  const { selectedCategory } = useDashboardStore();

  const filtered = useMemo(() => {
    if (!selectedCategory) return [];
    return records
      .filter((r) => r.category === selectedCategory)
      .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));
  }, [records, selectedCategory]);

  const option = useMemo(() => {
    if (!selectedCategory || filtered.length === 0) {
      return {
        title: {
          text: "品类损耗率趋势",
          subtext: "请点选左侧品类查看趋势",
          left: "center",
          top: "center",
          textStyle: { color: "#576CBC", fontSize: 14, fontFamily: "Noto Sans SC, sans-serif" },
          subtextStyle: { color: "#3a4a7a", fontSize: 12 },
        },
      };
    }

    const dates = filtered.map((r) => r.arrivalDate);
    const lossValues = filtered.map((r) => +(r.lossRate * 100).toFixed(2));

    return {
      title: {
        text: `${selectedCategory} — 损耗率趋势`,
        left: "center",
        top: 8,
        textStyle: { color: "#A5D7E8", fontSize: 15, fontFamily: "Noto Sans SC, sans-serif" },
      },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(11,36,71,0.92)",
        borderColor: "#19A7CE",
        textStyle: { color: "#A5D7E8", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx = p.dataIndex as number;
          const rec = filtered[idx];
          return `<b>${rec.batchId}</b><br/>损耗率：<span style="color:#E94560;font-weight:bold">${(rec.lossRate * 100).toFixed(2)}%</span><br/>到货：${rec.arrivalWeight}kg → 解冻：${rec.thawedWeight}kg`;
        },
      },
      grid: { left: 55, right: 30, top: 55, bottom: 40 },
      xAxis: {
        type: "category" as const,
        data: dates,
        axisLabel: { color: "#576CBC", fontSize: 10, rotate: 25 },
        axisLine: { lineStyle: { color: "rgba(87,108,188,0.3)" } },
      },
      yAxis: {
        type: "value" as const,
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
              const rec = filtered[params.dataIndex];
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
  }, [filtered, selectedCategory]);

  return (
    <div className="rounded-2xl border border-[#19A7CE]/20 bg-[#0B2447]/60 backdrop-blur p-4 shadow-lg shadow-[#19A7CE]/5 h-full">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 520 }}
      />
    </div>
  );
}
