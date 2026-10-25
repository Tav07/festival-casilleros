import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository, FiltrosListado } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import { validarPaginacion } from '../validators/paginacion.js';
import { validarFiltroNumerico } from '../validators/enteros.js';
import { validarTamano, validarEstadoFiltro } from '../validators/campos.js';

export interface RespuestaListado {
  pagination: {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
  data: AlquilerCasillero[];
}

export class ListarAlquileres {
  constructor(private repositorio: AlquilerCasilleroRepository) {}

  async ejecutar(query: Record<string, unknown>): Promise<RespuestaListado> {
    const { page, limit } = validarPaginacion(query);

    // Los filtros se combinan con AND y el total cuenta con ellos aplicados.
    const filtros: FiltrosListado = {
      dia_id: validarFiltroNumerico(query.dia_id, 'dia_id'),
      asistente_id: validarFiltroNumerico(query.asistente_id, 'asistente_id'),
      tamano: query.tamano === undefined ? undefined : validarTamano(query.tamano),
      estado: query.estado === undefined ? undefined : validarEstadoFiltro(query.estado),
    };

    const { total, datos } = await this.repositorio.listar(filtros, page, limit);

    return {
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
      data: datos,
    };
  }
}