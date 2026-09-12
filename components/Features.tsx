import { LayoutDashboard, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";

export default function Features() {
  const items = [
    {
      title: "Interactive Kanban Board",
      description: "Fluid drag-and-drop workflow across Applied, Interview, Offer, Hired, and Rejected pipeline columns.",
      icon: LayoutDashboard,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Pipeline Tracking",
      description: "Add, edit, filter by work mode, search instantly, and log detailed notes for every position.",
      icon: Briefcase,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Analytics & Trends",
      description: "Analyze application progress, interview conversion rates, and status distribution bars in real time.",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Enterprise Security",
      description: "Strict user data isolation protected by secure HTTP-only JWT cookies and server-side route guards.",
      icon: ShieldCheck,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="text-center mb-14">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Everything you need to land your next role
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-zinc-400">
          A suite of intuitive tools engineered for software engineers, designers, and tech professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 shadow-xs transition hover:border-white/15 hover:bg-[#141824]"
            >
              <div>
                <div className={`inline-flex rounded-xl border p-2.5 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}