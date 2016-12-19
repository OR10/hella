export default [
  'featureFlags',
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'videoGateway',
  'replicationStateService',
  (featureFlags, $q, $rootScope, $stateParams, taskGateway, videoGateway, replicationStateService) => {
    let promise = $q.resolve();
    let task;

    if (featureFlags.pouchdb === true) {
      promise = taskGateway.checkoutTaskFromRemote($stateParams.taskId);
      // @TODO: stop continuous replication right after leaving route
    }

    return promise
    .then(() => {
      replicationStateService.setIsReplicating(true);
      return taskGateway.getTask($stateParams.taskId);
    })
    .then(_task => {
      task = _task;
      return videoGateway.getVideo(task.videoId);
    })
    .then(video => {
      replicationStateService.setIsReplicating(false);
      return {task, video};
    });

  },
];