import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (req: NextRequest) => {
    try {
        const id = req.nextUrl.searchParams.get('id') || '';
        const pos = req.nextUrl.searchParams.get('position') || '';

        if (!id || !pos) return NextResponse.json({}, { status: 200 });

        // 1. DYNAMICALLY SELECT TABLE
        const table = pos === 'GK' ? 'stats_gk' : 'stats_outfield';

        const { data, error } = await client
            .from(table)
            .select(`*`)
            .eq('player_id', id)
            // If it's outfield, we filter by position. GKs usually don't have a 'position' column in stats_gk or it's just 'GK'
            // Add .eq('position', pos) only if it's outfield to be safe, or if your GK table has it.
            // Assuming GK table implies GK position:
            .match(pos !== 'GK' ? { position: pos } : {}); 
        
        if (error || !data || data.length < 2) {
            return NextResponse.json({ error: "Data not found" }, { status: 404 });
        }

        // 2. PROCESS DATA (Same logic as before)
        const rawRow = data.find(d => d.Metric === 'Per 90');
        const pctRow = data.find(d => d.Metric === 'Percentile');
        
        // Exclude these metadata keys
        const metaKeys = new Set(['id', 'player_id', 'name', 'position', 'Metric', 'created_at']);

        const profile = {
            player_id: rawRow.player_id,
            name: rawRow.name,
            position: pos,
            // Group stats
            stats: {} as Record<string, any>
        };

        Object.keys(rawRow).forEach(key => {
            if (!metaKeys.has(key) && rawRow[key] !== null) {
                profile.stats[key] = {
                    value: rawRow[key],
                    percentile: pctRow ? pctRow[key] : 0 // Handle missing pct just in case
                };
            }
        });

        return NextResponse.json(profile, { status: 200 });

    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
};