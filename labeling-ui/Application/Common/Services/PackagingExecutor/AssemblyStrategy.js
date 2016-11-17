/**
 * Interface of any Strategy implemented for a PackagingExecutor/Assembly.
 *
 * @interface AssemblyStrategy
 */

/**
 * Return a new boundary for package handling based on the current jobs queued for execution.
 *
 * The Assembly will package up all jobs from the start of the list to the given boundary.
 *
 * The action describes which action triggered the boundary update:
 * - Assembly.ACTION_STATE_CHANGE
 * - Assembly.ACTION_JOB_ADDED
 * - Assembly.ACTION_JOB_REMOVED
 *
 * @name AssemblyStrategy#getPackageBoundary
 *
 * @param {string} action
 * @param {Array.<Job>} jobs
 * @param {int} currentBoundary
 */

