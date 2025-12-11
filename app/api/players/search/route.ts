import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (
    req: NextRequest
    ) => {
    try {
        const query = req.nextUrl.searchParams.get('query') || '';
        if (!query) {
            return NextResponse.json([], { status: 200 });
        }

        // 1. THE QUERY
        const { data: rawData, error } = await client
        .from('player_scouting')
        // Use '!inner' to filter out parents with empty children (INNER JOIN)
        .select(`
            id, 
            player, 
            stats_outfield!inner ( position )
        `)
        .ilike('player', `%${query}%`)
        .limit(25);

        if (error) {
        console.error('Error fetching data:', error);
        return;
        }

        // 2. THE TRANSFORMATION
        const cleanedData = rawData.map(row => ({
        id: row.id,
        player: row.player,
        // a. Map to get just the string values
        // b. Use Set to remove duplicates
        // c. Spread (...) back into an array
        position: [...new Set(row.stats_outfield.map(item => item.position))]
        }));

        return NextResponse.json(cleanedData, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};