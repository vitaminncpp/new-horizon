import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/application/auth/errors";

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Invalid input", issues: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof AuthError) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  }

  console.error("Unexpected route error", error);
  return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
}
