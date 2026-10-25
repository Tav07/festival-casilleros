import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import { NotFoundError, ConflictError } from '../../domain/errors/index.js';
import { validarIdDeRuta } from '../validators/enteros.js';

export class EliminarAlquiler {
  constructor(private repositorio: AlquilerCasilleroRepository) {}

  async ejecutar(id: string): Promise<{ message: string }> {
    // 1. Validar el id (400).
    const idValido = validarIdDeRuta(id);

    // 2. Buscar el alquiler (404 también si ya está REMOVED: borrar dos veces → 404).
    const alquiler = await this.repositorio.obtenerPorId(idValido);
    if (!alquiler || alquiler.state === 'REMOVED') {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }

    // 3. Un alquiler DEVUELTO no se elimina (409).
    if (alquiler.estado === 'DEVUELTO') {
      throw new ConflictError('El alquiler ya fue devuelto y no se puede eliminar');
    }

    // 4. Borrado lógico: nunca se borra la fila, solo se marca como REMOVED.
    await this.repositorio.marcarEliminado(idValido);
    return { message: 'Alquiler de casillero eliminado' };
  }
}