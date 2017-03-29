import InterpolationService from 'Application/LabelingData/Services/InterpolationService';
fdescribe('Interpolation with PouchDB Spec', () => {
  const interpolationTypeId = 'linear';
  const featureFlag = {pouchdb: false};
  let interpolationService;
  let interpolations;
  
  
  let cacheMock;
  
  function createInterpolationService() {
    interpolationService = new InterpolationService(null, null, cacheMock, null, featureFlag, null, null, interpolations);
  }
  
  beforeEach(() => {
    cacheMock = jasmine.createSpyObj('cache', ['container']);
    const firstInterpolation = jasmine.createSpyObj('firstInterpolation', ['execute']);
    firstInterpolation.execute.and.returnValue({then: () => {}});
    firstInterpolation.id = interpolationTypeId;
    interpolations = firstInterpolation;
    
  });
  it('It can be instantiate', () => {
    createInterpolationService();
    expect(interpolationService).toEqual(jasmine.any(InterpolationService));
  });
  describe('interpolate()', () => {
    let cacheContainerMock;
    const labeledThing = {id: 'thing-id', task: {id: 'some-task-id'}};
    const frameRange = {startFrameIndex: 17, endFrameIndex: 18};
    
    beforeEach(() => {
      cacheContainerMock = jasmine.createSpyObj('container', ['invalidate', 'get']);
      cacheMock.container.and.returnValue(cacheContainerMock);
    });
    it('Throws if interpolation id is unknown', () => {
      createInterpolationService();
      const id = 'Unknown';
      function throwWrapper() {
        interpolationService.interpolate(id);
      }
      expect(throwWrapper).toThrowError(`Interpolation with id '${id}' is not currently registered on the InterpolationService.`);
    });
    it('invalidates the caches', () => {
      createInterpolationService();
      
      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.${labeledThing.id}`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.complete`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.endFrameIndex}.${labeledThing.id}`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.endFrameIndex}.complete`);
    });
    it('does not invalidates the caches for non-ghosts', () => {
      const cacheData = [{id: '1'}, {id: '2'}];
      cacheContainerMock.get.and.returnValue(cacheData);
      createInterpolationService();
    
      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).not.toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.1`);
      expect(cacheContainerMock.invalidate).not.toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.2`);
    });
    it('invalidates the caches for non-ghosts', () => {
      const cacheData = [{id: '1',labeledThingId:labeledThing.id}, {id: '2', labeledThingId:labeledThing.id}];
      cacheContainerMock.get.and.returnValue(cacheData);
      createInterpolationService();
    
      interpolationService.interpolate(interpolationTypeId, null, labeledThing, frameRange);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.1`);
      expect(cacheContainerMock.invalidate).toHaveBeenCalledWith(`${labeledThing.task.id}.${frameRange.startFrameIndex}.2`);
    })
  });
});

