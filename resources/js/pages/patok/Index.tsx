import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import React, { useEffect, useState } from 'react';

interface Patok {
    id: number;
    nm_ruas: string;
    kd_patok?: string | null;
}

interface Ruas {
    id: number;
    nm_ruas: string;
    kd_patok?: string | null;
}

interface PageProps {
    patokList: Patok[];
    ruasList: Ruas[];
}

export default function Index() {
    const { patokList = [], ruasList = [] } = usePage<PageProps>().props;

    // FILTER + PAGINASI
    const [selectedRuas, setSelectedRuas] = useState<number | ''>('');
    const [search, setSearch] = useState('');
    const [filteredPatok, setFilteredPatok] = useState<Patok[]>(patokList);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    // SORT
    const [sortColumn, setSortColumn] = useState<keyof Patok | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModal, setIsAddModal] = useState(false);
    const [selectedPatok, setSelectedPatok] = useState<Patok | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editNamaRuas, setEditNamaRuas] = useState(''); // ✅ Tambahan penting

    // ======== FILTERING + SORT ========
    useEffect(() => {
        const doFilter = debounce(() => {
            let result = [...patokList];

            if (selectedRuas) {
                result = result.filter((p) => p.id === selectedRuas);
            }

            if (search.trim()) {
                const lower = search.toLowerCase();
                result = result.filter((p) => p.nm_ruas.toLowerCase().includes(lower) || (p.kd_patok || '').toLowerCase().includes(lower));
            }

            if (sortColumn) {
                result.sort((a, b) => {
                    const valA = (a[sortColumn] ?? '').toString().toLowerCase();
                    const valB = (b[sortColumn] ?? '').toString().toLowerCase();
                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            setFilteredPatok(result);
            setPage(1);
        }, 300);

        doFilter();
        return () => doFilter.cancel();
    }, [patokList, selectedRuas, search, sortColumn, sortOrder]);

    // PAGINASI
    const paginatedData = filteredPatok.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filteredPatok.length / perPage);

    // SORT HANDLER
    const handleSort = (column: keyof Patok) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    // CRUD
    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus patok ini?')) {
            router.delete(route('patok.destroy', id));
        }
    };

    const openEditModal = (patok: Patok) => {
        setSelectedPatok(patok);
        setEditValue(patok.kd_patok || '');
        setEditNamaRuas(patok.nm_ruas || '');
        setIsAddModal(false);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedPatok(null);
        setEditValue('');
        setEditNamaRuas('');
        setIsAddModal(true);
        setIsModalOpen(true);
    };

    // SORT ICON
    const sortIcon = (column: keyof Patok) => {
        if (sortColumn !== column) return '↕';
        return sortOrder === 'asc' ? '▲' : '▼';
    };

    // =================== UI ===================
    return (
        <AppLayout>
            <Head title="Data Patok" />

            <div className="p-6 text-gray-800 dark:text-gray-100">
                {/* HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">📍 Data Patok</h1>
                    <div className="flex gap-2">
                        <a href={route('patok.index')} className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600">
                            Refresh
                        </a>
                        <button onClick={openAddModal} className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                            + Tambah Patok
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
                            {ruasList.map((r) => (
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

                    <div>
                        <input
                            type="text"
                            placeholder="Cari ruas jalan atau patok..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64 rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* TABEL */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                    No
                                </th>
                                {['id', 'nm_ruas', 'kd_patok'].map((key) => (
                                    <th
                                        key={key}
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase select-none hover:text-blue-600 dark:text-gray-300"
                                        onClick={() => handleSort(key as keyof Patok)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {key === 'id' ? 'ID Ruas' : key === 'nm_ruas' ? 'Nama Ruas' : 'Nama Patok'}
                                            <span className="text-[10px] opacity-70">{sortIcon(key as keyof Patok)}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((p, i) => (
                                    <tr key={p.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="border px-4 py-2 dark:border-gray-700">{(page - 1) * perPage + i + 1}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{p.id}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{p.nm_ruas}</td>
                                        <td className="border px-4 py-2 dark:border-gray-700">{p.kd_patok || '-'}</td>
                                        <td className="space-x-3 border px-4 py-2 text-center dark:border-gray-700">
                                            <button
                                                onClick={() => p.kd_patok && openEditModal(p)}
                                                disabled={!p.kd_patok}
                                                className={`${
                                                    p.kd_patok
                                                        ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                                        : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                                                }`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => p.kd_patok && handleDelete(p.id)}
                                                disabled={!p.kd_patok}
                                                className={`${
                                                    p.kd_patok
                                                        ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                                        : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                                                }`}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="border py-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                        Tidak ada data patok
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`rounded border px-3 py-1 transition ${
                                    page === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ============== MODAL TAMBAH / EDIT ============== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>

                        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
                            {isAddModal ? '➕ Tambah Patok Baru' : '✏️ Edit Nama Patok'}
                        </h2>

                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                                    {/* Tombol X */}
                                    <button
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        ✕
                                    </button>

                                    {/* Judul */}
                                    <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {isAddModal ? '➕ Tambah Patok Baru' : '✏️ Edit Nama Patok'}
                                    </h2>

                                    {/* Form */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            // --- MODE TAMBAH ---
                                            if (isAddModal) {
                                                if (!selectedRuas) {
                                                    alert('Pilih ruas dulu sebelum menyimpan!');
                                                    return;
                                                }

                                                router.put(
                                                    route('patok.updatePatok', selectedRuas),
                                                    { kd_patok: editValue },
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            // alert('Patok baru berhasil ditambahkan!');
                                                            setIsModalOpen(false);
                                                            setEditValue('');
                                                            setSelectedRuas('');
                                                            router.reload({ only: ['patokList', 'ruasList'] });
                                                        },
                                                        onError: (errors) => {
                                                            console.error(errors);
                                                            // alert('Gagal menambah patok.');
                                                        },
                                                    },
                                                );
                                            }

                                            // --- MODE EDIT ---
                                            else {
                                                if (!selectedPatok) return;

                                                router.put(
                                                    route('patok.update', selectedPatok.id),
                                                    { kd_patok: editValue },
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            // alert('Nama patok berhasil diperbarui!');
                                                            setIsModalOpen(false);
                                                            setEditValue('');
                                                            router.reload({ only: ['patokList'] });
                                                        },
                                                        onError: (errors) => {
                                                            console.error(errors);
                                                            // alert('Gagal memperbarui patok.');
                                                        },
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        {/* Dropdown Ruas (khusus tambah) */}
                                        {isAddModal ? (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Pilih Ruas</label>
                                                <select
                                                    value={selectedRuas}
                                                    onChange={(e) => setSelectedRuas(Number(e.target.value))}
                                                    className="w-full rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    required
                                                >
                                                    <option value="">-- Pilih Ruas --</option>
                                                    {ruasList
                                                        .filter((r) => !r.kd_patok) // hanya ruas tanpa patok
                                                        .map((r) => (
                                                            <option key={r.id} value={r.id}>
                                                                {r.nm_ruas}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        ) : (
                                            // Field nama ruas (hanya tampil di mode edit)
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Nama Ruas</label>
                                                <input
                                                    type="text"
                                                    value={editNamaRuas || ''}
                                                    disabled
                                                    className="w-full rounded border bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                />
                                            </div>
                                        )}

                                        {/* Field Nama Patok */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Nama Patok</label>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                required
                                            />
                                        </div>

                                        {/* Tombol aksi */}
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                Batal
                                            </button>
                                            <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                                Simpan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
