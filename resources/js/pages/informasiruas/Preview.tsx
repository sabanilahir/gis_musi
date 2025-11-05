import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  stats: {
    ruas: number;
    jembatan: number;
    titik: number;
    patok: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard-user' },
];

export default function DashboardUser({ stats }: Props) {
  const cards = [
    { label: 'Jumlah Ruas Jalan', value: stats.ruas, color: 'bg-blue-600' },
    { label: 'Jumlah Jembatan', value: stats.jembatan, color: 'bg-emerald-600' },
    { label: 'Jumlah Titik', value: stats.titik, color: 'bg-indigo-600' },
    { label: 'Jumlah Patok', value: stats.patok, color: 'bg-pink-600' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard User" />
      <div className="flex flex-col gap-6 p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Selamat Datang di Dashboard User
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Informasi statistik data jalan dan jembatan di sistem.
        </p>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((item, index) => (
            <Card
              key={index}
              className={`${item.color} text-white shadow-md rounded-lg overflow-hidden`}
            >
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2 text-3xl font-bold">
                {item.value}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
