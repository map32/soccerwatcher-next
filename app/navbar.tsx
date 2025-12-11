// components/Navbar.tsx
import Link from 'next/link';
import GlobalSearch from '@/components/GlobalSearch'; // Import here

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold tracking-tighter">
        SOCCER<span className="text-blue-600">WATCHER</span>
      </Link>
      <div className="flex gap-6 text-sm font-medium items-center">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <Link href="/players" className="hover:text-blue-600 transition">Players</Link>
        <Link href="/teams" className="hover:text-blue-600 transition">Teams</Link>
        <Link href="/about" className="hover:text-blue-600 transition">About</Link>
        <div className="hidden md:flex flex-1 justify-center">
            <GlobalSearch />
        </div>
      </div>
    </nav>
  );
}