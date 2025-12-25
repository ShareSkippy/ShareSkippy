'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import logo from '@/app/icon.png';
import { useUser } from '@/components/providers/SupabaseUserProvider';
import { NotificationBadge } from '@/components/NotificationBadge';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import config from '@/config';

const navigationItems = [
  {
    href: '/community',
    label: 'Community',
  },
  {
    href: '/share-availability',
    label: 'Share Availability',
  },
  {
    href: '/messages',
    label: 'Messages',
    hasNotifications: true, // Flag to show this item has notifications
  },
  {
    href: '/meetings',
    label: 'Meetings',
  },
  {
    href: '/my-dogs',
    label: 'My Dogs',
  },
  {
    href: '/profile',
    label: 'Profile',
  },
];

const LoggedInNav = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useUser();

  // Get unread message counts
  const { totalUnread, isLoading } = useUnreadMessages(user);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [searchParams]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-indigo-600 text-white">
      <nav
        className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Logo - responsive sizing */}
        <div className="flex xl:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} home`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-6 sm:w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
              unoptimized
            />
            <span className="font-extrabold text-base sm:text-lg text-white">{config.appName}</span>
          </Link>
        </div>

        {/* Burger button to open menu on small and medium screens */}
        <div className="flex xl:hidden items-center gap-4">
          {/* Messages Icon (Mobile) - Only show if user is logged in */}
          {user && (
            <Link
              href="/messages"
              className="relative p-2 hover:bg-indigo-700 rounded-lg transition-colors"
              title="Messages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              {!isLoading && <NotificationBadge count={totalUnread} />}
            </Link>
          )}

          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Navigation items on extra large screens */}
        <div className="hidden xl:flex xl:justify-center xl:gap-6 xl:items-center flex-1">
          {navigationItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`relative px-2 py-2 rounded-lg transition-colors text-white hover:text-indigo-100 text-sm whitespace-nowrap ${
                pathname === item.href ? 'bg-white/20 text-white' : ''
              }`}
              title={item.label}
            >
              {item.label}
              {/* Show notification badge for Messages */}
              {item.hasNotifications && !isLoading && (
                <NotificationBadge count={totalUnread} className="absolute -top-1 -right-1" />
              )}
            </Link>
          ))}
        </div>

        {/* Sign out button on extra large screens */}
        <div className="hidden xl:flex xl:justify-end xl:flex-1">
          <button
            onClick={handleSignOut}
            className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-indigo-600"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`relative z-50 ${isOpen ? '' : 'hidden'}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto bg-indigo-600 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Logo on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0"
              title={`${config.appName} home`}
              href="/"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-6 sm:w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
                unoptimized
              />
              <span className="font-extrabold text-base sm:text-lg text-white">
                {config.appName}
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation items on small screens */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {navigationItems.map((item) => (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`relative w-full px-3 py-2 rounded-lg transition-colors text-white hover:text-indigo-100 flex items-center justify-between ${
                      pathname === item.href ? 'bg-white/20 text-white' : ''
                    }`}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                    {/* Show unread count for Messages in mobile menu */}
                    {item.hasNotifications && !isLoading && totalUnread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold min-w-[24px] text-center">
                        {totalUnread}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* Sign out button on small screens */}
            <div className="flex flex-col">
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-sm w-full text-white border-white hover:bg-white hover:text-indigo-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoggedInNav;
