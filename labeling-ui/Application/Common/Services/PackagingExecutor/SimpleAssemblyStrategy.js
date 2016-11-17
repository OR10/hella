/**
 * Most simplest strategy which processes each entry in the assembly serialized by itself.
 *
 * @implements AssemblyStrategy
 */
class SimpleAssemblyStrategy {
  /**
   * @param {string} action
   * @param {Array.<Job>} jobs
   * @param {int} currentBoundary
   *
   * @return {int}
   */
  getPackageBoundary(action, jobs, currentBoundary) { // eslint-disable-line no-unused-vars
    // New boundary is always after the first element in the assembly
    return 1;
  }
}

export default SimpleAssemblyStrategy;
