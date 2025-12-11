import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (
    req: NextRequest
    ) => {
    try {

        const { data, error } = await client
            .from('league_team')
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const processedData = data.reduce((acc, cur) => {if (!acc[cur.league]) acc[cur.league] = [cur]; else acc[cur.league].push(cur); return acc}, {})

        return NextResponse.json(processedData, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};