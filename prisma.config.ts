import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
  datasource: {
    // Pick up from environment; provide fallback to allow generation during builds
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
