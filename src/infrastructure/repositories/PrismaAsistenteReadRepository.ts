import type { PrismaClient } from '../../generated/prisma/client.js';
import type { AsistenteReadRepository } from '../../domain/repositories/AsistenteReadRepository.js';

export class PrismaAsistenteReadRepository implements AsistenteReadRepository {
  constructor(private prisma: PrismaClient) {}

  async existe(id: number): Promise<boolean> {
    const cuenta = await this.prisma.asistentes.count({ where: { id } });
    return cuenta > 0;
  }
}