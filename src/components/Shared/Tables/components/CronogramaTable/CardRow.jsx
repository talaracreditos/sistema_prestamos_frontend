import React from 'react';

export const CardRow = ({ label, children, hidden, icon }) => {
    if (hidden) return null;
    return (
        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors">
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {icon && <span className="text-[9px]">{icon}</span>}
                <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-right">{children}</div>
        </div>
    );
};