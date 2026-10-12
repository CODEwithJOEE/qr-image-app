import "server-only";
import { cookies } from "next/headers";

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  return token === process.env.ADMIN_PASSWORD;
}
