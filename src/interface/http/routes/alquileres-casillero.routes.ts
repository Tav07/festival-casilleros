import { Router } from 'express';
import type { AlquilerCasilleroController } from '../controllers/AlquilerCasilleroController.js';

export function crearRouterCasilleros(controller: AlquilerCasilleroController): Router {
  const router = Router();

  // Ojo: esta ruta se registra antes de /:id para que "dia" no se
  // interprete como un id de alquiler.
  router.get('/dia/:diaId/disponibilidad', (req, res, next) => {
    controller.consultarDisponibilidad(req, res).catch(next);
  });

  router.get('/', (req, res, next) => {
    controller.listarAlquileres(req, res).catch(next);
  });

  router.post('/', (req, res, next) => {
    controller.crearAlquiler(req, res).catch(next);
  });

  router.get('/:id', (req, res, next) => {
    controller.obtenerAlquiler(req, res).catch(next);
  });

  router.patch('/:id', (req, res, next) => {
    controller.editarAlquiler(req, res).catch(next);
  });

  router.delete('/:id', (req, res, next) => {
    controller.eliminarAlquiler(req, res).catch(next);
  });

  router.post('/:id/devolver', (req, res, next) => {
    controller.devolverCasillero(req, res).catch(next);
  });

  return router;
}