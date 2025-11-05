import React from "react";

interface PaginationProps {
    page: number;
    totalPages: number;
    perPage: number;
    totalData: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    page,
    totalPages,
    perPage,
    totalData,
    onPageChange,
    className = "",
}: PaginationProps) {
    const startIdx = (page - 1) * perPage + 1;
    const endIdx = Math.min(page * perPage, totalData);

    return (
        <div
            className={`mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700 dark:text-gray-300 gap-3 ${className}`}
        >
            {/* Info jumlah data */}
            <p>
                Menampilkan {startIdx} - {endIdx} dari {totalData} data
            </p>

            {/* Tombol navigasi */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                    Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => onPageChange(i + 1)}
                        className={`rounded border px-3 py-1 transition ${
                            page === i + 1
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
