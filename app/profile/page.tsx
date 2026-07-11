import LogoutButton from "@/components/LogoutButton";
import { User, Mail, ShieldAlert, Calendar } from "lucide-react";

export default async function ProfilePage() {
  // Later you'll fetch this from your getMe API (preserving user mock as is)
  const user = {
    name: "Parvez Saifi",
    email: "parvez@gmail.com",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account profile details and authentication state.
        </p>
      </div>

      {/* Profile Card Container */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 md:p-8 shadow-sm space-y-8">
        
        {/* User Large Avatar Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100 text-center sm:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-md shadow-blue-500/10">
            {user.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-zinc-950">
              {user.name}
            </h2>
            <p className="text-sm font-medium text-zinc-500">
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Account</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Full Name block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Full Name
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900">
                {user.name}
              </h3>
            </div>
          </div>

          {/* Email block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Email Address
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900 truncate">
                {user.email}
              </h3>
            </div>
          </div>
        </div>

        {/* Security Warning Section */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 flex gap-3 text-sm text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Note:</span> To change your name, email, or credentials, please contact your systems administrator or support channels.
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-zinc-100 flex items-center justify-end">
          <div className="w-full sm:w-auto">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}