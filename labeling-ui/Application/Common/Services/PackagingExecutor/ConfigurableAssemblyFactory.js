import Assembly from './Assembly';
/**
 * Create an Assembly using the {@link AssemblyStrategy} registered as `assemblyStrategy` at the DIC.
 *
 * @implements AssemblyFactory
 */
class ConfigurableAssemblyFactory {
  /**
   * @param {AssemblyStrategy} assemblyStrategy
   */
  constructor(assemblyStrategy) {
    /**
     * @type {AssemblyStrategy}
     * @private
     */
    this._assemblyStrategy = assemblyStrategy;
  }

  /**
   * @param {string} name
   * @return {Assembly}
   */
  create(name) {
    return new Assembly(name, this._assemblyStrategy);
  }
}

ConfigurableAssemblyFactory.$inject = [
  'assemblyStrategy'
];

export default ConfigurableAssemblyFactory;