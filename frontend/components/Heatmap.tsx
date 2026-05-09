"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, eachDayOfInterval, getDay } from "date-fns";
import clsx from "clsx";

interface HeatmapProps {
  data: Record<string, number>;
  color?: string;
  weeks?: number;
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function Heatmap({ data, color = "#f94516", weeks = 26 }: HeatmapProps) {
  const grid = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, weeks * 7), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end: today });

    const cols: Date[][] = [];
    let col: Date[] = new Array(getDay(start) === 0 ? 6 : getDay(start) - 1).fill(null);

    for (const day of days) {
      col.push(day);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    }
    if (col.length > 0) {
      while (col.length < 7) col.push(null as any);
      cols.push(col);
    }
    return cols;
  }, [weeks]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((col, ci) => {
      const firstReal = col.find(Boolean);
      if (!firstReal) return;
      const m = firstReal.getMonth();
      if (m !== lastMonth) {
        labels.push({ label: format(firstReal, "MMM"), col: ci });
        lastMonth = m;
      }
    });
    return labels;
  }, [grid]);

  const maxVal = Math.max(1, ...Object.values(data));

  function getOpacity(date: Date | null): number {
    if (!date) return 0;
    const key = format(date, "yyyy-MM-dd");
    const val = data[key] ?? 0;
    if (val === 0) return 0;
    return 0.25 + (val / maxVal) * 0.75;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 28 }}>
          {grid.map((_, ci) => {
            const lbl = monthLabels.find((l) => l.col === ci);
            return (
              <div key={ci} className="w-[14px] mr-[3px] text-[10px] text-coal-300 font-mono shrink-0">
                {lbl ? lbl.label : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col mr-1 pt-0">
            {DAYS.map((d, i) => (
              <div key={i} className="h-[14px] mb-[3px] text-[9px] text-coal-300 font-mono w-5 text-right leading-[14px]">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          {grid.map((col, ci) => (
            <div key={ci} className="flex flex-col mr-[3px]">
              {col.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-[14px] h-[14px] mb-[3px]" />;
                }
                const opacity = getOpacity(day);
                const dateStr = format(day, "yyyy-MM-dd");
                const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={di}
                    title={`${dateStr}${data[dateStr] ? " ✓" : ""}`}
                    className={clsx(
                      "w-[14px] h-[14px] mb-[3px] rounded-[3px] transition-transform hover:scale-125 cursor-default",
                      isToday && "ring-1 ring-white/30"
                    )}
                    style={{
                      backgroundColor:
                        opacity > 0
                          ? color
                          : "rgba(255,255,255,0.06)",
                      opacity: opacity > 0 ? 0.3 + opacity * 0.7 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-coal-300 font-mono">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((o, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{
                backgroundColor: o === 0 ? "rgba(255,255,255,0.06)" : color,
                opacity: o === 0 ? 1 : 0.3 + o * 0.7,
              }}
            />
          ))}
          <span className="text-[10px] text-coal-300 font-mono">More</span>
        </div>
      </div>
    </div>
  );
}
