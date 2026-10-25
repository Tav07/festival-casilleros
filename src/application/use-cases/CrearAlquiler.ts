import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import type { AsistenteReadRepository } from '../../domain/repositories/AsistenteReadRepository.js';
import type { DiaReadRepository } from '../../domain/repositories/DiaReadRepository.js';
import { NotFoundError } from '../../domain/errors/index.js';
import { calcularPrecio } from '../../domain/constants/casilleros.js';
import { validarCreacion } from '../validators/campos.js';

export class CrearAlquiler {
  constructor(
    private repositorio: AlquilerCasilleroRepository,
    private asistentes: AsistenteReadRepository,
    private dias: DiaReadRepository,
  ) {}

  async ejecutar(body: unknown): Promise<AlquilerCasillero> {
    // 1. Validar el body (precio, estado y fecha_devolucion los pone el servidor).
    const entrada = validarCreacion(body);

    // 2. Verificar que existan el asistente y el día (404 antes que cualquier regla).
    if (!(await this.asistentes.existe(entrada.asistente_id))) {
      throw new NotFoundError('El asistente no existe');
    }
    if (!(await this.dias.existe(entrada.dia_id))) {
      throw new NotFoundError('El día no existe');
    }

    // TODO (fase de reglas de negocio): boleta del día, uno por día y cupo → 409.

    // El precio lo calcula el servidor según el tamaño.
    return this.repositorio.crear(entrada, calcularPrecio(entrada.tamano));
  }
}