import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = cookies().get("session");

  if (session?.value) {
    const user = jwt.verify(session.value, process.env.JWT_SECRET_KEY!);
    return NextResponse.json(user);
  }

  return NextResponse.json({ user: null });
}
