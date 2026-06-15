import { redirect } from "next/navigation";
import { getCurrentNoveduSession } from "@/features/auth/server-session";

export default async function Home() {
  const session = await getCurrentNoveduSession();

  redirect(session ? "/chat" : "/login");
}
