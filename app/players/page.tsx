'use client'
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Search, Square, CheckSquare, X, Activity, Loader2, Zap } from 'lucide-react';
// Import these types if you want strict typing, otherwise 'string | number' works
// --- 1. TYPE DEFINITIONS ---

type Position = 'FW' | 'AM' | 'MF' | 'CB' | 'FB' | 'GK';
const POSITIONS: Position[] = ['FW', 'AM', 'MF', 'CB', 'FB', 'GK'];

// Structure for the specific stat object you described
interface StatItem {
  value: string | number | null;
  percentile: string | number | null;
}

// Full Player Details from /api/players
interface PlayerDetails {
  player_id: string;
  name: string;
  position: string; // API returns string here ("CB")
  stats: Record<string, StatItem>;
}

// Search Result from /api/players/search
interface PlayerSearchRes {
  id: string;
  player: string;
  position: string[]; // API returns array here (["FB"])
}

// Trending Result from /api/trending
interface TrendingRes {
  id: string;
  player: string;
  url: string;
  position: string;
}

// --- 2. API FUNCTIONS ---

const API_BASE = ''; // Add your domain if needed

const searchPlayersAPI = async (query: string): Promise<PlayerSearchRes[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/players/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchPlayerDetailsAPI = async (id: string, position: string): Promise<PlayerDetails | null> => {
  try {
    // API requires both ID and Position
    const res = await fetch(`${API_BASE}/api/players?id=${id}&position=${position}`);
    if (!res.ok) throw new Error('Details failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchTrendingAPI = async (): Promise<TrendingRes[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    if (!res.ok) throw new Error('Trending failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Helper to handle the API's mixed position formats (Array vs String)
const normalizePosition = (posInput: string | string[] | undefined): string => {
  if (Array.isArray(posInput) && posInput.length > 0) return posInput[0];
  if (typeof posInput === 'string') return posInput;
  return '';
};

// Inside PlayerPage component
import { useSearchParams } from 'next/navigation';

const PlayerContent: React.FC = () => {
  // --- STATE ---
  const [activePosition, setActivePosition] = useState<Position>('FW');

  // Store selections by position bucket
  const [selections, setSelections] = useState<Record<string, PlayerDetails[]>>({
    FW: [], AM: [], MF: [], CB: [], FB: [], GK: []
  });

  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PlayerSearchRes[]>([]);
  const [trending, setTrending] = useState<TrendingRes[]>([]);
  
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const pos = searchParams.get('position');
  const name = searchParams.get('player');

  useEffect(() => {
    if (id && pos && name) {
        handleSelectPlayer(id, name, pos)
    }
  }, [id, pos, name]);

  // --- EFFECTS ---

  // Load Trending on mount
  useEffect(() => {
    fetchTrendingAPI().then(data => setTrending(data));
  }, []);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchPlayersAPI(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // --- HANDLERS ---

  const handleSelectPlayer = async (id: string, name: string, rawPosition?: string | string[]) => {
    setIsLoadingDetails(true);
    // 1. Determine Position for the API Call
    // Trending doesn't send position, Search sends array. 
    // If missing, we assume activePosition as a fallback.
    let targetPos = normalizePosition(rawPosition);
    if (!targetPos) targetPos = activePosition;

    // 2. Fetch Details
    const details = await fetchPlayerDetailsAPI(id, targetPos);
    setIsLoadingDetails(false);

    if (!details) return;

    // 3. Handle Tab Switching
    // We trust the 'position' string from the Details API as the source of truth
    const finalPos = details.position; 
    
    // Check if it's a valid main position before switching
    if (finalPos !== activePosition && POSITIONS.includes(finalPos as Position)) {
      setActivePosition(finalPos as Position);
    }

    // 4. Update Selection State
    setSelections(prev => {
      // Use the returned position to find the correct bucket
      // Fallback to activePosition if API returns weird position string
      const bucketKey = POSITIONS.includes(finalPos as Position) ? finalPos : activePosition;
      const bucket = prev[bucketKey] || [];
      
      const exists = bucket.find(p => p.player_id === details.player_id);

      if (exists) {
        return { ...prev, [bucketKey]: bucket.filter(p => p.player_id !== details.player_id) };
      } else {
        return { ...prev, [bucketKey]: [...bucket, details] };
      }
    });

    setQuery('');
  };

  const removeSelection = (playerId: string) => {
    setSelections(prev => ({
      ...prev,
      [activePosition]: prev[activePosition].filter(p => p.player_id !== playerId)
    }));
  };

  // --- CHART DATA PREPARATION ---

  const chartData = useMemo(() => {
    const activePlayers = selections[activePosition];
    if (!activePlayers || activePlayers.length === 0) return [];

    // 1. Extract Stat Keys from the first player
    const firstPlayerStats = activePlayers[0].stats;
    if (!firstPlayerStats) return [];
    
    const statKeys = Object.keys(firstPlayerStats);

    // 2. Map keys to Radar format
    return statKeys.map(key => {
      // Pretty print key (e.g. "goals_scored" -> "Goals Scored")
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      // Initialize data point
      const point: any = { subject: label, fullKey: key };

      // Add each player's value
      activePlayers.forEach(player => {
        const statItem = player.stats[key];
        let val = 0;

        // Logic: Try percentile first, then value, else 0
        if (statItem) {
          if (statItem.percentile !== null && statItem.percentile !== '') {
            val = Number(statItem.percentile);
          } else if (statItem.value !== null && statItem.value !== '') {
            val = Number(statItem.value);
            // Cap at 100 if mixing raw values with percentiles creates scaling issues
            if (val > 100) val = 100; 
          }
        }
        point[player.name] = isNaN(val) ? 0 : val;
      });

      return point;
    });
  }, [selections, activePosition]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // --- RENDER HELPERS ---

    const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs z-50 min-w-[150px]">
            {/* The Label (Stat Name, e.g. "Goals Scored") */}
            <div className="font-bold mb-2 text-slate-700 border-b border-slate-100 pb-1">
            {label}
            </div>
            
            {/* The Payload (List of Players and their values for this stat) */}
            <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4">
                <span 
                    className="font-semibold" 
                    style={{ color: entry.color }} // Recharts automatically passes the stroke color here
                >
                    {entry.name}:
                </span>
                <span className="font-mono text-slate-600">
                    {Number(entry.value).toFixed(1)}
                    <span className="text-slate-400 text-[10px] ml-0.5">%</span>
                </span>
                </div>
            ))}
            </div>
        </div>
        );
    }
    return null;
    };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <nav className="w-20 bg-slate-900 flex flex-col items-center py-6 shrink-0 z-20 shadow-xl">
        <div className="mb-8 text-white font-black text-xl tracking-tighter">SCT</div>
        <div className="flex flex-col gap-3 w-full px-2">
          {POSITIONS.map(pos => {
            const count = selections[pos]?.length || 0;
            return (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`
                  h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all duration-200 group
                  ${activePosition === pos 
                    ? 'bg-blue-600 text-white shadow-lg translate-x-1' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                `}
              >
                <span className="text-sm font-bold">{pos}</span>
                <span className={`text-[10px] transition-opacity ${count > 0 ? 'opacity-100 font-bold text-blue-200' : 'opacity-0'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. MIDDLE COLUMN */}
      <aside className="w-96 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-20">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search players..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoadingDetails ? (
              <Loader2 className="absolute right-3 top-3 text-blue-500 animate-spin" size={18} />
            ) : query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* A. SEARCH RESULTS */}
          {query.length >= 2 && (
            <div className="p-2">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Results</h3>
              {isSearching ? (
                 <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(player => {
                  const pPos = normalizePosition(player.position);
                  const isSwitch = pPos !== activePosition && POSITIONS.includes(pPos as Position);
                  return (
                    <div 
                      key={player.id}
                      onClick={() => handleSelectPlayer(player.id, player.player, player.position)}
                      className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer rounded-lg group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{player.player}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          {pPos} {isSwitch && <span className="text-blue-500 ml-1">(Switches Tab)</span>}
                        </div>
                      </div>
                      <Square size={18} className="text-gray-300 group-hover:text-blue-400" />
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">No players found</div>
              )}
            </div>
          )}

          {/* B. ACTIVE SELECTIONS & TRENDING (When not searching) */}
          {!query && (
            <>
              {/* Selected List */}
              <div className="p-2 border-b border-gray-100">
                <h3 className="px-4 py-2 text-xs font-bold text-blue-600 uppercase tracking-wider flex justify-between items-center">
                  Active {activePosition} Selection
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                    {selections[activePosition].length}
                  </span>
                </h3>
                {selections[activePosition].length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm italic">
                    No players selected.
                  </div>
                ) : (
                  selections[activePosition].map(player => (
                    <div 
                      key={player.player_id}
                      onClick={() => removeSelection(player.player_id)}
                      className="flex items-center justify-between p-3 hover:bg-red-50 cursor-pointer rounded-lg group transition-colors bg-blue-50/50 mb-1"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                           {player.position}
                         </div>
                         <div>
                            <div className="font-bold text-sm text-blue-900">{player.name}</div>
                            <div className="text-[10px] text-gray-500">
                              {player.stats ? Object.keys(player.stats).length : 0} Stats
                            </div>
                         </div>
                      </div>
                      <CheckSquare size={18} className="text-blue-600 group-hover:text-red-500" />
                    </div>
                  ))
                )}
              </div>

              {/* Trending */}
              <div className="p-2">
                <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap size={14} className="text-yellow-500" /> Trending
                </h3>
                {trending.map(tPlayer => (
                  <div 
                    key={tPlayer.id}
                    onClick={() => handleSelectPlayer(tPlayer.id, tPlayer.player, tPlayer.position)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                  >
                    {/* Ensure you have an 'alt' fallback if URL is missing, or TS complains about img props potentially */}
                    <img src={tPlayer.url} alt={tPlayer.player} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                    <div className="text-sm font-medium text-slate-700">{tPlayer.player}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* 3. CHART VISUALIZATION */}
      <main className="flex-1 p-6 flex flex-col bg-slate-50">
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 p-6 relative flex flex-col">
          <header className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Performance Radar</h1>
              <p className="text-gray-500 text-sm">Comparing Percentiles (0-99)</p>
            </div>
          </header>

          <div className="flex-1 relative min-h-[400px]">
            {selections[activePosition].length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <Activity size={64} className="mb-4 opacity-20"/>
                <p className="text-lg font-medium text-gray-400">Analysis Console Empty</p>
                <p className="text-sm max-w-xs text-center mt-2 opacity-60">
                  Search and select players to view dynamic stat breakdown.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {selections[activePosition].map((player, index) => (
                    <Radar
                      key={player.player_id}
                      name={player.name}
                      dataKey={player.name}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.1}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const PlayerPage = () => {
    return (
        // This boundary resolves the build error by telling Next.js what to show
        // while the client is figuring out the URL parameters.
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Player Data...</div>}>
            <PlayerContent />
        </Suspense>
    );
}

export default PlayerPage;