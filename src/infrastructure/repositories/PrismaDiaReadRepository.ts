import type { PrismaClient } from '../../generated/prisma/client.js';
import type { DiaReadRepository } from '../../domain/repositories/DiaReadRepository.js';

export class PrismaDiaReadRepository implements DiaReadRepository {
  constructor(private prisma: PrismaClient) {}

  async existe(id: number): Promise<boolean> {
    const cuenta = await this.prisma.dias.count({ where: { id } });
    return cuenta > 0;
  }
}