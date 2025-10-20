import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
  const { auth, setting } = usePage<SharedData>().props;

  const primaryColor = setting?.warna || '#1d4ed8'; // biru sungai
  const primaryForeground = '#ffffff';

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
    document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);
  }, [primaryColor, primaryForeground]);

  return (
    <>
      <Head title="GIS Sungai Musi" />
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
        {/* Background decorative */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/wave.svg')] bg-center bg-cover" />

        <div className="relative z-10 space-y-8 px-4 max-w-3xl">
          {/* Logo */}

          {/* <img
            src="@/components/app-logo-icon"
            alt="Logo GIS Sungai Musi"
            className="mx-auto w-28 h-auto drop-shadow-lg"
          /> */}
                    <div className="flex justify-center items-center">
                <AppLogoIcon className="w-40 h-auto" />
            </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--primary)] drop-shadow-sm">
            GIS Musi Rawas
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto">
            Sistem Informasi Geografis untuk pengelolaan dan pemetaan wilayah Sungai Musi,
            membantu analisis data spasial dan pengambilan keputusan berbasis lokasi.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {auth.user ? (
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition shadow-md hover:-translate-y-0.5"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-3 rounded-lg border border-blue-300 bg-white font-medium text-blue-700 hover:bg-blue-50 transition shadow-sm hover:-translate-y-0.5"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition shadow-md hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500 dark:text-gray-400 pt-6">
            © {new Date().getFullYear()} GIS Sungai Musi. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </>
  );
}
