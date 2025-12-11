'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MultiEloChart from '@/components/MultiEloChart';
import { 
  Trophy, 
  X, 
  Check, 
  Search, 
  Activity, 
  Loader2, 
  ChevronRight,
  ListFilter
} from 'lucide-react';

function TeamsContent() {
  const searchParams = useSearchParams();

  // Refs to prevent infinite loops
  const hasFetchedParams = useRef(false);
  
  // Data State
  const [leagues, setLeagues] = useState<Record<string, any[]> | null>(null);
  const [activeTeams, setActiveTeams] = useState<any[]>([]);
  
  // UI State
  const [selectedLeague, setSelectedLeague] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTeams, setLoadingTeams] = useState<Set<string>>(new Set());

  // Helper: Fetch a single team's data
  const fetchTeamData = async (teamName: string) => {
    try {
      const res = await fetch(`/api/teams/elo?name=${encodeURIComponent(teamName)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return { teamName, data };
    } catch (error) {
      console.error(`Error fetching ${teamName}:`, error);
      return null;
    }
  };

  // 1. Initial Load: Fetch Leagues & Process URL Params ONCE
  useEffect(() => {
    // Fetch Leagues
    fetch('/api/teams/all')
      .then(res => res.json())
      .then(data => {
        setLeagues(data);
        const first = Object.keys(data)[0];
        if (first) setSelectedLeague(first);
      });

    // Handle URL Params (Run exactly once)
    if (!hasFetchedParams.current) {
      hasFetchedParams.current = true;
      
      const teamsParam = searchParams.get('teams');
      if (teamsParam) {
        const teamsToLoad = teamsParam.split(',').filter(t => t.trim() !== '');
        
        if (teamsToLoad.length > 0) {
          setLoadingTeams(new Set(teamsToLoad));
          
          Promise.all(teamsToLoad.map(name => fetchTeamData(name)))
            .then((results) => {
              const validResults = results.filter(r => r !== null);
              setActiveTeams(validResults);
            })
            .finally(() => {
              setLoadingTeams(new Set());
            });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount


  // Toggle Logic
  const toggleTeam = async (teamName: string) => {
    // Remove if exists
    if (activeTeams.find(t => t.teamName === teamName)) {
      setActiveTeams(prev => prev.filter(t => t.teamName !== teamName));
      return;
    }

    // Add if new
    setLoadingTeams(prev => new Set(prev).add(teamName));
    const result = await fetchTeamData(teamName);
    
    setLoadingTeams(prev => {
        const next = new Set(prev);
        next.delete(teamName);
        return next;
    });

    if (result) {
      setActiveTeams(prev => [...prev, result]);
    }
  };

  // Filter list logic
  const displayedTeams = leagues && leagues[selectedLeague] 
    ? leagues[selectedLeague].filter((t: any) => 
        t.team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!leagues) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="font-medium">Loading Data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-zinc-50 border-r border-zinc-200 flex flex-col h-full shadow-[2px_0_10px_rgba(0,0,0,0.03)] z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2 font-bold text-zinc-800 text-lg mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Team Selector</span>
          </div>

          <div className="relative group">
             <select 
              className="w-full p-2.5 pl-3 pr-8 rounded-lg border border-zinc-300 bg-zinc-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none transition-shadow"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              {Object.keys(leagues).map(lg => <option key={lg} value={lg}>{lg}</option>)}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* Selected Teams "Chips" Area */}
        {activeTeams.length > 0 && (
          <div className="px-4 py-3 bg-blue-50/40 border-b border-blue-100/50">
            <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Selected Teams ({activeTeams.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
              {activeTeams.map(t => (
                <span 
                  key={t.teamName} 
                  className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-white border border-blue-200 rounded-full text-xs font-medium text-blue-700 shadow-sm animate-in fade-in zoom-in duration-200"
                >
                  {t.teamName}
                  <button 
                    onClick={() => toggleTeam(t.teamName)}
                    className="ml-1 p-0.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search Filter */}
        <div className="p-3 border-b border-zinc-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Team List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {displayedTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400 text-sm">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                No teams found
            </div>
          ) : (
             displayedTeams.map((t: any) => {
                const isActive = activeTeams.some(at => at.teamName === t.team);
                const isLoading = loadingTeams.has(t.team);

                return (
                  <button
                    key={t.id || t.team}
                    onClick={() => toggleTeam(t.team)}
                    disabled={isLoading}
                    className={`group w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 ring-1 ring-blue-500' 
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    } ${isLoading ? 'cursor-wait opacity-80' : ''}`}
                  >
                    <span className="truncate font-medium flex-1">{t.team}</span>
                    
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isActive ? (
                        <Check className="w-3.5 h-3.5 text-blue-100" />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )
             })
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="p-8 h-full flex flex-col">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <ListFilter className="w-6 h-6 text-blue-600" />
                    ELO History Comparison
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                    Select teams from the sidebar to visualize their historical performance.
                </p>
            </header>

            <div className="flex-1 bg-zinc-50 rounded-xl border border-zinc-200 p-1 shadow-inner relative overflow-hidden">
                {activeTeams.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50">
                        <Activity className="w-12 h-12 mb-3 opacity-10" />
                        <p className="font-medium">No teams selected</p>
                        <p className="text-xs opacity-70 mt-1">Choose a league and team to begin</p>
                    </div>
                ) : (
                    <div className="h-full w-full bg-white rounded-lg border border-zinc-100 shadow-sm p-4">
                         <MultiEloChart teamsData={activeTeams} />
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

const TeamsPage = () => {
    return (
        // This boundary resolves the build error by telling Next.js what to show
        // while the client is figuring out the URL parameters.
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Team Data...</div>}>
            <TeamsContent />
        </Suspense>
    );
}

export default TeamsPage;