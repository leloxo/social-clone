import { ProblemDetail } from "../models/common/api-error.model";

export class AppError extends Error {
  constructor(
    public override message: string,
    public status: number,
    public originalError?: ProblemDetail
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}