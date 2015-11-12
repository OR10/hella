/**
 * A list of {@link Filter} implementations
 */
class Filters {
  /**
   * Create a new list of filters
   *
   * An intial list of {@link Filter} objects may be supplied.
   * If `filters` is not provided an empty list is used as default.
   *
   * @param {Array.<Filter>?} filters
   */
  constructor(filters = []) {
    /**
     * List of filters currently available to the structure
     *
     * @type {Array.<Filter>}
     */
    this.filters = filters;
  }

  /**
   * Add a new {@link Filter} at the given `position`
   *
   * If no position is given the {@link Filter} is appended
   *
   * @param {Filter} filter
   * @param {int|Infinity} position
   */
  addFilter(filter, position = Infinity) {
    this.filters.splice(position, 0, filter);
  }

  /**
   * Replace an already registered {@link Filter} instance with a new one
   *
   * @param {Filter} oldFilter
   * @param {Filter} newFilter
   *
   * @throws {Error} if `oldFilter` could not be found for replacement
   */
  replaceFilter(oldFilter, newFilter) {
    const oldFilterIndex = this.filters.indexOf(oldFilter);
    if (oldFilterIndex === -1) {
      throw new Error(`Tried to replace Filter, but the provided filter could not be found.`);
    }

    this.replaceFilterAt(oldFilterIndex, newFilter);
  }

  /**
   * Replace the {@link Filter} at a specific index
   *
   * @param {int} position
   * @param {Filter} newFilter
   *
   * @throws {Error} if `position` is out of bounds
   */
  replaceFilterAt(position, newFilter) {
    if (position > this.filters.length - 1 || position < 0) {
      throw new Error(`Filter could not be replaced: Replacement position is out of bounds (0-${this.filters.length}): ${position}`);
    }

    this.filters[position] = newFilter;
  }
}

export default Filters;
