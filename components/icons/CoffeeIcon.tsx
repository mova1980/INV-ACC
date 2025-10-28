import React from 'react';

export const CoffeeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <g strokeLinecap="round" strokeLinejoin="round">
            {/* Steam lines */}
            <path className="steam-line steam-line-1" d="M8 6 C8 4, 10 4, 10 6" />
            <path className="steam-line steam-line-2" d="M12 7 C12 5, 14 5, 14 7" />
            <path className="steam-line steam-line-3" d="M16 6 C16 4, 18 4, 18 6" />
            
            {/* Cup */}
            <path d="M19.5 9.5c0 3.314-2.686 6-6 6H10.5c-3.314 0-6-2.686-6-6v-1c0-1.105.895-2 2-2h11c1.105 0 2 .895 2 2v1z" />
            <path d="M19.5 9.5H21a1 1 0 011 1v2a1 1 0 01-1 1h-1.5" />
            
            {/* Saucer */}
            <path d="M5 18h14" />
        </g>
    </svg>
);