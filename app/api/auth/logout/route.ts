import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/http/session";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ message: "Logged out" });
}
