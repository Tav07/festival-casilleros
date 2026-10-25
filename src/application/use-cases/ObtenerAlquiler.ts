import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import { NotFoundError } from '../../domain/errors/index.js';
import { validarIdDeRuta } from '../validators/enteros.js';

export class ObtenerAlquiler {
  constructor(private repositorio: AlquilerCasilleroRepository) {}

  async ejecutar(id: string): Promise<AlquilerCasillero> {
    const idValido = validarIdDeRuta(id);
    const alquiler = await this.repositorio.obtenerPorId(idValido);
    // Un id con state = 'REMOVED' cuenta como inexistente.
    if (!alquiler || alquiler.state === 'REMOVED') {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }
    return alquiler;
  }
}