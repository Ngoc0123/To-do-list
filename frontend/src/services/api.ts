export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  if (response.status === 400) {
    const apiError = await response.json();
    const validationError = new Error(apiError.message) as Error & { details?: Record<string, string> };
    validationError.details = apiError.details;
    return validationError;
  }

  return new Error(fallbackMessage);
}
