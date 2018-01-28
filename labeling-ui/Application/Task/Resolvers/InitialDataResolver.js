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
  'modalService',
  ($q, $rootScope, $stateParams, taskGateway, projectGateway, videoGateway, imagePreloader, taskReplicationService, organisationService, frameIndexService, modalService) => {
    organisationService.set($stateParams.organisationId);

    const resolverResult = {};

    const loadProject = () => projectGateway.getProject($stateParams.projectId);
    const loadTask = () => taskGateway.getTask($stateParams.taskId);
    const replicateTaskData = (project, task) => taskReplicationService.replicateTaskDataToLocalMachine(project, task);
    const loadVideo = task => videoGateway.getVideo(task.videoId);
    const preloadImages = task => imagePreloader.preloadImages(task, 10);

    return $q.resolve()
      .then(() => $q.all([loadProject(), loadTask()]))
      .then(([project, task]) => {
        resolverResult.task = task;
        frameIndexService.setTask(task);
        return $q.all([loadVideo(task), replicateTaskData(project, task)]);
      })
      .then(([video]) => {
        resolverResult.video = video;
      })
      .then(() => {
        return preloadImages(resolverResult.task);
      })
      .catch(() => {
        modalService.info(
          {
            title: 'Error',
            headline: 'Failed to preload images',
            message: 'Failed to preload images. Please contact the label-manager or support!',
          },
          () => $q.resolve(),
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );

        return $q.reject();
      })
      .then(() => resolverResult);
  },
];
