import { createStaffUser, countOwners } from "../src/modules/newsroom/store";
import { hashPassword } from "../src/modules/newsroom/security";
import type { StaffRole } from "../src/modules/newsroom/policy";
import { z } from "zod";

const args = Object.fromEntries(process.argv.slice(2).map((part) => part.split("=", 2)));
const email = args["--email"];
const name = args["--name"];
const role = args["--role"] as StaffRole | undefined;
const roles: StaffRole[] = ["super_admin", "editor", "writer", "researcher", "distribution_manager", "analyst"];

async function secretPrompt(): Promise<string> {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error("Run from an interactive terminal to enter a hidden password");
  process.stdout.write("Password (12+ characters): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let value = "";
  try {
    for await (const chunk of process.stdin) {
      const character = chunk.toString();
      if (character === "\r" || character === "\n") break;
      if (character === "\u0003") throw new Error("Canceled");
      if (character === "\u007f") value = value.slice(0, -1);
      else if (character.length === 1) value += character;
    }
  } finally { process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); }
  return value;
}

async function main() {
  if (!email || !name || !role || !roles.includes(role)) throw new Error("Usage: npm run staff:create -- --email=name@example.com --name=Name --role=super_admin|editor|writer|researcher|distribution_manager|analyst");
  z.email().parse(email);
  z.string().trim().min(2).max(120).parse(name);
  if (role === "super_admin" && await countOwners() > 0) throw new Error("An owner already exists. Owner changes require a separate reviewed recovery process.");
  const password = await secretPrompt();
  const passwordHash = await hashPassword(password);
  const user = await createStaffUser({ email, name, role, passwordHash });
  console.log(`Created ${user.role}: ${user.name} (${email.toLowerCase()})`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Staff creation failed"); process.exitCode = 1; });
