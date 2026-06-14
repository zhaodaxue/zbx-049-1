import type { LossRecord } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getCategories } from "@/utils/calcLoss";

interface Props {
  records: LossRecord[];
}

export default function CategoryFilter({ records }: Props) {
  const { selectedCategory, setSelectedCategory } = useDashboardStore();
  const categories = getCategories(records);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border ${
          selectedCategory === null
            ? "bg-[#19A7CE] text-[#0B2447] border-[#19A7CE]"
            : "bg-transparent text-[#A5D7E8] border-[#19A7CE]/40 hover:border-[#19A7CE]"
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() =>
            setSelectedCategory(selectedCategory === cat ? null : cat)
          }
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border ${
            selectedCategory === cat
              ? "bg-[#19A7CE] text-[#0B2447] border-[#19A7CE]"
              : "bg-transparent text-[#A5D7E8] border-[#19A7CE]/40 hover:border-[#19A7CE]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
