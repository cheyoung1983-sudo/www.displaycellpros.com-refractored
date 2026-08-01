import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Provide a fallback to allow 'prisma generate' to succeed during Vercel builds
    // even if the environment variable is not yet configured in the dashboard.
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
