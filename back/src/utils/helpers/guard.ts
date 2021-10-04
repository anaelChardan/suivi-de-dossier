export class TypeGuardError extends Error {
  constructor(_switchCase: never, message: string) {
    super(message);
  }
}
