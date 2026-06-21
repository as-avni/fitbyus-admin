import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const schemaPath = path.resolve("prisma/schema.prisma");
const envPath = path.resolve(".env");

function migrate() {
  const dbUrl = process.argv[2];
  if (!dbUrl) {
    console.error("❌ Error: Please provide your PostgreSQL connection string.");
    console.log("Usage: node scripts/migrate_to_postgres.js \"postgresql://user:pass@host:port/dbname\"\n");
    process.exit(1);
  }

  console.log("1. Modifying prisma/schema.prisma to use PostgreSQL...");
  let schema = fs.readFileSync(schemaPath, "utf-8");
  
  // Replace SQLite source with PostgreSQL env-based source
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
  
  fs.writeFileSync(schemaPath, schema, "utf-8");
  console.log("✅ Modified schema.prisma successfully.");

  console.log("2. Updating .env file with DATABASE_URL...");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  
  if (envContent.includes("DATABASE_URL=")) {
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${dbUrl}"`);
  } else {
    envContent += `\nDATABASE_URL="${dbUrl}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("✅ Updated .env successfully.");

  console.log("3. Running Prisma schema push to create tables online...");
  try {
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("✅ Schema pushed to online database successfully.");
  } catch (err) {
    console.error("❌ Failed to push schema to PostgreSQL:", err.message);
    process.exit(1);
  }

  console.log("4. Seeding online database with default clients and profiles...");
  try {
    execSync("npx tsx src/server/seed.ts", { stdio: "inherit" });
    console.log("✅ Database seeded successfully!");
  } catch (err) {
    console.error("❌ Failed to seed database:", err.message);
    process.exit(1);
  }

  console.log("\n🚀 Migration to online PostgreSQL completed successfully!");
}

migrate();
