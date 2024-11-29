import ApiError from '../exceptions/api-error.js';

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  next();
  return res.status(500).json({ message: `Internal Server Error: ${err.message || err}` });
};

export default errorMiddleware;
