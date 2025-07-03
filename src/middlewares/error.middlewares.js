import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error?.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error?.message || "Something went wrong";

    error = new ApiError(message, statusCode, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  // Ensure the status code is a valid number
  const status = typeof error.statusCode === "number" ? error.statusCode : 500;

  return res.status(status).json(response);
};

export { errorHandler };
