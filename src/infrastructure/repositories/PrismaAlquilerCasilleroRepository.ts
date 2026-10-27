import type { PrismaClient } from '../../generated/prisma/client.js';
import type { AlquilerCasillero, DatosNuevoCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { Tamano, EstadoAlquiler } from '../../domain/constants/casilleros.js';
import type {
  AlquilerCasilleroRepository,
  FiltrosListado,
} from '../../domain/repositories/AlquilerCasilleroRepository.js';

// Fila cruda de Prisma → entidad del dominio. fecha_devolucion viaja como string ISO o null.
function aEntidad(fila: {
  id: number;
  asistente_id: number;
  dia_id: number;
  tamano: string;
  precio: number;
  estado: string;
  fecha_devolucion: Date | null;
  state: string;
}): AlquilerCasillero {
  return {
    id: fila.id,
    asistente_id: fila.asistente_id,
    dia_id: fila.dia_id,
    tamano: fila.tamano as Tamano,
    precio: fila.precio,
    estado: fila.estado as EstadoAlquiler,
    fecha_devolucion: fila.fecha_devolucion ? fila.fecha_devolucion.toISOString() : null,
    state: fila.state as 'ACTIVE' | 'REMOVED',
  };
}

export class PrismaAlquilerCasilleroRepository implements AlquilerCasilleroRepository {
  constructor(private prisma: PrismaClient) {}

  private whereDeFiltros(filtros: FiltrosListado) {
    return {
      // El listado siempre excluye los REMOVED. Los filtros se combinan con AND.
      state: { not: 'REMOVED' },
      ...(filtros.asistente_id !== undefined ? { asistente_id: filtros.asistente_id } : {}),
      ...(filtros.dia_id !== undefined ? { dia_id: filtros.dia_id } : {}),
      ...(filtros.tamano !== undefined ? { tamano: filtros.tamano } : {}),
      ...(filtros.estado !== undefined ? { estado: filtros.estado } : {}),
    };
  }

  async listar(
    filtros: FiltrosListado,
    page: number,
    limit: number,
  ): Promise<{ total: number; datos: AlquilerCasillero[] }> {
    const where = this.whereDeFiltros(filtros);
    const [total, filas] = await Promise.all([
      this.prisma.alquileres_casillero.count({ where }),
      this.prisma.alquileres_casillero.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { total, datos: filas.map(aEntidad) };
  }

  async obtenerPorId(id: number): Promise<AlquilerCasillero | null> {
    const fila = await this.prisma.alquileres_casillero.findUnique({ where: { id } });
    return fila ? aEntidad(fila) : null;
  }

  async crear(datos: DatosNuevoCasillero, precio: number): Promise<AlquilerCasillero> {
    const fila = await this.prisma.alquileres_casillero.create({
      data: {
        asistente_id: datos.asistente_id,
        dia_id: datos.dia_id,
        tamano: datos.tamano,
        precio,
        estado: 'EN_USO',
        fecha_devolucion: null,
        state: 'ACTIVE',
      },
    });
    return aEntidad(fila);
  }

  async actualizar(
    id: number,
    cambio: {
      tamano?: Tamano;
      precio?: number;
      estado?: EstadoAlquiler;
      fecha_devolucion?: string | null;
    },
  ): Promise<AlquilerCasillero | null> {
    const data: Record<string, unknown> = {};
    if (cambio.tamano !== undefined) data.tamano = cambio.tamano;
    if (cambio.precio !== undefined) data.precio = cambio.precio;
    if (cambio.estado !== undefined) data.estado = cambio.estado;
    if (cambio.fecha_devolucion !== undefined) {
      data.fecha_devolucion = cambio.fecha_devolucion ? new Date(cambio.fecha_devolucion) : null;
    }
    if (Object.keys(data).length === 0) {
      // Nada que cambiar: se devuelve el registro tal como está.
      return this.obtenerPorId(id);
    }
    try {
      const fila = await this.prisma.alquileres_casillero.update({ where: { id }, data });
      return aEntidad(fila);
    } catch {
      // El registro dejó de existir (o fue removido por otra petición).
      return null;
    }
  }

  async marcarEliminado(id: number): Promise<AlquilerCasillero | null> {
    try {
      const fila = await this.prisma.alquileres_casillero.update({
        where: { id },
        data: { state: 'REMOVED' },
      });
      return aEntidad(fila);
    } catch {
      return null;
    }
  }

  async contarEnUsoPorTamano(diaId: number): Promise<{ tamano: Tamano; ocupados: number }[]> {
    // Solo cuentan los alquileres ACTIVE y EN_USO, en el día indicado.
    const conteos = await this.prisma.alquileres_casillero.groupBy({
      by: ['tamano'],
      where: { dia_id: diaId, state: 'ACTIVE', estado: 'EN_USO' },
      _count: { _all: true },
    });
    return conteos.map((c) => ({ tamano: c.tamano as Tamano, ocupados: c._count._all }));
  }

  async contarEnUsoDeTamano(diaId: number, tamano: Tamano, excluirId?: number): Promise<number> {
    return this.prisma.alquileres_casillero.count({
      where: {
        dia_id: diaId,
        tamano,
        state: 'ACTIVE',
        estado: 'EN_USO',
        ...(excluirId !== undefined ? { id: { not: excluirId } } : {}),
      },
    });
  }

  async existeOtroEnUso(asistenteId: number, diaId: number, excluirId?: number): Promise<boolean> {
    const fila = await this.prisma.alquileres_casillero.findFirst({
      where: {
        asistente_id: asistenteId,
        dia_id: diaId,
        state: 'ACTIVE',
        estado: 'EN_USO',
        ...(excluirId !== undefined ? { id: { not: excluirId } } : {}),
      },
      select: { id: true },
    });
    return fila !== null;
  }
}