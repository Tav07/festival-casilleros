import type { AlquilerCasillero } from '../../domain/entities/AlquilerCasillero.js';
import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import type { Tamano } from '../../domain/constants/casilleros.js';
import { calcularPrecio } from '../../domain/constants/casilleros.js';
import { NotFoundError, ConflictError } from '../../domain/errors/index.js';
import { validarIdDeRuta } from '../validators/enteros.js';
import { validarEdicion } from '../validators/campos.js';

export class EditarAlquiler {
  constructor(private repositorio: AlquilerCasilleroRepository) {}

  async ejecutar(id: string, body: unknown): Promise<AlquilerCasillero> {
    // 1. Validar el id (400).
    const idValido = validarIdDeRuta(id);

    // 2. El body vacío siempre responde 404, exista o no el id (decisión del módulo).
    if (!esObjetoConClaves(body)) {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }

    // 3. Validar el body: claves no editables y tamano inválido → 400.
    const cambio = validarEdicion(body);

    // 4. Buscar el alquiler activo (404 si no existe o está REMOVED).
    const alquiler = await this.repositorio.obtenerPorId(idValido);
    if (!alquiler || alquiler.state === 'REMOVED') {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }

    // 5. Un alquiler DEVUELTO ya no se edita (409).
    if (alquiler.estado === 'DEVUELTO') {
      throw new ConflictError('El alquiler ya fue devuelto y no se puede editar');
    }

    // 6. Si cambia el tamaño se recalcula el precio.
    //    TODO (fase de reglas de negocio): revalidar el cupo sin contarse a sí mismo.
    let tamanoNuevo: Tamano | undefined = cambio.tamano;
    let precio = alquiler.precio;
    if (tamanoNuevo !== undefined && tamanoNuevo !== alquiler.tamano) {
      precio = calcularPrecio(tamanoNuevo);
    } else {
      tamanoNuevo = undefined; // el tamaño no cambia: no hay que tocar nada
    }

    // 7. Guardar.
    const actualizado = await this.repositorio.actualizar(idValido, {
      tamano: tamanoNuevo,
      ...(tamanoNuevo !== undefined ? { precio } : {}),
    });
    if (!actualizado) {
      throw new NotFoundError('Alquiler de casillero no encontrado');
    }
    return actualizado;
  }
}

function esObjetoConClaves(body: unknown): boolean {
  return (
    body !== null && typeof body === 'object' && !Array.isArray(body) && Object.keys(body as object).length > 0
  );
}