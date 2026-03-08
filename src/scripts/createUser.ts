import "dotenv/config";
import { prisma } from "../db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { registerValidator } from "../validator/auth.validator";

async function main() {
  const name = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];
  const roleArg = (process.argv[5] ?? "user").toLowerCase();

  if (!name || !email || !password) {
    console.error("Usage: npm run create-user -- <name> <email> <password> [role]");
    console.error("  role: user | admin | editor (default: user)");
    process.exitCode = 1;
    return;
  }

  const role: Role =
    roleArg === "admin" || roleArg === "editor" || roleArg === "user"
      ? roleArg
      : Role.user;

  const check = registerValidator.safeParse({ name, email, password });
  if (!check.success) {
    console.error("Validation failed:", check.error.errors);
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: check.data.email },
  });
  if (existing) {
    console.error("A user with this email already exists.");
    process.exitCode = 1;
    return;
  }

  const hashedPassword = bcrypt.hashSync(check.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: check.data.name,
      email: check.data.email,
      password: hashedPassword,
      role,
    },
  });

  console.log("User created successfully.");
  console.log("  id:", user.id);
  console.log("  email:", user.email);
  console.log("  name:", user.name);
  console.log("  role:", user.role);
}

main()
  .catch((err) => {
    console.error("Error creating user:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
