import 'dotenv/config';
import express from 'express';
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

app.listen(PORT, () => {
    console.log(`Server listens http://${HOST}:${PORT}/`);
});
