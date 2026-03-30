import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  return NextResponse.next();
}
