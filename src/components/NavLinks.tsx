'use client';

/**
 * NavLinks — thin client component for active-link highlighting.
 * Uses usePathname, which requires a client context.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/preparedness', label: 'Preparedness' },
  { href: '/data-limitations', label: 'Data & Limitations' },
] as const;

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-row gap-1 overflow-x-auto" role="list">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
