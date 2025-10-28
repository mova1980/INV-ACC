import React, { useState } from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: PieChartData[];
  title: string;
}

const PieChart: React.FC<Props> = ({ data, title }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] p-4">
                <h4 className="text-md font-bold text-center mb-4">{title}</h4>
                <div className="flex-grow flex items-center justify-center">
                    داده‌ای برای نمایش وجود ندارد.
                </div>
            </div>
        );
    }

    let accumulatedAngle = 0;
    const slices = data.map((item) => {
        const angle = (item.value / total) * 360;
        const startAngle = accumulatedAngle;
        accumulatedAngle += angle;
        const endAngle = accumulatedAngle;

        const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
        const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
        const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
        const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));

        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

        return {
            pathData,
            color: item.color,
            label: item.label,
            value: item.value,
            percentage: ((item.value / total) * 100).toFixed(1)
        };
    });

    const hoveredSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
      <div className="w-full h-full flex flex-col p-4">
        <h4 className="text-md font-bold text-center mb-4">{title}</h4>
        <div className="flex-grow flex items-center justify-around gap-4">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100">
                    {slices.map((slice, index) => (
                        <path
                            key={index}
                            d={slice.pathData}
                            fill={slice.color}
                            className="transition-transform duration-300 ease-out"
                            style={{ transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: '50% 50%' }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    ))}
                </svg>
                 {hoveredSlice ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-xs font-semibold" style={{ color: hoveredSlice.color }}>{hoveredSlice.label}</span>
                        <span className="text-lg font-bold text-[var(--text-primary)]">{hoveredSlice.value.toLocaleString('fa-IR')}</span>
                        <span className="text-sm text-[var(--text-muted)]">{hoveredSlice.percentage}%</span>
                    </div>
                ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold text-[var(--text-primary)]">کل</span>
                        <span className="text-md text-[var(--text-muted)]">{total.toLocaleString('fa-IR')}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-[var(--text-secondary)]">{item.label}:</span>
                        <span className="font-semibold text-[var(--text-primary)]">{item.value.toLocaleString('fa-IR')}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
};

export default PieChart;
