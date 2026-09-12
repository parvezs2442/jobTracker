import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";

export default async function KanbanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyJwt(token);
  } catch {
    redirect("/login");
  }

  return <KanbanBoard />;
}
