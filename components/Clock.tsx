import React, { useState, useEffect } from 'react';

interface ClockProps {
    size?: number;
}

const Clock: React.FC<ClockProps> = ({ size = 70 }) => {
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [date, setDate] = useState('');

    useEffect(() => {
        const setClockTime = () => {
            const now = new Date();
            const tehranTimeString = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tehran', hour12: false });
            const [h, m, s] = tehranTimeString.split(':').map(Number);
            setTime({ hours: h, minutes: m, seconds: s });

            // Use 'fa-IR' to get Persian numerals and a compact, readable date format
            const tehranDateString = new Intl.DateTimeFormat('fa-IR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: 'Asia/Tehran'
            }).format(now);
            setDate(tehranDateString);
        };
        
        setClockTime();
        const timerId = setInterval(setClockTime, 1000);

        return () => clearInterval(timerId);
    }, []);

    const secondDeg = time.seconds * 6;
    const minuteDeg = time.minutes * 6 + time.seconds * 0.1;
    const hourDeg = (time.hours % 12) * 30 + time.minutes * 0.5;

    const clockSize = size;
    const center = clockSize / 2;
    
    return (
        <div className="flex flex-row-reverse items-center gap-4">
            <svg width={clockSize} height={clockSize} viewBox={`0 0 ${clockSize} ${clockSize}`} className="drop-shadow-md flex-shrink-0">
                <circle cx={center} cy={center} r={center - 2} fill="var(--background-tertiary)" stroke="var(--border-color)" strokeWidth="1" />
                
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30;
                    return (
                        <line 
                            key={i}
                            x1={center} y1={center - (center - clockSize / 12)}
                            x2={center} y2={center - (center - clockSize / 20)}
                            stroke="var(--text-muted)"
                            strokeWidth={i % 3 === 0 ? "1.5" : "0.5"}
                            transform={`rotate(${angle} ${center} ${center})`}
                        />
                    );
                })}
                
                <line
                    x1={center} y1={center}
                    x2={center} y2={center - clockSize * 0.25}
                    stroke="var(--text-primary)"
                    strokeWidth={clockSize / 30}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s ease-out' }}
                />

                <line
                    x1={center} y1={center}
                    x2={center} y2={center - clockSize * 0.35}
                    stroke="var(--text-primary)"
                    strokeWidth={clockSize / 40}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${minuteDeg}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s ease-out' }}
                />
                
                <line
                    x1={center} y1={center + clockSize / 12}
                    x2={center} y2={center - clockSize * 0.4}
                    stroke="var(--color-danger)"
                    strokeWidth={clockSize / 60}
                    strokeLinecap="round"
                    style={{ transform: `rotate(${secondDeg}deg)`, transformOrigin: 'center center', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1.5)' }}
                />
                
                <circle cx={center} cy={center} r={clockSize / 30} fill="var(--text-primary)" />
                <circle cx={center} cy={center} r={clockSize / 60} fill="var(--background-secondary)" />
            </svg>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-primary)] font-sans font-semibold text-center transition-colors">
                {date}
            </div>
        </div>
    );
};

export default Clock;