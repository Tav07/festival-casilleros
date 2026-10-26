import type { Request, Response } from 'express';
import type { ListarAlquileres } from '../../../application/use-cases/ListarAlquileres.js';
import type { ObtenerAlquiler } from '../../../application/use-cases/ObtenerAlquiler.js';
import type { CrearAlquiler } from '../../../application/use-cases/CrearAlquiler.js';
import type { EditarAlquiler } from '../../../application/use-cases/EditarAlquiler.js';
import type { EliminarAlquiler } from '../../../application/use-cases/EliminarAlquiler.js';
import type { DevolverAlquiler } from '../../../application/use-cases/DevolverAlquiler.js';
import type { ConsultarDisponibilidad } from '../../../application/use-cases/ConsultarDisponibilidad.js';

// Controlador delgado: extrae params/query/body, llama al caso de uso y responde.
// Aquí no hay reglas de negocio ni validaciones; los errores los toma el errorHandler.
export class AlquilerCasilleroController {
  constructor(
    private listar: ListarAlquileres,
    private obtener: ObtenerAlquiler,
    private crear: CrearAlquiler,
    private editar: EditarAlquiler,
    private eliminar: EliminarAlquiler,
    private devolver: DevolverAlquiler,
    private disponibilidad: ConsultarDisponibilidad,
  ) {}

  async listarAlquileres(req: Request, res: Response): Promise<void> {
    const resultado = await this.listar.ejecutar(req.query as Record<string, unknown>);
    res.status(200).json(resultado);
  }

  async obtenerAlquiler(req: Request, res: Response): Promise<void> {
    const alquiler = await this.obtener.ejecutar(String(req.params.id));
    res.status(200).json({ data: alquiler });
  }

  async crearAlquiler(req: Request, res: Response): Promise<void> {
    const alquiler = await this.crear.ejecutar(req.body);
    res.status(201).json({ data: alquiler });
  }

  async editarAlquiler(req: Request, res: Response): Promise<void> {
    const alquiler = await this.editar.ejecutar(String(req.params.id), req.body);
    res.status(200).json({ data: alquiler });
  }

  async eliminarAlquiler(req: Request, res: Response): Promise<void> {
    const resultado = await this.eliminar.ejecutar(String(req.params.id));
    res.status(200).json(resultado);
  }

  async devolverCasillero(req: Request, res: Response): Promise<void> {
    const alquiler = await this.devolver.ejecutar(String(req.params.id));
    res.status(200).json({ data: alquiler });
  }

  async consultarDisponibilidad(req: Request, res: Response): Promise<void> {
    const resultado = await this.disponibilidad.ejecutar(String(req.params.diaId));
    res.status(200).json({ data: resultado });
  }
}