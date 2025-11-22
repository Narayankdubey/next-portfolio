import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if any admin exists
    const adminCount = await AdminUser.countDocuments();

    // If admins exist, we currently don't allow new registrations without invite
    // For now, we'll just block it if count > 0
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Registration is currently closed. Please ask an administrator for an invite." },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await AdminUser.create({
      username,
      email,
      password: hashedPassword,
      role: "superadmin", // First user is superadmin
    });

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    const cookie = serialize("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "strict",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
