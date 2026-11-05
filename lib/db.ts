import { neon } from "@neondatabase/serverless";

const fallbackDbUrl =
  "postgresql://neondb_owner:npg_M0zvn2macAGV@ep-young-silence-a8tu2yim-pooler.eastus2.azure.neon.tech/uber_clone_db?sslmode=require&channel_binding=require";

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL || fallbackDbUrl;
  return neon(connectionString);
};

