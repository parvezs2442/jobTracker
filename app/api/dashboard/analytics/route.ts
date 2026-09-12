import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

interface JwtPayload {
  userId: string;
}

export async function GET() {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    // 2. Fetch all jobs belonging exclusively to the authenticated user
    const jobs = await prisma.job.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalApplications = jobs.length;

    // 3. Calculate status counts
    const statusCounts = {
      applied: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    jobs.forEach((job) => {
      const s = job.status.toUpperCase();
      if (s === "APPLIED") statusCounts.applied++;
      else if (s === "INTERVIEW") statusCounts.interview++;
      else if (s === "OFFER") statusCounts.offer++;
      else if (s === "HIRED") statusCounts.hired++;
      else if (s === "REJECTED") statusCounts.rejected++;
    });

    // 4. Status distribution for chart
    const statusDistribution = [
      { status: "Applied", count: statusCounts.applied, key: "APPLIED", color: "#3B82F6" },
      { status: "Interview", count: statusCounts.interview, key: "INTERVIEW", color: "#6366F1" },
      { status: "Offer", count: statusCounts.offer, key: "OFFER", color: "#10B981" },
      { status: "Hired", count: statusCounts.hired, key: "HIRED", color: "#06B6D4" },
      { status: "Rejected", count: statusCounts.rejected, key: "REJECTED", color: "#F43F5E" },
    ];

    // 5. Conversion Metrics / Funnel
    // Total reaching interview stage or beyond = interview + offer + hired
    const reachedInterview = statusCounts.interview + statusCounts.offer + statusCounts.hired;
    // Total receiving offers or hired = offer + hired
    const reachedOffer = statusCounts.offer + statusCounts.hired;

    const interviewRate = totalApplications > 0 
      ? Number(((reachedInterview / totalApplications) * 100).toFixed(1))
      : 0;

    const offerRate = totalApplications > 0 
      ? Number(((reachedOffer / totalApplications) * 100).toFixed(1))
      : 0;

    const hireRate = totalApplications > 0 
      ? Number(((statusCounts.hired / totalApplications) * 100).toFixed(1))
      : 0;

    // 6. Time-series application activity (past 6 months timeline)
    const now = new Date();
    const monthsTimeline: { month: string; monthShort: string; count: number; date: Date }[] = [];

    // Generate last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      monthsTimeline.push({
        month: format(d, "MMM yyyy"),
        monthShort: format(d, "MMM"),
        count: 0,
        date: d,
      });
    }

    // Populate actual counts from DB records
    jobs.forEach((job) => {
      const jobDate = new Date(job.appliedAt || job.createdAt);
      const bucket = monthsTimeline.find((m) => isSameMonth(m.date, jobDate));
      if (bucket) {
        bucket.count++;
      }
    });

    const applicationsOverTime = monthsTimeline.map((m) => ({
      month: m.month,
      monthShort: m.monthShort,
      applications: m.count,
    }));

    // 7. Recent Applications (Top 5)
    const recentApplications = jobs.slice(0, 5).map((job) => ({
      id: job.id,
      company: job.company,
      position: job.position,
      status: job.status,
      location: job.location,
      salary: job.salary,
      workMode: job.workMode,
      appliedAt: job.appliedAt,
      createdAt: job.createdAt,
      resumeType: job.resumeType,
      resumeFilename: job.resumeFilename,
    }));

    return NextResponse.json(
      {
        success: true,
        analytics: {
          totalApplications,
          statusCounts,
          statusDistribution,
          funnel: {
            total: totalApplications,
            interview: reachedInterview,
            offer: reachedOffer,
            hired: statusCounts.hired,
            interviewRate,
            offerRate,
            hireRate,
          },
          applicationsOverTime,
          recentApplications,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/dashboard/analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to compute dashboard analytics.",
      },
      { status: 500 }
    );
  }
}
