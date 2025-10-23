import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Index() {
    const { ruas, filters }: any = usePage().props;
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [loading, setLoading] = useState(false);

    // ======== STATE MODAL EDIT ========
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedRuas, setSelectedRuas] = useState<any>(null);
    // const [editValues, setEditValues] = useState({
    //     Nm_Ruas: '',
    //     Thn_Data: '',
    //     Status: '',
    //     Kab_Kot: '',
    // });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRuas, setSelectedRuas] = useState<any>(null);
    const [editValues, setEditValues] = useState<any>({});

    const editableFields = [
        'Kl_Dat_Das', 'Nm_Ruas', 'Thn_Data', 'Status', 'Fungsi', 'Mendukung', 'Ura_Dukung',
        'Kd_Bd_PU', 'Kd_Jns_Inf', 'Kd_Inf', 'Propinsi', 'Kab_Kot', 'Kecamatan', 'Desa_Kel',
        'Tk_Ruas_Aw', 'Tk_Ruas_Ak', 'Kd_Patok', 'Km_Awal', 'Km_Akhir', 'Nm_Lintas', 'Kon_Baik',
        'Kon_Sdg', 'Kon_Rgn', 'Kon_Rusak', 'Kon_Mntp', 'Kon_T_Mntp', 'Panjang', 'Lbr_Keras',
        'LHRT', 'VCR', 'Tipe_Jln', 'MST', 'Tipe_Keras', 'Tanah_Kri', 'Macadam', 'Aspal',
        'Rigid', 'Thn_Pen_Ak', 'Jns_Pen', 'Koord_X_Aw', 'Koord_Y_Aw', 'Koord_X_Ak', 'Koord_Y_Ak',
        'REMARK', 'Shape_Leng', 'koordinat_full',
    ];

    // ======== IMPORT FILE ========
    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Pilih file .kmz terlebih dahulu');
        if (!file.name.toLowerCase().endsWith('.kmz')) return toast.error('File harus berformat .kmz');

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await router.post('/ruas-jalan/import', formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Import KMZ berhasil!');
                    setFile(null);
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                },
                onError: (errors) => toast.error(errors.message || 'Gagal mengimpor data'),
                onFinish: () => setIsUploading(false),
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat upload file');
            setIsUploading(false);
        }
    };

    // ======== PENCARIAN REALTIME ========
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setLoading(true);
            router.get(
                '/ruas-jalan',
                { search },
                {
                    preserveState: true,
                    replace: true,
                    only: ['ruas'],
                    onFinish: () => setLoading(false),
                },
            );
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    // ======== PAGINATION ========
    const handlePageChange = (url: string) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
    };

    // ======== OPEN MODAL EDIT ========
    // const openEditModal = (item: any) => {
    //     setSelectedRuas(item);
    //     setEditValues({
    //         Nm_Ruas: item.Nm_Ruas || '',
    //         Thn_Data: item.Thn_Data || '',
    //         Status: item.Status || '',
    //         Kab_Kot: item.Kab_Kot || '',
    //     });
    //     setIsModalOpen(true);
    // };
const openEditModal = (item: any) => {
        setSelectedRuas(item);
        const values: any = {};
        editableFields.forEach((field) => (values[field] = item[field] || ''));
        setEditValues(values);
        setIsModalOpen(true);
    };
    // ======== SIMPAN PERUBAHAN ========
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRuas) return;

        router.put(
            `/ruas-jalan/${selectedRuas.id}`,
            { ...editValues },
            {
                onSuccess: () => {
                    toast.success('Data berhasil diperbarui!');
                    setIsModalOpen(false);
                    setSelectedRuas(null);
                },
                onError: () => toast.error('Gagal memperbarui data'),
            },
        );
    };
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortedData = React.useMemo(() => {
        if (!ruas?.data) return [];
        if (!sortColumn) return ruas.data;

        return [...ruas.data].sort((a, b) => {
            const aVal = a[sortColumn] ?? '';
            const bVal = b[sortColumn] ?? '';

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [ruas.data, sortColumn, sortDirection]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (column: string) => {
        if (sortColumn !== column) return '↕';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get(route('ruas-jalan.index'), { ...filters, per_page: value, search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Data Ruas Jalan" />

            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Data Ruas Jalan</h1>
                </div>

                {/* Form Upload */}
                <form onSubmit={handleImport} className="flex items-center gap-3">
                    <Input
                        type="file"
                        accept=".kmz"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-1/3 dark:bg-gray-800 dark:text-gray-200"
                        disabled={isUploading}
                    />
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isUploading}>
                        {isUploading ? 'Mengimport...' : 'Import KMZ'}
                    </Button>
                </form>

                {/* Pencarian */}
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    {/* Kolom pencarian */}
                    <div className="flex items-center">
                        <select
                            value={perPage}
                            onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100"
                        >
                            <option value={10}>Tampilkan 10 / halaman</option>
                            <option value={25}>Tampilkan 25 / halaman</option>
                            <option value={50}>Tampilkan 50 / halaman</option>
                            <option value={100}>Tampilkan 100 / halaman</option>
                        </select>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ruas jalan..."
                            className="ml-3 w-64 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                    No
                                </th>
                                {[
                                    { key: 'Nm_Ruas', label: 'Nama' },
                                    { key: 'Panjang', label: 'Panjang (KM)' },
                                    { key: 'Lbr_Keras', label: 'Lebar (M)' },
                                    { key: 'Kon_Baik', label: 'Kondisi' },
                                    { key: 'Status', label: 'Sistem' },
                                    { key: 'Fungsi', label: 'Peran' },
                                    { key: 'Tk_Ruas_Ak', label: 'Kelas' },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase select-none hover:text-blue-600 dark:text-gray-300"
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            <span className="text-[10px] opacity-70">{renderSortIcon(col.key)}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {sortedData.length > 0 ? (
                                sortedData.map((item: any, i: number) => (
                                    <tr
                                        key={item.id}
                                        className={`transition-colors duration-150 ${
                                            i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                                        } hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    >
                                        {/* Nomor urut */}
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">
                                            {i + 1 + (ruas.current_page - 1) * ruas.per_page}
                                        </td>

                                        <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{item.Nm_Ruas}</td>
                                        <td className="px-6 py-3 text-sm">{item.Panjang || '-'}</td>
                                        <td className="px-6 py-3 text-sm">{item.Lbr_Keras || '-'}</td>
                                        <td className="px-6 py-3 text-sm">{item.Kon_Baik || item.Kon_Sdg || item.Kon_Rusak || '-'}</td>
                                        <td className="px-6 py-3 text-sm">{item.Status || '-'}</td>
                                        <td className="px-6 py-3 text-sm">{item.Fungsi || '-'}</td>
                                        <td className="px-6 py-3 text-sm">{item.Tk_Ruas_Ak || '-'}</td>

                                        <td className="px-6 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={`/ruas-jalan/${item.id}`}
                                                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                                >
                                                    Lihat Map
                                                </Link>
                                                <Button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {ruas?.links?.length > 0 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {ruas.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                onClick={() => handlePageChange(link.url)}
                                disabled={!link.url}
                                className={`px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ===== MODAL EDIT ===== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                        <h2 className="mb-4 text-xl font-bold">Edit Data Ruas Jalan</h2>
                        <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-3">
                            {editableFields.map((field) => (
                                <div key={field}>
                                    <label className="text-sm font-semibold">{field}</label>
                                    <Input
                                        value={editValues[field] || ''}
                                        onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <div className="col-span-2 mt-4 flex justify-end gap-3">
                                <Button type="button" className="bg-gray-500 text-white hover:bg-gray-600" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
