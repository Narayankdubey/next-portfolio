import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin authentication
    // const authResult = await verifyAuth(request);
    // if (!authResult.authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    await dbConnect();

    // Run aggregations concurrently for speed
    const [rawCities, rawDevices, rawOs, rawBrowsers] = await Promise.all([
      UserJourney.distinct("location.city", { "location.city": { $nin: [null, ""] } }),
      UserJourney.distinct("device.type", { "device.type": { $nin: [null, ""] } }),
      UserJourney.distinct("device.os", { "device.os": { $nin: [null, ""] } }),
      UserJourney.distinct("device.browser", { "device.browser": { $nin: [null, ""] } }),
    ]);

    // Sort alphabetically and ensure 'Unknown' logic can be added on frontend
    const filters = {
      cities: rawCities.sort((a, b) => a.localeCompare(b)),
      devices: rawDevices.sort((a, b) => a.localeCompare(b)),
      os: rawOs.sort((a, b) => a.localeCompare(b)),
      browsers: rawBrowsers.sort((a, b) => a.localeCompare(b)),
    };

    return NextResponse.json(filters);
  } catch (error) {
    console.error("Get filters error:", error);
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
