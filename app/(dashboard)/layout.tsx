'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession } from '@/store/slices/authSlice';
import PageLayout from '@/components/shared/PageLayout';

// Map route prefixes to display titles
const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/lead':         'Leads',
  '/organization': 'Organizations',
  '/poc':          'POCs',
  '/user':         'Users',
  '/profile':      'Profile',
};

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for nested routes
  const match = Object.keys(PAGE_TITLES).find(
    (key) => key !== '/' && pathname.startsWith(key)
  );
  return match ? PAGE_TITLES[match] : 'CRM';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // On mount: restore session from localStorage if Redux state is empty
  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem('auth');
      const userStr = localStorage.getItem('auth_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch(restoreSession({ token, user }));
        } catch {
          // Corrupt localStorage — redirect to login
          router.replace('/login');
        }
      } else {
        // No token — middleware should have caught this, but handle client-side too
        router.replace('/login');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const title = getTitle(pathname);

  return <PageLayout title={title}>{children}</PageLayout>;
}
