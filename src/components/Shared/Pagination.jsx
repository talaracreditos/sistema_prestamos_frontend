import React from 'react';

const DOTS = '...';

const getPaginationRange = ({ totalPages, currentPage, siblingCount = 1 }) => {
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
    const totalPageNumbers = siblingCount + 5;

    if (totalPages <= totalPageNumbers) return range(1, totalPages);

    const leftSiblingIndex  = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const shouldShowLeftDots  = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        return [...range(1, 3 + 2 * siblingCount), DOTS, totalPages];
    }
    if (shouldShowLeftDots && !shouldShowRightDots) {
        return [1, DOTS, ...range(totalPages - (3 + 2 * siblingCount) + 1, totalPages)];
    }
    return [1, DOTS, ...range(leftSiblingIndex, rightSiblingIndex), DOTS, totalPages];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const paginationRange = getPaginationRange({ currentPage, totalPages });

    if (totalPages <= 1) return null;

    return (
        <nav className="flex flex-wrap justify-center items-center gap-1.5 md:gap-2 w-full mt-4 md:mt-0 transition-colors">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-bold text-slate-600 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:text-brand-red dark:hover:text-brand-gold hover:border-brand-red/30 dark:hover:border-brand-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Anterior
            </button>

            <div className="flex flex-wrap justify-center items-center gap-1 md:gap-1.5">
                {paginationRange.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                        return (
                            <span key={`dots-${index}`} className="px-1 md:px-2 py-1 text-xs font-bold text-slate-400 dark:text-dark-text-muted">
                                …
                            </span>
                        );
                    }
                    return (
                        <button
                            type="button"
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`px-2.5 py-1.5 md:px-3.5 md:py-2 text-[11px] md:text-xs font-black border rounded-lg transition-all ${
                                currentPage === pageNumber
                                    ? 'bg-brand-red dark:bg-brand-gold text-white dark:text-black border-brand-red dark:border-brand-gold shadow-sm shadow-brand-red/20 dark:shadow-brand-gold/20'
                                    : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-dark-text border-slate-200 dark:border-dark-border hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:text-brand-red dark:hover:text-brand-gold hover:border-brand-red/30 dark:hover:border-brand-gold/30'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-bold text-slate-600 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:text-brand-red dark:hover:text-brand-gold hover:border-brand-red/30 dark:hover:border-brand-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Siguiente
            </button>
        </nav>
    );
};

export default Pagination;