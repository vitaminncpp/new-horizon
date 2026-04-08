import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const auth = await authService.login(email, password);
    delete (auth.user as unknown as Record<string, unknown>).password;
    return NextResponse.json(auth);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
