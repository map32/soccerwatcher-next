'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Shield, User, ChevronRight } from 'lucide-react';

interface SearchResult {
  type: 'team' | 'player';
  label: string;
  subLabel: string;
  url: string;
  icon: string;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/global-search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // 2. Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Navigation Handler
  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery(''); // Clear input
    router.push(url);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-4">
      {/* Input Field */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all"
          placeholder="Search players or teams..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {/* Keyboard Shortcut Hint (Optional) */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-zinc-400 text-xs border border-zinc-200 rounded px-1.5 py-0.5">⌘K</span>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
              Results
            </div>
            {results.map((result, index) => (
              <button
                key={`${result.type}-${index}`}
                onClick={() => handleSelect(result.url)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors group border-b border-zinc-50 last:border-0"
              >
                {/* Icon Box */}
                <div className={`p-2 rounded-md ${
                    result.type === 'team' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {result.type === 'team' ? <Shield size={16} /> : <User size={16} />}
                </div>

                {/* Text Info */}
                <div className="flex-1">
                  <div className="font-medium text-zinc-800 group-hover:text-blue-700">
                    {result.label}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {result.type === 'team' ? 'Team' : result.subLabel}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-zinc-100 p-4 text-center z-50">
            <p className="text-sm text-zinc-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}