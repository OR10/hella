/**
 * Value object containing information about a specific replication target identified by a taskId
 */
class TaskReplicationInformation {
  /**
   * @param {{taskId: string, databaseName: string, databaseServer: string}} replicationInformation
   */
  constructor(replicationInformation) {
    /**
     * @type {string}
     */
    this.taskId = replicationInformation.taskId;

    /**
     * @type {string}
     */
    this.databaseName = replicationInformation.databaseName;

    /**
     * @type {string}
     */
    this.databaseServer = replicationInformation.databaseServer;
  }
}

export default TaskReplicationInformation;
