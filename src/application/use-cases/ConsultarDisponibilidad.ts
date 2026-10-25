import type { AlquilerCasilleroRepository } from '../../domain/repositories/AlquilerCasilleroRepository.js';
import type { DiaReadRepository } from '../../domain/repositories/DiaReadRepository.js';
import type { Tamano } from '../../domain/constants/casilleros.js';
import { CUPOS, TAMANOS } from '../../domain/constants/casilleros.js';
import { NotFoundError } from '../../domain/errors/index.js';
import { validarIdDeRuta } from '../validators/enteros.js';

export interface TamanoDisponible {
  tamano: Tamano;
  cupo: number;
  ocupados: number;
  disponibles: number;
}

export class ConsultarDisponibilidad {
  constructor(
    private repositorio: AlquilerCasilleroRepository,
    private dias: DiaReadRepository,
  ) {}

  async ejecutar(diaId: string): Promise<{ dia_id: number; tamanos: TamanoDisponible[] }> {
    // 1. Validar el diaId (400).
    const diaIdValido = validarIdDeRuta(diaId, 'diaId');

    // 2. El día debe existir (404).
    if (!(await this.dias.existe(diaIdValido))) {
      throw new NotFoundError('El día no existe');
    }

    // 3. Conteos: solo cuentan los alquileres ACTIVE y EN_USO. Siempre van los
    //    dos tamaños y en el mismo orden.
    const conteos = await this.repositorio.contarEnUsoPorTamano(diaIdValido);
    const porTamano = new Map(conteos.map((c) => [c.tamano, c.ocupados]));

    const tamanos = (TAMANOS as readonly Tamano[]).map((tamano) => {
      const ocupados = porTamano.get(tamano) ?? 0;
      return {
        tamano,
        cupo: CUPOS[tamano],
        ocupados,
        disponibles: CUPOS[tamano] - ocupados,
      };
    });

    return { dia_id: diaIdValido, tamanos };
  }
}