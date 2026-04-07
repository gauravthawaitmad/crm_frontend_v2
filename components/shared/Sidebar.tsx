'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  DollarSign,
  Package,
  Contact2,
  UserCog,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Handshake,
  Building2,
} from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

const PARTNERSHIPS_OPEN_KEY = 'sidebar_partnerships_open';
const SCHOOLS_OPEN_KEY = 'sidebar_schools_open';

// Role-based label map
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  co: 'CO',
  manager: 'Manager',
};

function readBool(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === 'true';
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const doLogout = useLogout();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const [partnershipsOpen, setPartnershipsOpen] = useState(true);
  const [schoolsOpen, setSchoolsOpen] = useState(true);

  // Restore from localStorage on mount
  useEffect(() => {
    setPartnershipsOpen(readBool(PARTNERSHIPS_OPEN_KEY, true));
    setSchoolsOpen(readBool(SCHOOLS_OPEN_KEY, true));
  }, []);

  function togglePartnerships() {
    const next = !partnershipsOpen;
    setPartnershipsOpen(next);
    localStorage.setItem(PARTNERSHIPS_OPEN_KEY, String(next));
  }

  function toggleSchools() {
    const next = !schoolsOpen;
    setSchoolsOpen(next);
    localStorage.setItem(SCHOOLS_OPEN_KEY, String(next));
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isPartnershipsActive =
    pathname.startsWith('/lead') ||
    pathname.startsWith('/organization') ||
    pathname.startsWith('/partnerships');

  const isSchoolsActive =
    pathname.startsWith('/lead') || pathname.startsWith('/organization');

  const isAdmin = user?.user_role === 'super_admin' || user?.user_role === 'admin';

  // Initials for avatar
  const initials = user?.user_display_name
    ? user.user_display_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-stone-700 transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #1C1917 0%, #1C1917 60%, #431407 100%)' }}
      >
        {/* Header / logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-1">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent font-bold text-lg">makeadiff</span>
            <span className="text-lg font-bold text-white"> CRM</span>
          </Link>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="rounded-md p-1 text-stone-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">

            {/* Dashboard */}
            <li>
              <Link
                href="/"
                onClick={() => dispatch(setSidebarOpen(false))}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-orange-500 text-white'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                Dashboard
              </Link>
            </li>

            {/* Partnerships group */}
            <li>
              {/* Group header */}
              <button
                onClick={togglePartnerships}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isPartnershipsActive
                    ? 'text-orange-400'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <Handshake className="size-4 shrink-0" />
                <span className="flex-1 text-left">Partnerships</span>
                {partnershipsOpen
                  ? <ChevronDown className="size-3.5 shrink-0" />
                  : <ChevronRight className="size-3.5 shrink-0" />
                }
              </button>

              {/* Partnerships children */}
              {partnershipsOpen && (
                <ul className="mt-1 space-y-0.5 pl-3">

                  {/* Schools sub-group */}
                  <li>
                    <button
                      onClick={toggleSchools}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isSchoolsActive
                          ? 'text-orange-300'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                      )}
                    >
                      <GraduationCap className="size-3.5 shrink-0" />
                      <span className="flex-1 text-left">Schools</span>
                      {schoolsOpen
                        ? <ChevronDown className="size-3 shrink-0" />
                        : <ChevronRight className="size-3 shrink-0" />
                      }
                    </button>

                    {schoolsOpen && (
                      <ul className="mt-0.5 space-y-0.5 pl-4">
                        <li>
                          <Link
                            href="/lead"
                            onClick={() => dispatch(setSidebarOpen(false))}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive('/lead')
                                ? 'bg-orange-500 text-white font-medium'
                                : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                            )}
                          >
                            <Users className="size-3.5 shrink-0" />
                            Leads
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/organization"
                            onClick={() => dispatch(setSidebarOpen(false))}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive('/organization')
                                ? 'bg-orange-500 text-white font-medium'
                                : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                            )}
                          >
                            <Building2 className="size-3.5 shrink-0" />
                            Organizations
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                  {/* Sourcing */}
                  <li>
                    <Link
                      href="/partnerships/sourcing"
                      onClick={() => dispatch(setSidebarOpen(false))}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive('/partnerships/sourcing')
                          ? 'bg-orange-500 text-white font-medium'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                      )}
                    >
                      <Users className="size-3.5 shrink-0" />
                      Sourcing
                    </Link>
                  </li>

                  {/* Funders */}
                  <li>
                    <Link
                      href="/partnerships/funders"
                      onClick={() => dispatch(setSidebarOpen(false))}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive('/partnerships/funders')
                          ? 'bg-orange-500 text-white font-medium'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                      )}
                    >
                      <DollarSign className="size-3.5 shrink-0" />
                      Funders
                    </Link>
                  </li>

                  {/* Vendors */}
                  <li>
                    <Link
                      href="/partnerships/vendors"
                      onClick={() => dispatch(setSidebarOpen(false))}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive('/partnerships/vendors')
                          ? 'bg-orange-500 text-white font-medium'
                          : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                      )}
                    >
                      <Package className="size-3.5 shrink-0" />
                      Vendors
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* POCs */}
            <li>
              <Link
                href="/poc"
                onClick={() => dispatch(setSidebarOpen(false))}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive('/poc')
                    ? 'bg-orange-500 text-white'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <Contact2 className="size-4 shrink-0" />
                POCs
              </Link>
            </li>

            {/* Users (admin only) */}
            {isAdmin && (
              <li>
                <Link
                  href="/user"
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive('/user')
                      ? 'bg-orange-500 text-white'
                      : 'text-stone-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <UserCog className="size-4 shrink-0" />
                  Users
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer — user info + logout */}
        <div className="border-t border-orange-900/40 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            {/* Avatar */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {initials}
            </div>
            {/* Name + role */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.user_display_name ?? 'Unknown'}
              </p>
              <p className="truncate text-xs text-orange-400/70">
                {ROLE_LABELS[user?.user_role ?? ''] ?? user?.user_role ?? ''}
              </p>
            </div>
            {/* Logout */}
            <button
              onClick={doLogout}
              className="rounded-md p-1.5 text-stone-400 hover:bg-white/5 hover:text-orange-400"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
