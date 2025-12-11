import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (req: NextRequest) => {
    try {
        const fbrefName = req.nextUrl.searchParams.get('name') || '';
        
        if (!fbrefName) {
            return NextResponse.json([], { status: 200 });
        }

        // 1. Resolve the name using the team_alias table
        // We look for the row where fbref_team matches the input
        let searchName = fbrefName;

        const { data: aliasData, error: aliasError } = await client
            .from('team_alias')
            .select('club_elo_team')
            .eq('fbref_team', fbrefName)
            .single(); // Use .single() as we expect one match

        // If we found an alias, update the searchName. 
        // If aliasError exists (e.g. row not found), we keep using the original name as a fallback.
        if (aliasData && aliasData.club_elo_team) {
            searchName = aliasData.club_elo_team;
        }

        // 2. Prepare the date filter (5 years ago)
        const today = new Date();
        today.setFullYear(today.getFullYear() - 5);
        const fiveYearsAgo = today.toISOString().split('T')[0];

        // 3. Query the ELO table using the resolved 'searchName'
        const { data, error } = await client
            .from('elo')
            .select()
            .eq('team', searchName) // Querying with the converted ClubELO name
            .gte('from', fiveYearsAgo);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};