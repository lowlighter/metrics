/** Secret, used to prevent leaks in logs by hiding its value */
export class Secret {
  /** Constructor */
  constructor(value: unknown) {
    this.#value = `${value}`
  }

  /** Value */
  readonly #value

  /** Read value */
  read() {
    return this.#value
  }
}
