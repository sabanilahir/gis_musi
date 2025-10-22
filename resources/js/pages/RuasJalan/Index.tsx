import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Index() {
    const { ruas, filters }: any = usePage().props;
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Pilih file .kmz terlebih dahulu');
            return;
        }

        if (!file.name.toLowerCase().endsWith('.kmz')) {
            toast.error('File harus berformat .kmz');
            return;
        }

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
                onError: (errors) => {
                    console.error('Import error:', errors);
                    toast.error(errors.message || 'Gagal mengimpor data');
                },
                onFinish: () => setIsUploading(false),
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Terjadi kesalahan saat upload file');
            setIsUploading(false);
        }
    };

    // === Fungsi pencarian ===
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/ruas-jalan', { search }, { preserveState: true });
    };

    // === Pagination ===
    const handlePageChange = (url: string) => {
        if (!url) return;
        router.visit(url, { preserveState: true });
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

                {/* Form Pencarian */}
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <Input
                        type="text"
                        placeholder="Cari nama ruas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-1/3 dark:bg-gray-800 dark:text-gray-200"
                    />
                    <Button type="submit" className="bg-gray-700 text-white hover:bg-gray-800">
                        Cari
                    </Button>
                </form>

                {/* Table Data */}
                <div className="overflow-x-auto rounded-lg border border-gray-300 shadow dark:border-gray-700">
                    <table className="min-w-full text-sm text-gray-900 dark:text-gray-100">
                        <thead className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <tr>
                                <th className="border-b px-4 py-3">No</th>
                                <th className="border-b px-4 py-3">Nama Ruas</th>
                                <th className="border-b px-4 py-3">Tahun</th>
                                <th className="border-b px-4 py-3">Status</th>
                                <th className="border-b px-4 py-3">Kab/Kota</th>
                                <th className="border-b px-4 py-3">Koordinat Awal</th>
                                <th className="border-b px-4 py-3">Koordinat Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                            {ruas?.data?.length > 0 ? (
                                ruas.data.map((item: any, i: number) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                    >
                                        <td className="px-4 py-2">{i + 1}</td>
                                        <td className="px-4 py-2">{item.Nm_Ruas}</td>
                                        <td className="px-4 py-2">{item.Thn_Data}</td>
                                        <td className="px-4 py-2">{item.Status}</td>
                                        <td className="px-4 py-2">{item.Kab_Kot}</td>
                                        <td className="px-4 py-2">
                                            {item.Koord_X_Aw}, {item.Koord_Y_Aw}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.Koord_X_Ak}, {item.Koord_Y_Ak}
                                        </td>
                                        <td className="px-4 py-2">
                                            <Link href={`/ruas-jalan/${item.id}`} className="text-blue-600 hover:underline">
                                                Lihat di Peta
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-4 text-center text-gray-500 dark:text-gray-400">
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
        </AppLayout>
    );
}
