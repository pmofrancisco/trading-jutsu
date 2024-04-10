import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await req.json();
  const { email } = user;

  const session = jwt.sign({ user: { email } }, process.env.JWT_SECRET_KEY!);
  cookies().set("session", session, { httpOnly: true });

  return NextResponse.json({ user: { email } });
}
