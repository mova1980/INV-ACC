import React, { useState, useMemo } from 'react';

interface BarValue {
  name: string;
  value: number;
  color: string;
}

export interface GroupedBarChartData {
  label: string;
  values: BarValue[];
}

interface Props {
  data: GroupedBarChartData[];
  title: string;
}

const BarChart: React.FC<Props> = ({ data, title }) => {
  const [hoveredInfo, setHoveredInfo] = useState<{ groupIndex: number; barIndex: number } | null>(null);

  if (!data || data.length === 0) {
    return (
        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            داده‌ای برای نمایش وجود ندارد.
        </div>
    );
  }

  const maxValue = useMemo(() => Math.max(...data.flatMap(item => item.values.map(v => v.value)), 0), [data]);
  const yAxisLabels = maxValue > 0 ? Array.from({ length: 4 }, (_, i) => (maxValue / 3) * i) : [0];

  const legendItems = useMemo(() => data[0]?.values.map(v => ({ name: v.name, color: v.color })) || [], [data]);

  const groupWidth = 80 / data.length;
  const gapWidth = 20 / (data.length + 1);
  const barCountInGroup = data[0]?.values.length || 1;
  const barPadding = 0.1; // 10% padding between bars in a group
  const totalBarWidthInGroup = groupWidth * (1 - barPadding);
  const individualBarWidth = totalBarWidthInGroup / barCountInGroup;


  return (
    <div className="w-full h-full flex flex-col p-4">
      <h4 className="text-md font-bold text-center mb-2">{title}</h4>
      <div className="flex-grow w-full relative">
        <svg width="100%" height="calc(100% - 30px)" className="overflow-visible">
          {/* Y-Axis Lines and Labels */}
          {yAxisLabels.map((label, index) => (
            <g key={index}>
              <line
                x1="0" y1={`${100 - (label / (maxValue || 1)) * 90}%`}
                x2="100%" y2={`${100 - (label / (maxValue || 1)) * 90}%`}
                stroke="var(--border-color)" strokeWidth="1" strokeDasharray="2,2"
              />
              <text x="0" y={`${100 - (label / (maxValue || 1)) * 90}%`} dy="-4" fill="var(--text-muted)" fontSize="10" textAnchor="start">
                {label > 1000000 ? `${(label / 1000000).toFixed(1)} M` : label > 1000 ? `${Math.round(label / 1000)} K` : Math.round(label)}
              </text>
            </g>
          ))}
          
          {/* Bars and X-Axis Labels */}
          {data.map((item, groupIndex) => {
            const groupXPos = groupIndex * (groupWidth + gapWidth) + gapWidth;
            return (
              <g key={groupIndex}>
                {item.values.map((bar, barIndex) => {
                  const barHeight = (bar.value / (maxValue || 1)) * 90;
                  const barXPos = groupXPos + (groupWidth * barPadding / 2) + barIndex * individualBarWidth;
                  return (
                    <rect
                      key={barIndex}
                      x={`${barXPos}%`} y={`${100 - barHeight}%`}
                      width={`${individualBarWidth}%`} height={`${barHeight}%`}
                      fill={bar.color}
                      className="transition-all duration-300"
                      style={{ opacity: hoveredInfo === null || (hoveredInfo.groupIndex === groupIndex && hoveredInfo.barIndex === barIndex) ? 1 : 0.5 }}
                      rx="1"
                      onMouseEnter={() => setHoveredInfo({ groupIndex, barIndex })}
                      onMouseLeave={() => setHoveredInfo(null)}
                    />
                  );
                })}
                 <text x={`${groupXPos + groupWidth / 2}%`} y="100%" dy="15" fill="var(--text-secondary)" fontSize="10" textAnchor="middle" className="truncate">
                  {item.label}
                 </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredInfo !== null && data[hoveredInfo.groupIndex] && (
            <div 
                className="absolute bg-[var(--background-secondary)] text-[var(--text-primary)] border border-[var(--border-color-strong)] p-2 rounded-md shadow-lg text-xs pointer-events-none transition-opacity duration-200"
                style={{
                    left: `${(hoveredInfo.groupIndex * (groupWidth + gapWidth) + gapWidth) + (groupWidth * barPadding / 2) + (hoveredInfo.barIndex * individualBarWidth) + (individualBarWidth/2)}%`,
                    bottom: `${((data[hoveredInfo.groupIndex].values[hoveredInfo.barIndex].value / (maxValue || 1)) * 90) + 5}%`,
                    transform: 'translateX(-50%)',
                }}
            >
                <div className="font-bold">{data[hoveredInfo.groupIndex].label}</div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: data[hoveredInfo.groupIndex].values[hoveredInfo.barIndex].color}}></span>
                    <span>{data[hoveredInfo.groupIndex].values[hoveredInfo.barIndex].name}:</span>
                    <span className="font-semibold">{data[hoveredInfo.groupIndex].values[hoveredInfo.barIndex].value.toLocaleString('fa-IR')}</span>
                </div>
            </div>
        )}
      </div>
       {/* Legend */}
        <div className="flex justify-center items-center gap-4 pt-2 text-xs">
            {legendItems.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[var(--text-secondary)]">{item.name}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

export default BarChart;
