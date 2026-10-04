export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred. Please try again.'
}

export function logError(context: string, error: unknown): void {
  console.error(`[DudeX Error - ${context}]:`, error)
}
