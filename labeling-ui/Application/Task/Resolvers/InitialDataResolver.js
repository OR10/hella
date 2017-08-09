export default [
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'projectGateway',
  'videoGateway',
  'imagePreloader',
  'taskReplicationService',
  'organisationService',
  'frameIndexService',
  ($q, $rootScope, $stateParams, taskGateway, projectGateway, videoGateway, imagePreloader, taskReplicationService, organisationService, frameIndexService) => {
    organisationService.set($stateParams.organisationId);

    const resolverResult = {};

    const loadProject = () => projectGateway.getProject($stateParams.projectId);
    const loadTask = () => taskGateway.getTask($stateParams.taskId);
    const replicateTaskData = (project, task) => taskReplicationService.replicateTaskDataToLocalMachine(project, task);
    const loadVideo = task => videoGateway.getVideo(task.videoId);
    const preloadImages = task => imagePreloader.preloadImages(task, 50);

    return $q.resolve()
      .then(() => $q.all([loadProject(), loadTask()]))
      .then(([project, task]) => {
        resolverResult.task = task;
        frameIndexService.setTask(task);
        return $q.all([loadVideo(task), replicateTaskData(project, task), preloadImages(task)]);
      })
      .then(([video]) => {
        resolverResult.video = video;
      })
      .then(() => resolverResult);
  },
];
