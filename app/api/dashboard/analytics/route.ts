import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

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

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    // 2. Fetch all jobs belonging exclusively to the authenticated user with statusHistory
    const jobs = await prisma.job.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalApplications = jobs.length;

    // 3. Current Pipeline (Current Status Distribution - matches Kanban)
    const currentPipeline = {
      applied: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    // 4. Historical Funnel Metrics (Complete Journey - each job counted at most once per stage)
    const historicalApplied = totalApplications; // Every tracked application was submitted
    let historicalInterview = 0;
    let historicalOffer = 0;
    let historicalHired = 0;
    let historicalRejected = 0;

    let totalDaysToInterview = 0;
    let countJobsWithTimeToInterview = 0;
    let totalDaysToOffer = 0;
    let countJobsWithTimeToOffer = 0;

    jobs.forEach((job) => {
      // Tally current status for Current Pipeline
      const curr = job.status.toUpperCase();
      if (curr === "APPLIED") currentPipeline.applied++;
      else if (curr === "INTERVIEW") currentPipeline.interview++;
      else if (curr === "OFFER") currentPipeline.offer++;
      else if (curr === "HIRED") currentPipeline.hired++;
      else if (curr === "REJECTED") currentPipeline.rejected++;

      // Analyze status history for cumulative funnel progression
      const history = job.statusHistory || [];
      const visited = new Set<string>();

      let firstAppliedDate: Date | null = job.appliedAt || job.createdAt;
      let firstInterviewDate: Date | null = null;
      let firstOfferDate: Date | null = null;

      for (const entry of history) {
        const s = entry.status.toUpperCase();
        visited.add(s);
        if (s === "APPLIED" && !firstAppliedDate) {
          firstAppliedDate = new Date(entry.changedAt);
        }
        if (s === "INTERVIEW" && !firstInterviewDate) {
          firstInterviewDate = new Date(entry.changedAt);
        }
        if ((s === "OFFER" || s === "HIRED") && !firstOfferDate) {
          firstOfferDate = new Date(entry.changedAt);
        }
      }

      // If history was empty, fallback to current status
      if (visited.size === 0) {
        visited.add(job.status.toUpperCase());
      }

      // Interview stage: counted only if the application EVER reached INTERVIEW in history
      if (visited.has("INTERVIEW")) {
        historicalInterview++;
        if (firstAppliedDate && firstInterviewDate) {
          const diffDays =
            (firstInterviewDate.getTime() - firstAppliedDate.getTime()) /
            (1000 * 60 * 60 * 24);
          if (diffDays >= 0) {
            totalDaysToInterview += diffDays;
            countJobsWithTimeToInterview++;
          }
        }
      }

      // Offer stage: counted only if the application EVER reached OFFER or HIRED in history
      if (visited.has("OFFER") || visited.has("HIRED")) {
        historicalOffer++;
        if (firstInterviewDate && firstOfferDate) {
          const diffDays =
            (firstOfferDate.getTime() - firstInterviewDate.getTime()) /
            (1000 * 60 * 60 * 24);
          if (diffDays >= 0) {
            totalDaysToOffer += diffDays;
            countJobsWithTimeToOffer++;
          }
        }
      }

      // Hired stage: counted only if reached HIRED
      if (visited.has("HIRED")) {
        historicalHired++;
      }

      // Rejected stage: counted only if reached REJECTED
      if (visited.has("REJECTED")) {
        historicalRejected++;
      }
    });

    // 5. Calculate conversion rates based on unique application history
    const interviewRate =
      totalApplications > 0
        ? Number(((historicalInterview / totalApplications) * 100).toFixed(1))
        : 0;

    const offerRate =
      totalApplications > 0
        ? Number(((historicalOffer / totalApplications) * 100).toFixed(1))
        : 0;

    // Offer After Interview Rate = applications that reached Offer / applications that reached Interview
    const offerAfterInterviewRate =
      historicalInterview > 0
        ? Number(((historicalOffer / historicalInterview) * 100).toFixed(1))
        : 0;

    const hireRate =
      totalApplications > 0
        ? Number(((historicalHired / totalApplications) * 100).toFixed(1))
        : 0;

    const avgDaysToInterview =
      countJobsWithTimeToInterview > 0
        ? Number((totalDaysToInterview / countJobsWithTimeToInterview).toFixed(1))
        : null;

    const avgDaysToOffer =
      countJobsWithTimeToOffer > 0
        ? Number((totalDaysToOffer / countJobsWithTimeToOffer).toFixed(1))
        : null;

    // 6. Journey / Historical counts for the main Dashboard KPI cards
    const journeyCounts = {
      applied: historicalApplied,
      interview: historicalInterview,
      offer: historicalOffer,
      hired: historicalHired,
      rejected: historicalRejected,
    };

    // 7. Status distribution for Current Active Pipeline chart
    const statusDistribution = [
      { status: "Applied", count: currentPipeline.applied, key: "APPLIED", color: "#3B82F6" },
      { status: "Interview", count: currentPipeline.interview, key: "INTERVIEW", color: "#6366F1" },
      { status: "Offer", count: currentPipeline.offer, key: "OFFER", color: "#10B981" },
      { status: "Hired", count: currentPipeline.hired, key: "HIRED", color: "#06B6D4" },
      { status: "Rejected", count: currentPipeline.rejected, key: "REJECTED", color: "#F43F5E" },
    ];

    // 8. Cumulative Journey Funnel stages
    const funnelStages = [
      {
        stage: "Total Applied",
        count: historicalApplied,
        rate: 100,
        color: "#3B82F6",
        subtext: "All applications submitted",
      },
      {
        stage: "Reached Interview",
        count: historicalInterview,
        rate: interviewRate,
        color: "#6366F1",
        subtext: `${interviewRate}% interview rate`,
      },
      {
        stage: "Received Offer",
        count: historicalOffer,
        rate: offerRate,
        color: "#10B981",
        subtext: `${offerRate}% overall offer rate (${offerAfterInterviewRate}% from interview)`,
      },
      {
        stage: "Hired",
        count: historicalHired,
        rate: hireRate,
        color: "#06B6D4",
        subtext: `${hireRate}% hired conversion`,
      },
    ];

    // 9. Time-series application activity (past 6 months timeline)
    const now = new Date();
    const monthsTimeline: { month: string; monthShort: string; count: number; date: Date }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      monthsTimeline.push({
        month: format(d, "MMM yyyy"),
        monthShort: format(d, "MMM"),
        count: 0,
        date: d,
      });
    }

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

    // 10. Recent Applications (Top 5)
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
      resumeLink: job.resumeLink || job.resumeUrl,
      resumeType: job.resumeType,
      resumeFilename: job.resumeFilename,
    }));

    return NextResponse.json(
      {
        success: true,
        analytics: {
          totalApplications,
          statusCounts: journeyCounts, // Historical / Journey counts for Dashboard KPI cards
          currentPipeline,             // Current Active Pipeline (matches Kanban state)
          statusDistribution,          // Current distribution for pipeline chart
          funnelStages,                // Cumulative funnel breakdown
          funnel: {
            total: totalApplications,
            applied: historicalApplied,
            interview: historicalInterview,
            offer: historicalOffer,
            hired: historicalHired,
            rejected: historicalRejected,
            interviewRate,
            offerRate,
            offerAfterInterviewRate,
            hireRate,
            avgDaysToInterview,
            avgDaysToOffer,
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
