// ÚNICO lugar donde se instancia el PrismaClient. Usa el adaptador pg
// (driver adapters de Prisma) con la DATABASE_URL del .env.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

export function crearClientePrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}