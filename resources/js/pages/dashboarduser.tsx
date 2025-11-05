import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

// ✅ Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

// ✅ Data ringkasan utama
const summaryData = [
  { label: 'Jumlah Ruas', value: 124, color: '#3b82f6' },
  { label: 'Jumlah Jembatan', value: 48, color: '#22c55e' },
  { label: 'Jumlah Titik', value: 932, color: '#f59e0b' },
  { label: 'Jumlah Patok', value: 276, color: '#ef4444' },
];

// ✅ Data untuk grafik batang
const barData = [
  { name: 'Ruas', total: 124 },
  { name: 'Jembatan', total: 48 },
  { name: 'Titik', total: 932 },
  { name: 'Patok', total: 276 },
];

// ✅ Data untuk pie chart
const pieData = [
  { name: 'Ruas', value: 124, color: '#3b82f6' },
  { name: 'Jembatan', value: 48, color: '#22c55e' },
  { name: 'Titik', value: 932, color: '#f59e0b' },
  { name: 'Patok', value: 276, color: '#ef4444' },
];

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 p-4">
        {/* === RINGKASAN JUMLAH === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryData.map((item, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <CardHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4">
                <p className="text-3xl font-bold" style={{ color: item.color }}>
                  {item.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* === GRAFIK === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grafik Batang */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Statistik Data Infrastruktur
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={summaryData[index].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Proporsi Infrastruktur
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
