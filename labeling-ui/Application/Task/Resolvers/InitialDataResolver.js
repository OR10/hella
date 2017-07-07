export default [
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'projectGateway',
  'videoGateway',
  'taskReplicationService',
  'organisationService',
  ($q, $rootScope, $stateParams, taskGateway, projectGateway, videoGateway, taskReplicationService, organisationService) => {
    organisationService.set($stateParams.organisationId);

    const resolverResult = {};

    const loadProject = () => projectGateway.getProject($stateParams.projectId);
    const loadTask = () => taskGateway.getTask($stateParams.taskId);
    const replicateTaskData = (project, task) => taskReplicationService.replicateTaskDataToLocalMachine(project, task);
    const loadVideo = task => videoGateway.getVideo(task.videoId);

    return $q.resolve()
      .then(() => $q.all([loadProject(), loadTask()]))
      .then(([project, task]) => {
        resolverResult.task = task;
        return $q.all([loadVideo(task), replicateTaskData(project, task)])
      })
      .then(([video]) => {
        resolverResult.video = video;
      })
      .then(() => resolverResult);
  },
];
