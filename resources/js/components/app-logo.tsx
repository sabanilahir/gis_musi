import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
  const setting = usePage().props.setting as {
    nama_app?: string;
    logo?: string;
  } | null;

  const defaultAppName = 'Laravel Starter Kit';
  const defaultLogo = '';

  const appName = setting?.nama_app || defaultAppName;
  const logo = setting?.logo || defaultLogo;

  return (
    <div className="flex items-center gap-2">
      {logo ? (
        <img
          src={`/storage/${logo}`}
          alt="Logo"
          className="w-10 rounded-md object-contain"
        />
        // 1.375rem
      ) : (
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
          <AppLogoIcon className="m-96 fill-current text-white dark:text-black" />
        </div>
        )}

      <div className="grid flex-1 text-center text-sm">
        {/* <span className="mb-0.5 truncate leading-none font-semibold"> */}
        <span className="mb-0.5 truncate leading-none font-semibold">
            Musi Rawas
          {/* {appName} */}
        </span>
      </div>
    </div>
  );
}
