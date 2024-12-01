const HOST = process.env.CLIENT_HOST;
const PORT = process.env.CLIENT_PORT;

const corsOptions = {
  origin: `http://${HOST}:${PORT}`,
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
