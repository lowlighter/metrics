/** Secret, used to prevent leaks in logs by hiding its value */
export class Secret {
  /** Constructor */
  constructor(value: unknown) {
    this.#value = `${value ?? ""}`
    this.empty = !this.#value.length
  }

  /** Is empty */
  readonly empty

  /** Value */
  readonly #value

  /** Read value */
  read() {
    return this.#value
  }
}
