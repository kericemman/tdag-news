import { cookies } from "next/headers";
import { staffForSession } from "./store";

export const staffCookieName = process.env.NODE_ENV === "production" ? "__Host-tdag_staff" : "tdag_staff";

export async function currentStaff() {
  const token = (await cookies()).get(staffCookieName)?.value;
  return staffForSession(token);
}
