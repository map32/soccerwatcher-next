import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (req: NextRequest) => {
  try {
    const query = req.nextUrl.searchParams.get('query') || '';

    // Return empty if query is too short
    if (!query || query.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    // Run both database queries in parallel
    const [teamsResult, playersResult] = await Promise.all([
      // 1. Search Teams
      client
        .from('league_team')
        .select('team')
        .ilike('team', `%${query}%`)
        .limit(3), // Limit teams to top 3 matches

      // 2. Search Players (Using your existing join logic)
      client
        .from('player_scouting')
        .select(`
            id, 
            player, 
            stats_outfield!inner ( position )
        `)
        .ilike('player', `%${query}%`)
        .limit(5) // Limit players to top 5 matches
    ]);

    // Handle potential DB errors
    if (teamsResult.error) console.error('Team Search Error:', teamsResult.error);
    if (playersResult.error) console.error('Player Search Error:', playersResult.error);

    // --- Process & Format Data ---

    // A. Format Teams
    const formattedTeams = (teamsResult.data || []).map((t: any) => ({
      type: 'team',
      label: t.team,
      subLabel: 'Team',
      // Teams Page URL Structure
      url: `/teams?teams=${encodeURIComponent(t.team)}`,
      icon: 'shield'
    }));

    // B. Format Players
    const formattedPlayers = (playersResult.data || []).map((p: any) => {
      // Extract unique positions (e.g. ['FW', 'AM'])
      const positions = [...new Set(p.stats_outfield.map((s: any) => s.position))];
      // Use the first position found for the link, but show all in the label
      const primaryPos = positions[0] || 'FW'; 

      return {
        type: 'player',
        label: p.player,
        subLabel: positions.join(', '), // Display "FW, RW" in the search result
        // Players Page URL Structure
        url: `/players?id=${p.id}&position=${primaryPos}&player=${encodeURIComponent(p.player)}`,
        icon: 'user'
      };
    });

    // Combine results (Teams first, then Players)
    const combinedResults = [...formattedTeams, ...formattedPlayers];

    return NextResponse.json(combinedResults, { status: 200 });

  } catch (error) {
    console.error('Global Search API Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};