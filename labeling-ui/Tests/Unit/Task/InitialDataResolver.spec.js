import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import initialTaskDataResolver from '../../../Application/Task/Resolvers/InitialDataResolver';
import taskFixture from '../../Fixtures/Models/Frontend/Task';
import projectFixture from '../../Fixtures/Models/Frontend/Project';
import videoFixture from '../../Fixtures/Models/Frontend/Video';
import frameLocationsSourceJpgFixture from '../../Fixtures/Models/Frontend/FrameLocationsSourceJpg';
import frameLocationsThumbnailFixture from '../../Fixtures/Models/Frontend/FrameLocationsThumbnail';

describe('Intial Task Data Resolver', () => {
  let angularQ;
  let rootScope;
  let stateParamsMock;
  let taskGatewayMock;
  let projectGatewayMock;
  let videoGatewayMock;
  let frameLocationGatewayMock;
  let frameGatewayMock;
  let taskReplicationServiceMock;
  let organisationServiceMock;
  let frameIndexServiceMock;
  let task;
  let project;
  let video;
  let frameLocationsSourceJpg;
  let frameLocationsThumbnail;

  function callInitialTaskDataResolver() {
    const callableFn = initialTaskDataResolver[initialTaskDataResolver.length - 1];
    return callableFn(
      angularQ,
      rootScope,
      stateParamsMock,
      taskGatewayMock,
      projectGatewayMock,
      videoGatewayMock,
      frameLocationGatewayMock,
      frameGatewayMock,
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
    frameLocationsSourceJpg = cloneDeep(frameLocationsSourceJpgFixture);
    frameLocationsThumbnail = cloneDeep(frameLocationsThumbnailFixture);
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
    frameLocationGatewayMock = jasmine.createSpyObj('FrameLocationGateway', ['getFrameLocations']);
    frameGatewayMock = jasmine.createSpyObj('FrameGateway', ['preloadImages']);
    taskReplicationServiceMock = jasmine.createSpyObj('TaskReplicationService', ['replicateTaskDataToLocalMachine']);
    organisationServiceMock = jasmine.createSpyObj('OrganisationService', ['set']);
    frameIndexServiceMock = jasmine.createSpyObj('FrameIndexService', ['setTask', 'getFrameIndexLimits']);
  });

  beforeEach(() => {
    taskGatewayMock.getTask.and.returnValue(angularQ.resolve(task));
    projectGatewayMock.getProject.and.returnValue(angularQ.resolve(project));
    videoGatewayMock.getVideo.and.returnValue(angularQ.resolve(video));
    taskReplicationServiceMock.replicateTaskDataToLocalMachine.and.returnValue(angularQ.resolve());
    frameGatewayMock.preloadImages.and.returnValue(angularQ.resolve());

    frameIndexServiceMock.getFrameIndexLimits.and.returnValue({
      lowerLimit: 0,
      upperLimit: 591,
    });

    frameLocationGatewayMock.getFrameLocations.and.callFake((taskId, type) => {
      switch(type) {
        case 'sourceJpg':
          return angularQ.resolve(frameLocationsSourceJpg);
        case 'thumbnail':
          return angularQ.resolve(frameLocationsThumbnail);
        default:
          throw new Error(`Unknown image type ${type}`);
      }
    });
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

  it('should request normal and thumbnail image type frame locations', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(frameLocationGatewayMock.getFrameLocations).toHaveBeenCalledTimes(2);

    const frameLocationCallOne = frameLocationGatewayMock.getFrameLocations.calls.argsFor(0);
    const frameLocationCallTwo = frameLocationGatewayMock.getFrameLocations.calls.argsFor(1);

    expect(frameLocationCallOne).toEqual([task.id, 'sourceJpg', 0, 592]);
    expect(frameLocationCallTwo).toEqual([task.id, 'thumbnail', 0, 592]);
  });

  it('should call preloadImages only once', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(frameGatewayMock.preloadImages).toHaveBeenCalledTimes(1);
  });

  it('should call preload for all locations provided by the frameLocationGateway', () => {
    callInitialTaskDataResolver();
    rootScope.$apply();
    expect(frameGatewayMock.preloadImages).toHaveBeenCalledWith([
      ...frameLocationsSourceJpg,
      ...frameLocationsThumbnail,
    ]);
  });

  it('should not resolve final promise, before all requested promises are resolved', () => {
    const taskGatewayDeferred = angularQ.defer();
    taskGatewayMock.getTask.and.returnValue(taskGatewayDeferred.promise);
    const projectGatewayDeferred = angularQ.defer();
    projectGatewayMock.getProject.and.returnValue(projectGatewayDeferred.promise);
    const videoGatewayDeferred = angularQ.defer();
    videoGatewayMock.getVideo.and.returnValue(videoGatewayDeferred.promise);
    const taskReplicationDeferred = angularQ.defer();
    taskReplicationServiceMock.replicateTaskDataToLocalMachine.and.returnValue(taskReplicationDeferred.promise);
    const frameGatewayDeferred = angularQ.defer();
    frameGatewayMock.preloadImages.and.returnValue(frameGatewayDeferred.promise);

    const frameLocationsSourceJpgDeferred = angularQ.defer();
    const frameLocationsThumbnailDeferred = angularQ.defer();
    frameLocationGatewayMock.getFrameLocations.and.callFake((taskId, type) => {
      switch(type) {
        case 'sourceJpg':
          return frameLocationsSourceJpgDeferred;
        case 'thumbnail':
          return frameLocationsThumbnailDeferred;
        default:
          throw new Error(`Unknown image type ${type}`);
      }
    });

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

    frameLocationsSourceJpgDeferred.resolve(frameLocationsSourceJpg);
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    frameLocationsThumbnailDeferred.resolve(frameLocationsThumbnailDeferred);
    rootScope.$apply();
    expect(resolveSpy).not.toHaveBeenCalled();

    frameGatewayDeferred.resolve();
    rootScope.$apply();
    expect(resolveSpy).toHaveBeenCalled();
  });
});