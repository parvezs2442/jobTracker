// scripts/db-sync.js
const { execSync } = require("child_process");

const dbUrl = process.env.DATABASE_URL || "";

if (
  dbUrl &&
  !dbUrl.includes("localhost") &&
  !dbUrl.includes("127.0.0.1") &&
  (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))
) {
  console.log("[db-sync] Remote database detected. Synchronizing Prisma schema to cloud database...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("[db-sync] Cloud database synced successfully!");
  } catch (err) {
    console.warn(
      "[db-sync] Warning: Could not automatically sync database schema during build:",
      err.message
    );
  }
} else {
  console.log(
    "[db-sync] Skipping automated cloud schema push (no remote cloud DATABASE_URL detected during build)."
  );
}
