export default [
  '$q',
  '$rootScope',
  '$stateParams',
  'taskGateway',
  'projectGateway',
  'videoGateway',
  'frameLocationGateway',
  'frameGateway',
  'taskReplicationService',
  'organisationService',
  'frameIndexService',
  ($q, $rootScope, $stateParams, taskGateway, projectGateway, videoGateway, frameLocationGateway, frameGateway, taskReplicationService, organisationService, frameIndexService) => {
    organisationService.set($stateParams.organisationId);

    const resolverResult = {};

    const loadProject = () => projectGateway.getProject($stateParams.projectId);
    const loadTask = () => taskGateway.getTask($stateParams.taskId);
    const replicateTaskData = (project, task) => taskReplicationService.replicateTaskDataToLocalMachine(project, task);
    const loadVideo = task => videoGateway.getVideo(task.videoId);

    const loadFrameLocations = task => {
      const imageTypePreferences = [['source', 'sourceJpg'], ['thumbnail']];
      const imageTypes = imageTypePreferences
        // Remove all types not available for this task
        .map(typeList => typeList.filter(
          typeCandidate => task.requiredImageTypes.includes(typeCandidate)
        ))
        // Cleanup empty typelists
        .filter(typeList => typeList.length > 0)
        // Take the type from each list with the highest priority
        .map(typeList => typeList[0]);

      const frameIndexLimits = frameIndexService.getFrameIndexLimits();
      return $q.all(
        imageTypes.map(imageType => frameLocationGateway.getFrameLocations(task.id, imageType, 0, frameIndexLimits.upperLimit + 1))
      ).then(frameLocationsForAllTypes => [].concat(...frameLocationsForAllTypes));
    };

    const preloadImages = locations => frameGateway.preloadImages(locations);

    const loadFilterAndPreloadFrameImages = task => $q.resolve()
      .then(() => loadFrameLocations(task))
      .then(preloadImages);

    return $q.resolve()
      .then(() => $q.all([loadProject(), loadTask()]))
      .then(([project, task]) => {
        resolverResult.task = task;
        frameIndexService.setTask(task);
        return $q.all([loadVideo(task), replicateTaskData(project, task), loadFilterAndPreloadFrameImages(task)])
      })
      .then(([video]) => {
        resolverResult.video = video;
      })
      .then(() => resolverResult);
  },
];
