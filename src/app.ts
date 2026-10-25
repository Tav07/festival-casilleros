import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './interface/http/middlewares/errorHandler.js';
import { notFound } from './interface/http/middlewares/notFound.js';

const app = express();
app.use(cors());
// express.json() rechaza con SyntaxError los bodies que no son JSON válido.
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO: registrar las rutas /api/... de alquileres-casillero en las fases siguientes.
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Módulo Casilleros escuchando en el puerto ${PORT}`);
});