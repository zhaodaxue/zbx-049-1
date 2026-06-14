import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

interface Props {
  records: LossRecord[];
}

export default function LossBarChart({ records }: Props) {
  const { selectedCategory, setSelectedCategory } = useDashboardStore();

  const sorted = useMemo(() => [...records], [records]);

  const option = useMemo(() => {
    const batchIds = sorted.map((r) => r.batchId);
    const lossValues = sorted.map((r) => +(r.lossRate * 100).toFixed(2));
    const colors = sorted.map((r) => {
      if (r.isHighLoss) return "#E94560";
      if (selectedCategory && r.category !== selectedCategory) return "rgba(25,167,206,0.25)";
      return "#19A7CE";
    });

    return {
      title: {
        text: "各批次损耗率（降序）",
        left: "center",
        top: 8,
        textStyle: { color: "#A5D7E8", fontSize: 15, fontFamily: "Noto Sans SC, sans-serif" },
      },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "rgba(11,36,71,0.92)",
        borderColor: "#19A7CE",
        textStyle: { color: "#A5D7E8", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx = p.dataIndex as number;
          const rec = sorted[idx];
          return `<b>${rec.batchId}</b><br/>品类：${rec.category}<br/>损耗率：<span style="color:#E94560;font-weight:bold">${(rec.lossRate * 100).toFixed(2)}%</span><br/>到货：${rec.arrivalWeight}kg → 解冻：${rec.thawedWeight}kg<br/>到货日：${rec.arrivalDate}`;
        },
      },
      grid: { left: 130, right: 40, top: 50, bottom: 24 },
      xAxis: {
        type: "value" as const,
        axisLabel: { color: "#576CBC", formatter: "{value}%", fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(87,108,188,0.15)" } },
      },
      yAxis: {
        type: "category" as const,
        data: batchIds,
        axisLabel: { color: "#A5D7E8", fontSize: 10, fontFamily: "JetBrains Mono, monospace" },
        axisLine: { lineStyle: { color: "rgba(87,108,188,0.3)" } },
      },
      series: [
        {
          type: "bar",
          data: lossValues.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
          barWidth: 14,
          label: {
            show: true,
            position: "right" as const,
            formatter: "{c}%",
            color: "#A5D7E8",
            fontSize: 10,
            fontFamily: "JetBrains Mono, monospace",
          },
        },
      ],
    };
  }, [sorted, selectedCategory]);

  const handleClick = (params: unknown) => {
    const p = params as { dataIndex?: number };
    if (p.dataIndex !== undefined) {
      const clicked = sorted[p.dataIndex];
      if (clicked) {
        setSelectedCategory(selectedCategory === clicked.category ? null : clicked.category);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-[#19A7CE]/20 bg-[#0B2447]/60 backdrop-blur p-4 shadow-lg shadow-[#19A7CE]/5">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 520 }}
        onEvents={{ click: handleClick }}
      />
    </div>
  );
}
