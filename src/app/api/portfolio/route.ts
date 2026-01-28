import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";

// Cache for 1 hour in production, always fresh in development
// export const revalidate = process.env.NODE_ENV === "production" ? 3600 : 0;

export async function GET() {
  try {
    await dbConnect();

    const portfolio = await Portfolio.findOne().lean();

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio data not found" },
        { status: 404 }
      );
    }

    // Remove MongoDB-specific fields

    const { __v, _id, ...portfolioData } = portfolio as any;

    return NextResponse.json(
      {
        success: true,
        data: portfolioData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

// Optional: PUT endpoint for updating portfolio (admin use)
export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const portfolio = await Portfolio.findOne();

    if (!portfolio) {
      const newPortfolio = await Portfolio.create(body);
      return NextResponse.json({
        success: true,
        message: "Portfolio created successfully",
        data: newPortfolio,
      });
    }

    const updated = await Portfolio.findByIdAndUpdate(portfolio._id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update portfolio" },
      { status: 500 }
    );
  }
}
