import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";

interface JwtPayload {
  userId: string;
}

export default async function KanbanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    redirect("/login");
  }

  return <KanbanBoard />;
}
