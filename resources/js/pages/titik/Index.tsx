import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';

interface Titik {
    id: number;
    nm_ruas: string;
    nm_titik: string;
    tipe: 'Awal' | 'Akhir';
}

interface Ruas {
    id: number;
    nm_ruas: string;
}

interface PageProps {
    titik: Titik[];
    ruas: Ruas[];
}

export default function Index() {
    const { titik = [], ruas = [] } = usePage<PageProps>().props;

    // FILTER STATE
    const [selectedRuas, setSelectedRuas] = useState<number | ''>('');
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<Titik[]>(titik);

    // SORT & PAGINASI
    const [sortColumn, setSortColumn] = useState<keyof Titik | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    // MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModal, setIsAddModal] = useState(false);
    const [selectedTitik, setSelectedTitik] = useState<Titik | null>(null);
    const [editNamaRuas, setEditNamaRuas] = useState('');
    const [editTipe, setEditTipe] = useState<'Awal' | 'Akhir'>('Awal');
    const [editNamaTitik, setEditNamaTitik] = useState('');

    // KONFIRMASI DELETE
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteData, setDeleteData] = useState<{ id: number; tipe: string } | null>(null);

    // ====== FILTER + SORT ======
    useEffect(() => {
        const doFilter = debounce(() => {
            let result = [...titik];

            if (selectedRuas) result = result.filter((t) => t.id === selectedRuas);

            if (search.trim()) {
                const s = search.toLowerCase();
                result = result.filter(
                    (t) => t.nm_ruas.toLowerCase().includes(s) || t.nm_titik.toLowerCase().includes(s) || t.tipe.toLowerCase().includes(s),
                );
            }

            if (sortColumn) {
                result.sort((a, b) => {
                    const A = (a[sortColumn] ?? '').toString().toLowerCase();
                    const B = (b[sortColumn] ?? '').toString().toLowerCase();
                    if (A < B) return sortOrder === 'asc' ? -1 : 1;
                    if (A > B) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            setFiltered(result);
            setPage(1);
        }, 300);

        doFilter();
        return () => doFilter.cancel();
    }, [titik, selectedRuas, search, sortColumn, sortOrder]);

    // PAGINASI
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filtered.length / perPage);

    const handleSort = (col: keyof Titik) => {
        if (sortColumn === col) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortOrder('asc');
        }
    };

    const sortIcon = (col: keyof Titik) => {
        if (sortColumn !== col) return '↕';
        return sortOrder === 'asc' ? '▲' : '▼';
    };

    // === DELETE ===
    const handleDeleteClick = (id: number, tipe: string) => {
        setDeleteData({ id, tipe });
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (deleteData) {
            router.delete(route('titik.destroy', { id: deleteData.id, tipe: deleteData.tipe }), {
                onFinish: () => setIsConfirmOpen(false),
            });
        }
    };

    // === EDIT & TAMBAH ===
    const openEditModal = (t: Titik) => {
        setSelectedTitik(t);
        setEditNamaRuas(t.nm_ruas);
        setEditNamaTitik(t.nm_titik);
        setEditTipe(t.tipe);
        setIsAddModal(false);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedTitik(null);
        setEditNamaRuas('');
        setEditNamaTitik('');
        setEditTipe('Awal');
        setIsAddModal(true);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (isAddModal) {
            router.post(route('titik.save', 0), {
                ruas_id: selectedRuas,
                nm_titik: editNamaTitik,
                tipe: editTipe,
                mode: true,
            });
        } else if (selectedTitik) {
            router.post(route('titik.save', selectedTitik.id), {
                ruas_id: selectedRuas || selectedTitik.id,
                nm_titik: editNamaTitik,
                tipe: editTipe,
                mode: false,
            });
        }
        setIsModalOpen(false);
    };

    // ================= UI =================
    return (
        <AppLayout>
            <Head title="Data Titik Ruas" />

            <div className="p-6 text-gray-800 dark:text-gray-100">
                {/* HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">📍 Data Titik (Awal & Akhir)</h1>
                    <div className="flex gap-2">
                        <a href={route('titik.index')} className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600">
                            Refresh
                        </a>
                        <button onClick={openAddModal} className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                            + Tambah Titik
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div>
                        <label className="mr-2 text-sm font-semibold">Pilih Ruas:</label>
                        <select
                            className="rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            value={selectedRuas}
                            onChange={(e) => setSelectedRuas(e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">Semua Ruas</option>
                            {ruas.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.nm_ruas}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mr-2 text-sm font-semibold">Tampilkan:</label>
                        <select
                            className="rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / halaman
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Cari ruas / titik..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                {/* TABEL */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">No</th>
                                {['id', 'nm_ruas', 'nm_titik', 'tipe'].map((key) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key as keyof Titik)}
                                        className="cursor-pointer px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase hover:text-blue-600 dark:text-gray-300"
                                    >
                                        <div className="flex items-center gap-1">
                                            {key === 'nm_titik' ? 'Nama Titik' : key === 'nm_ruas' ? 'Nama Ruas' : key}
                                            <span className="text-[10px]">{sortIcon(key as keyof Titik)}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((t, i) => (
                                    <tr key={`${t.id}-${t.tipe}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="border px-4 py-2 dark:border-gray-700">{(page - 1) * perPage + i + 1}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{t.id}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{t.nm_ruas}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{t.nm_titik}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{t.tipe}</td>
                                        <td className="space-x-2 border px-4 py-2 text-center dark:border-gray-700">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(t.id, t.tipe)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data titik
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} perPage={perPage} totalData={filtered.length} onPageChange={setPage} />
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">{isAddModal ? 'Tambah Titik' : 'Edit Titik'}</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Nama Ruas</label>
                            <select
                                value={selectedRuas || (selectedTitik ? selectedTitik.id : '')}
                                onChange={(e) => setSelectedRuas(Number(e.target.value))}
                                className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">Pilih ruas...</option>
                                {ruas.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nm_ruas}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Nama Titik</label>
                            <input
                                type="text"
                                value={editNamaTitik}
                                onChange={(e) => setEditNamaTitik(e.target.value)}
                                className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Tipe Titik</label>
                            <select
                                value={editTipe}
                                onChange={(e) => setEditTipe(e.target.value as 'Awal' | 'Akhir')}
                                className="w-full rounded border p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="Awal">Awal</option>
                                <option value="Akhir">Akhir</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="rounded bg-gray-500 px-4 py-2 text-white">
                                Batal
                            </button>
                            <button onClick={handleSave} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Hapus Titik?"
                message="Data titik yang dihapus tidak dapat dikembalikan."
            />
        </AppLayout>
    );
}
