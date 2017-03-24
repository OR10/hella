export default [
  'featureFlags',
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'projectGateway',
  'videoGateway',
  'taskReplicationService',
  'organisationService',
  (featureFlags, $q, $rootScope, $stateParams, taskGateway, projectGateway, videoGateway, taskReplicationService, organisationService) => {
    let promise = $q.resolve();
    let task;

    organisationService.set($stateParams.organisationId);

    if (featureFlags.pouchdb === true) {
      promise = promise
        .then(() => $q.all([projectGateway.getProject($stateParams.projectId), taskGateway.getTask($stateParams.taskId)]))
        .then(([projectModel, taskModel]) => {
          task = taskModel;
          return taskReplicationService.replicateTaskDataToLocalMachine(projectModel, taskModel);
        });
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
