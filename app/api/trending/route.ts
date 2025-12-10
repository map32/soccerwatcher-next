// app/api/users/[userId]/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import client from "@/client/supabase";

export const GET = async (
    req: NextRequest
    ) => {
    try {
        const data = await client.from('trending').select
        return NextResponse.json({ todoItems }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};