'use client';

import { Menu } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { NotificationBell } from '@/components/shared/NotificationBell';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();

  const initials = user?.user_display_name
    ? user.user_display_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-6">
      {/* Left — mobile toggle + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right — notification bell + user avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        {/* User avatar + display name */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-foreground sm:block">
            {user?.user_display_name ?? ''}
          </span>
        </div>
      </div>
    </header>
  );
}
