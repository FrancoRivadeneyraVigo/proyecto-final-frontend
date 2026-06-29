import { HttpErrorResponse } from '@angular/common/http';

type ErrorBody = {
  message?: unknown;
  error?: unknown;
};

export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (isErrorBody(error.error)) {
    const message = readMessage(error.error.message) ?? readMessage(error.error.error);
    if (message) {
      return message;
    }
  }

  return error.message || fallback;
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === 'object' && value !== null;
}

function readMessage(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}