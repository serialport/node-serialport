export class CanceledError extends Error {
  canceled: true
  constructor(message: string) {
    super(message)
    this.canceled = true
  }
}
