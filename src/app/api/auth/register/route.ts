import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    await authService.register(email, name, password);
    const auth = await authService.login(email, password);
    delete (auth.user as unknown as Record<string, unknown>).password;
    return NextResponse.json(auth);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
