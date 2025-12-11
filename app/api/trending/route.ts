//app/api/trending/route.ts
import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (req: NextRequest) => {
  try {
    // 1. QUERY: 
    // Fetch trending -> join player_scouting -> join BOTH stats tables
    // We assume 'player_scouting' is the bridge as you described.
    const { data, error } = await client
      .from('trending')
      .select(`
        *,
        player_scouting (
          stats_gk ( position ),
          stats_outfield ( position )
        )
      `);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. TRANSFORM:
    // A player will exist in EITHER stats_gk OR stats_outfield (not both).
    // We check which one is not empty and grab the position.
    const formattedData = data.map((item: any) => {
      const scouting = item.player_scouting;
      
      // Handle the case where scouting might be an array or object depending on your FK setup
      const scoutingObj = Array.isArray(scouting) ? scouting[0] : scouting;

      // Extract GK stats (might be array or object)
      const gkStats = scoutingObj?.stats_gk;
      const gkPos = Array.isArray(gkStats) ? gkStats[0]?.position : gkStats?.position;

      // Extract Outfield stats (might be array or object)
      const outfieldStats = scoutingObj?.stats_outfield;
      const outfieldPos = Array.isArray(outfieldStats) ? outfieldStats[0]?.position : outfieldStats?.position;

      // Logic: If GK position exists, use it; otherwise use Outfield position.
      const finalPosition = gkPos || outfieldPos || 'Unknown';

      return {
        id: item.id,
        player: item.player,
        url: item.url,
        position: finalPosition
      };
    });

    return NextResponse.json(formattedData, { status: 200 });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};