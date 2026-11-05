import { defaultDrivers } from "@/constants";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const response = await sql`SELECT * FROM drivers`;

    return Response.json({
      data: response?.length ? response : defaultDrivers,
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ data: defaultDrivers });
  }
}
