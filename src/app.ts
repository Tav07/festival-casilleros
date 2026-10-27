import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './interface/http/middlewares/errorHandler.js';
import { notFound } from './interface/http/middlewares/notFound.js';
import { construirDependencias } from './interface/container.js';
import { crearRouterCasilleros } from './interface/http/routes/alquileres-casillero.routes.js';

const app = express();
app.use(cors());
// express.json() rechaza con SyntaxError los bodies que no son JSON válido.
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const { controller } = construirDependencias();
app.use('/api/alquileres-casillero', crearRouterCasilleros(controller));

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Módulo Casilleros escuchando en el puerto ${PORT}`);
});