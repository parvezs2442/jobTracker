import { LayoutDashboard, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";

export default function Features() {
  const items = [
    {
      title: "Interactive Dashboard",
      description: "Get a comprehensive birds-eye view of your application statistics, pipelines, and upcoming interviews.",
      icon: LayoutDashboard,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Pipeline Tracking",
      description: "Add, update, and manage your job applications through their full lifecycle from search to offer letter.",
      icon: Briefcase,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Analytics & Trends",
      description: "Analyze interview invitation rates, offer frequencies, and rejection trends to optimize your job hunt.",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Enterprise Security",
      description: "Your credential storage and tracking details are guarded with secure JWT authorization and route middlewares.",
      icon: ShieldCheck,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Everything you need to land your next role
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
          A suite of intuitive tools designed to help software engineers, designers, and professionals coordinate their career hunt.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="hover-card-effect flex flex-col justify-between rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
            >
              <div>
                <div className={`inline-flex rounded-xl border p-2.5 ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-zinc-950">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}