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
    const [locationsAggr, rawDevices, rawOs, rawBrowsers] = await Promise.all([
      UserJourney.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$location.country", "Unknown"] },
            cities: { $addToSet: { $ifNull: ["$location.city", "Unknown"] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      UserJourney.distinct("device.type", { "device.type": { $nin: [null, ""] } }),
      UserJourney.distinct("device.os", { "device.os": { $nin: [null, ""] } }),
      UserJourney.distinct("device.browser", { "device.browser": { $nin: [null, ""] } }),
    ]);

    // Format locations map
    const locationMap: Record<string, string[]> = {};
    locationsAggr.forEach((loc) => {
      const country = loc._id === "" ? "Unknown" : loc._id;
      // Filter out nulls/empties, ensure "Unknown" is pushed if needed or map empty to Unknown
      const cities = loc.cities
        .map((c: any) => (c === "" || c === null ? "Unknown" : c))
        .filter((c: string, i: number, arr: string[]) => arr.indexOf(c) === i)
        .sort((a: string, b: string) => a.localeCompare(b));
      locationMap[country] = cities;
    });

    // Sort alphabetically and ensure 'Unknown' logic can be added on frontend
    const filters = {
      locations: locationMap,
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
