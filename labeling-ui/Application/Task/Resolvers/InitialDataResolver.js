export default [
  'featureFlags',
  '$q',
  '$stateParams',
  'taskGateway',
  'videoGateway',
  (featureFlags, $q, $stateParams, taskGateway, videoGateway) => {
    let promise = $q.resolve();
    let task;

    if (featureFlags.pouchdb === true) {
      promise = taskGateway.checkoutTaskFromRemote($stateParams.taskId);
      // @TODO: stop continuous replication right after leaving route
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