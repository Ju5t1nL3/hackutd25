// apps/dashboard/src/app/api/calls/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';

/**
 * GET /api/calls
 * Fetches all call logs from the database, including the
 * related customer information.
 */
export async function GET() {
  try {
    const callLogs = await prisma.callLog.findMany({
      include: {
        customer: true, // This is the magic! It pulls in the linked customer
      },
      orderBy: {
        startTime: 'desc', // Show newest calls first
      },
    });

    // The data is fetched and returned as JSON
    return NextResponse.json(callLogs);

  } catch (error) {
    console.error("Failed to fetch call logs:", error);
    // Disconnect even if there's an error
    await prisma.$disconnect();
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}
