export default [
  'featureFlags',
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'videoGateway',
  'taskReplicationService',
  (featureFlags, $q, $rootScope, $stateParams, taskGateway, videoGateway, taskReplicationService) => {
    let promise = $q.resolve();
    let task;

    if (featureFlags.pouchdb === true) {
      promise = promise
        .then(() => taskReplicationService.replicateTaskDataToLocalMachine($stateParams.projectId, $stateParams.taskId));
    }

    return promise
      .then(() => {
        return taskGateway.getTask($stateParams.taskId);
      })
      .then(_task => {
        task = _task;
        return videoGateway.getVideo(task.videoId);
      })
      .then(video => {
        return {task, video};
      });
  },
];
