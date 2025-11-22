import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully!",
        data: {
          id: contact._id,
          createdAt: contact.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact form submission error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 });
    }

    // Handle duplicate email or other errors
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit contact form. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve all contacts (for admin use)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const contacts = await Contact.find({}).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
