import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import type { AsistenteReadRepository } from '../../domain/repositories/AsistenteReadRepository.js';
import type { DiaReadRepository } from '../../domain/repositories/DiaReadRepository.js';
import type { BoletaReadRepository } from '../../domain/repositories/BoletaReadRepository.js';
import { CUPOS, calcularPrecio } from '../../domain/constants/casilleros.js';
import { NotFoundError, ConflictError } from '../../domain/errors/index.js';
import { validarCreacion } from '../validators/campos.js';

export class CrearAlquiler {
  constructor(
    private repositorio: AlquilerCasilleroRepository,
    private asistentes: AsistenteReadRepository,
    private dias: DiaReadRepository,
    private boletas: BoletaReadRepository,
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

    // 3. Regla 1 — boleta del día (409).
    if (!(await this.boletas.tieneBoletaActiva(entrada.asistente_id, entrada.dia_id))) {
      throw new ConflictError('El asistente no tiene una boleta activa para ese día');
    }

    // 4. Regla 2 — máximo un alquiler EN_USO por asistente y día (409).
    if (await this.repositorio.existeOtroEnUso(entrada.asistente_id, entrada.dia_id)) {
      throw new ConflictError('El asistente ya tiene un casillero en uso ese día');
    }

    // 5. Regla 3 — cupo por tamaño y día (409).
    const ocupados = await this.repositorio.contarEnUsoDeTamano(entrada.dia_id, entrada.tamano);
    if (ocupados >= CUPOS[entrada.tamano]) {
      throw new ConflictError(`No hay casilleros ${entrada.tamano} disponibles para ese día`);
    }

    // El precio lo calcula el servidor según el tamaño.
    return this.repositorio.crear(entrada, calcularPrecio(entrada.tamano));
  }
}