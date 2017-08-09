import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import initialTaskDataResolver from '../../../Application/Task/Resolvers/InitialDataResolver';
import taskFixture from '../../Fixtures/Models/Frontend/Task';
import projectFixture from '../../Fixtures/Models/Frontend/Project';
import videoFixture from '../../Fixtures/Models/Frontend/Video';

describe('Initial Task Data Resolver', () => {
  let angularQ;
  let rootScope;
  let stateParamsMock;
  let taskGatewayMock;
  let projectGatewayMock;
  let videoGatewayMock;
  let imagePreloaderMock;
  let taskReplicationServiceMock;
  let organisationServiceMock;
  let frameIndexServiceMock;
  let task;
  let project;
  let video;

  function callInitialTaskDataResolver() {
    const callableFn = initialTaskDataResolver[initialTaskDataResolver.length - 1];
    return callableFn(
      angularQ,
      rootScope,
      stateParamsMock,
      taskGatewayMock,
      projectGatewayMock,
      videoGatewayMock,
      imagePreloaderMock,
      taskReplicationServiceMock,
      organisationServiceMock,
      frameIndexServiceMock
    );
  }

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    task = taskFixture.clone();
    project = cloneDeep(projectFixture);
    video = cloneDeep(videoFixture);
  });

  beforeEach(() => {
    stateParamsMock = {
      organisationId: 'ORGANISATION-ORGANISATION',
      projectId: project.id,
      taskId: task.id,
    };

    taskGatewayMock = jasmine.createSpyObj('TaskGateway', ['getTask']);
    projectGatewayMock = jasmine.createSpyObj('ProjectGateway', ['getProject']);
    videoGatewayMock = jasmine.createSpyObj('VideoGateway', ['getVideo']);
    imagePreloaderMock = jasmine.createSpyObj('ImagePreloader', ['preloadImages']);
    taskReplicationServiceMock = jasmine.createSpyObj('TaskReplicationService', ['replicateTaskDataToLocalMachine']);
    organisationServiceMock = jasmine.createSpyObj('OrganisationService', ['set']);
    frameIndexServiceMock = jasmine.createSpyObj('FrameIndexService', ['setTask', 'getFrameIndexLimits']);
  });

  beforeEach(() => {
    taskGatewayMock.getTask.and.returnValue(angularQ.resolve(task));
    projectGatewayMock.getProject.and.returnValue(angularQ.resolve(project));
    videoGatewayMock.getVideo.and.returnValue(angularQ.resolve(video));
    imagePreloaderMock.preloadImages.and.returnValue(angularQ.resolve([]));
    taskReplicationServiceMock.replicateTaskDataToLocalMachine.and.returnValue(angularQ.resolve());
  });

  it('should be callable', () => {
    expect(() => callInitialTaskDataResolver()).not.toThrow();
  });

  it('should return a promise', () => {
    const returnValue = callInitialTaskDataResolver();
    expect(returnValue.then).toEqual(jasmine.any(Function));
  });

  it('should load task based on stateParams taskid', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(taskGatewayMock.getTask).toHaveBeenCalledWith(task.id);
  });

  it('should load project based on stateParams projectid', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(projectGatewayMock.getProject).toHaveBeenCalledWith(project.id);
  });

  it('should tell the organisation service, which orga is active', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(organisationServiceMock.set).toHaveBeenCalledWith(stateParamsMock.organisationId);
  });

  it('should tell the frameIndexService which task is active', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(frameIndexServiceMock.setTask).toHaveBeenCalledWith(task);
  });

  it('should resolve to task, video', () => {
    const returnValue = callInitialTaskDataResolver();
    const resolveSpy = jasmine.createSpy('intialTaskResolver resolve');
    returnValue.then(resolveSpy);
    rootScope.$apply();
    expect(resolveSpy).toHaveBeenCalledWith({task, video});
  });

  it('should initiate task data replication from couchdb to local pouchdb', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(taskReplicationServiceMock.replicateTaskDataToLocalMachine).toHaveBeenCalledWith(project, task);
  });

  it('should trigger preload of the first 50 images', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(imagePreloaderMock.preloadImages).toHaveBeenCalledWith(task, 50);
  });

  it('should not resolve final promise, before all requested promises are resolved', () => {
    const taskGatewayDeferred = angularQ.defer();
    taskGatewayMock.getTask.and.returnValue(taskGatewayDeferred.promise);
    const projectGatewayDeferred = angularQ.defer();
    projectGatewayMock.getProject.and.returnValue(projectGatewayDeferred.promise);
    const imagePreloaderDeferred = angularQ.defer();
    imagePreloaderMock.preloadImages.and.returnValue(imagePreloaderDeferred.promise);
    const videoGatewayDeferred = angularQ.defer();
    videoGatewayMock.getVideo.and.returnValue(videoGatewayDeferred.promise);
    const taskReplicationDeferred = angularQ.defer();
    taskReplicationServiceMock.replicateTaskDataToLocalMachine.and.returnValue(taskReplicationDeferred.promise);

    const returnValue = callInitialTaskDataResolver();
    const resolveSpy = jasmine.createSpy('intialTaskResolver resolve');
    returnValue.then(resolveSpy);
    rootScope.$apply();

    expect(resolveSpy).not.toHaveBeenCalled();

    taskGatewayDeferred.resolve(task);
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    projectGatewayDeferred.resolve(project);
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    videoGatewayDeferred.resolve(video);
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    taskReplicationDeferred.resolve();
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    imagePreloaderDeferred.resolve([]);
    rootScope.$apply();

    expect(resolveSpy).toHaveBeenCalled();
  });
});
