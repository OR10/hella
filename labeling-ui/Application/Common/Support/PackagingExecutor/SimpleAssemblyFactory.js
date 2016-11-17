/**
 * Create an Assembly using the {@link SimpleAssemblyStrategy}
 *
 * @implements AssemblyFactory
 */
class SimpleAssemblyFactory {
  /**
   * @param {SimpleAssemblyStrategy} simpleAssemblyStrategy
   */
  constructor(simpleAssemblyStrategy) {
    /**
     * @type {SimpleAssemblyStrategy}
     * @private
     */
    this._simpleAssemblyStrategy = simpleAssemblyStrategy;
  }

  /**
   * @param {string} name
   * @return {Assembly}
   */
  create(name) {
    return new Assembly(name, this._simpleStrategy);
  }
}

SimpleAssemblyFactory.$inject = [
  'simpleAssemblyStrategy'
];

export default SimpleAssemblyFactory;