import ModalQRCode from '@/components/ModalQRCode';
import Pagination from '@/components/Pagination';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronUp, QrCode } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Ruas {
    id: number;
    nm_ruas: string;
}

interface Props {
    ruasList: Ruas[];
}

export default function InformasiRuasIndex({ ruasList }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [qrValue, setQrValue] = useState('');
    const [sortField, setSortField] = useState<keyof Ruas>('nm_ruas');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    // 🔍 Filter + Sort
    const filtered = useMemo(() => {
        let data = ruasList.filter((r) => r.nm_ruas.toLowerCase().includes(search.toLowerCase()));

        data = data.sort((a, b) => {
            const aVal = a[sortField]?.toString().toLowerCase();
            const bVal = b[sortField]?.toString().toLowerCase();
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [ruasList, search, sortField, sortOrder]);

    // 📄 Pagination logic
    const totalData = filtered.length;
    const totalPages = Math.ceil(totalData / perPage);
    const startIdx = (page - 1) * perPage;
    const paginated = filtered.slice(startIdx, startIdx + perPage);

    // ⬆️ Sorting handler
    const handleSort = (field: keyof Ruas) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // 🧭 Sort icon
    const renderSortIcon = (field: keyof Ruas) => {
        if (sortField !== field) return <ChevronUp className="ml-1 h-4 w-4 opacity-30" />;
        return sortOrder === 'asc' ? <ChevronUp className="ml-1 h-4 w-4 text-blue-600" /> : <ChevronDown className="ml-1 h-4 w-4 text-blue-600" />;
    };

    return (
        <AppLayout>
            <Head title="Data Informasi Ruas" />

            <div className="p-6">
                <div className="mb-6 flex flex-col items-center justify-between sm:flex-row">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Data Ruas Jalan</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Silakan klik tombol QR untuk generate barcode.</p>
                    </div>
                </div>

                {/* 🔍 Filter dan Page size */}
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        className="rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size} / halaman
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Cari nama ruas..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-48 rounded border px-3 py-1.5 text-sm sm:w-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                {/* 🧾 Table */}
                <div className="overflow-hidden rounded-lg border dark:border-gray-700">
                    <table className="min-w-full border-collapse bg-white text-sm dark:bg-gray-900 dark:text-gray-100">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="cursor-pointer px-4 py-3 text-left font-semibold" onClick={() => handleSort('id')}>
                                    <div className="flex items-center">
                                        Kode Ruas
                                        {renderSortIcon('id')}
                                    </div>
                                </th>
                                <th className="cursor-pointer px-4 py-3 text-left font-semibold" onClick={() => handleSort('nm_ruas')}>
                                    <div className="flex items-center">
                                        Nama Ruas
                                        {renderSortIcon('nm_ruas')}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center font-semibold">Preview</th>
                                <th className="px-4 py-3 text-center font-semibold">QR Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((r, idx) => (
                                    <tr key={r.id} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}>
                                        <td className="px-4 py-3">{r.id}</td>
                                        <td className="px-4 py-3">{r.nm_ruas}</td>
                                        <td className="px-4 py-3 text-center">
                                            <a
                                                href={route('informasi-ruas.preview', r.id)}
                                                target="_blank"
                                                className="text-blue-600 underline hover:text-blue-800"
                                            >
                                                Lihat
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setQrValue(route('informasi-ruas.preview', r.id));
                                                    setIsModalOpen(true);
                                                }}
                                                className="mx-auto flex items-center justify-center rounded bg-blue-900 px-3 py-2 text-white hover:bg-blue-700"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 📄 Pagination */}
                <Pagination page={page} totalPages={totalPages} perPage={perPage} totalData={totalData} onPageChange={setPage} />
            </div>

            {/* 🔲 Modal QR */}
            <ModalQRCode isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={qrValue} />
        </AppLayout>
    );
}
