import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Index() {
 const { ruas }: any = usePage().props;
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Pilih file .kmz terlebih dahulu');
      return;
    }

    // Validasi tipe file
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
          // Reset input file
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        onError: (errors) => {
          console.error('Import error:', errors);
          toast.error(errors.message || 'Gagal mengimpor data');
        },
        onFinish: () => setIsUploading(false)
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Terjadi kesalahan saat upload file');
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <Head title="Data Ruas Jalan" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Data Ruas Jalan</h1>
        </div>

         <form onSubmit={handleImport} className="flex items-center gap-3">
        <Input
          type="file"
          accept=".kmz"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-1/3"
          disabled={isUploading}
        />
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isUploading}
        >
          {isUploading ? 'Mengimport...' : 'Import KMZ'}
        </Button>
      </form>

        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border-b">No</th>
                <th className="px-4 py-2 border-b">Nama Ruas</th>
                <th className="px-4 py-2 border-b">Tahun</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Kab/Kota</th>
                <th className="px-4 py-2 border-b">Koordinat Awal</th>
                <th className="px-4 py-2 border-b">Koordinat Akhir</th>
              </tr>
            </thead>
            <tbody>
              {ruas?.data?.length > 0 ? (
                ruas.data.map((item: any, i: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
