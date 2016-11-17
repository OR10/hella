import AssemblyJob from './PackagingExecutor/AssemblyJob';

class PackagingExecutor {
  /**
   * @param {AssemblyFactory} assemblyFactory
   */
  constructor(assemblyFactory) {
    /**
     * @type {AssemblyFactory}
     * @private
     */
    this._assemblyFactory = assemblyFactory;

    /**
     * Map of all registered Assemblies indexed by their name
     *
     * @type {Map.<string, Assembly>}
     */
    this.assemblies = new Map();
  }

  /**
   * Either find an already existent Assembly with the given name or create, store and return it.
   *
   * @param {string} name
   * @return {Assembly}
   *
   * @private
   */
  _findOrCreateAssembly(name) {
    if (!this.assemblies.has(name)) {
      const assembly = this._assemblyFactory.create(name);
      this.assemblies.set(name, assembly);
    }

    return this.assemblies.get(name);
  }

  /**
   * Enqueue the execution of a specific operation within the correspondingly names assembly
   *
   * The `workFn` is called once its work should start executing. It needs to return a {@link Promise}, which is fulfilled,
   * once its work is complete.
   *
   * The method returns a Promise, which is fulfilled, once the workFn Promise is resolved.
   *
   * @param {name} assemblyName
   * @param {Function} workFn
   *
   * @return {Promise}
   */
  execute(assemblyName, workFn) {
    const assembly = this._findOrCreateAssembly(assemblyName);
    const job = new AssemblyJob(workFn);
    assembly.enqueue(job);

    // Clean the promise return values to not return the encapsulated job
    return new Promise(
      (resolve, reject) => job.getIsFinishedPromise()
        .then((job, ...args) => resolve(...args))
        .catch((job, ...args) => reject(...args))
    );
  }
}

PackagingExecutor.$inject = [
  'assemblyFactory'
];

export default PackagingExecutor;