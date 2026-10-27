import type { PrismaClient } from '../../generated/prisma/client.js';
import type { BoletaReadRepository } from '../../domain/repositories/BoletaReadRepository.js';

export class PrismaBoletaReadRepository implements BoletaReadRepository {
  constructor(private prisma: PrismaClient) {}

  async tieneBoletaActiva(asistenteId: number, diaId: number): Promise<boolean> {
    // El tipo de boleta no importa: basta una ACTIVE para ese asistente y ese día.
    const cuenta = await this.prisma.boletas.count({
      where: { asistente_id: asistenteId, dia_id: diaId, state: 'ACTIVE' },
    });
    return cuenta > 0;
  }
}