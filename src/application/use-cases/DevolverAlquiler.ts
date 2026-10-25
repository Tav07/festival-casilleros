import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import { NotFoundError, ConflictError } from '../../domain/errors/index.js';
import { validarIdDeRuta } from '../validators/enteros.js';

export class DevolverAlquiler {
  constructor(private repositorio: AlquilerCasilleroRepository) {}

  async ejecutar(id: string): Promise<AlquilerCasillero> {
    // 1. Validar el id (400).
    const idValido = validarIdDeRuta(id);

    // 2. Buscar el alquiler (404 también si está REMOVED).
    const alquiler = await this.repositorio.obtenerPorId(idValido);
    if (!alquiler || alquiler.state === 'REMOVED') {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }

    // 3. Un alquiler DEVUELTO es final: no se devuelve otra vez (409).
    if (alquiler.estado === 'DEVUELTO') {
      throw new ConflictError('El alquiler ya fue devuelto');
    }

    // 4. Se marca devuelto con la fecha y hora actuales.
    const devuelto = await this.repositorio.actualizar(idValido, {
      estado: 'DEVUELTO',
      fecha_devolucion: new Date().toISOString(),
    });
    if (!devuelto) {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }
    return devuelto;
  }
}