// Composition root: aquí se instancian las implementaciones Prisma y se
// inyectan en los casos de uso. Es el único lugar que une las cuatro capas.
import { crearClientePrisma } from '../infrastructure/prisma/client.js';
import { PrismaAlquilerCasilleroRepository } from '../infrastructure/repositories/PrismaAlquilerCasilleroRepository.js';
import { PrismaAsistenteReadRepository } from '../infrastructure/repositories/PrismaAsistenteReadRepository.js';
import { PrismaDiaReadRepository } from '../infrastructure/repositories/PrismaDiaReadRepository.js';
import { PrismaBoletaReadRepository } from '../infrastructure/repositories/PrismaBoletaReadRepository.js';
import { ListarAlquileres } from '../application/use-cases/ListarAlquileres.js';
import { ObtenerAlquiler } from '../application/use-cases/ObtenerAlquiler.js';
import { CrearAlquiler } from '../application/use-cases/CrearAlquiler.js';
import { EditarAlquiler } from '../application/use-cases/EditarAlquiler.js';
import { EliminarAlquiler } from '../application/use-cases/EliminarAlquiler.js';
import { DevolverAlquiler } from '../application/use-cases/DevolverAlquiler.js';
import { ConsultarDisponibilidad } from '../application/use-cases/ConsultarDisponibilidad.js';
import { AlquilerCasilleroController } from './http/controllers/AlquilerCasilleroController.js';

export function construirDependencias() {
  const prisma = crearClientePrisma();

  const repositorioAlquileres = new PrismaAlquilerCasilleroRepository(prisma);
  const repositorioAsistentes = new PrismaAsistenteReadRepository(prisma);
  const repositorioDias = new PrismaDiaReadRepository(prisma);
  const repositorioBoletas = new PrismaBoletaReadRepository(prisma);

  const listar = new ListarAlquileres(repositorioAlquileres);
  const obtener = new ObtenerAlquiler(repositorioAlquileres);
  const crear = new CrearAlquiler(repositorioAlquileres, repositorioAsistentes, repositorioDias, repositorioBoletas);
  const editar = new EditarAlquiler(repositorioAlquileres);
  const eliminar = new EliminarAlquiler(repositorioAlquileres);
  const devolver = new DevolverAlquiler(repositorioAlquileres);
  const disponibilidad = new ConsultarDisponibilidad(repositorioAlquileres, repositorioDias);

  const controller = new AlquilerCasilleroController(
    listar,
    obtener,
    crear,
    editar,
    eliminar,
    devolver,
    disponibilidad,
  );

  return { controller };
}