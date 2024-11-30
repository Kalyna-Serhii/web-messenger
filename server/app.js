import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import setupSocketIO from './src/websocket/index.js';
import cookieParser from 'cookie-parser';
import errorMiddleware from './src/middlewares/error-middleware.js';
import { authRouter } from './src/routes/index.js';

const app = express();

const HOST = process.env.SERVER_HOST;
const PORT = process.env.SERVER_PORT;

app.use(express.json());
app.use(cookieParser());
app.use('/api', authRouter);
app.use(errorMiddleware);

const server = createServer(app);

setupSocketIO(server);

server.listen(PORT, () => {
    console.log(`Server listens http://${HOST}:${PORT}/`);
});
