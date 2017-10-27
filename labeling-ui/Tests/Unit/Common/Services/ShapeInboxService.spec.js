import {inject} from 'angular-mocks';
import ShapeInboxService from 'Application/Common/Services/ShapeInboxService';

describe('ShapeInboxService', () => {
  let rootScope;
  let angularQ;
  let shapeInboxObjectServiceMock;
  let shapeInboxLabelServiceMock;
  let shape1;
  let shape2;
  let shape3;
  let allShapes;
  let shapesTwoAndThree;
  let shapeObject1;
  let shapeObject2;
  let shapeObject3;
  let allShapeObjects;
  let shapeObjectsOneAndThree;

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    shapeInboxObjectServiceMock = jasmine.createSpyObj('ShapeInboxObjectService', ['getInboxObject']);
    shapeInboxLabelServiceMock = jasmine.createSpyObj(
      'ShapeInboxLabelService',
      [
        'getLabelForLabelStructureObjectAndLabeledThing',
        'setLabelForLabelThing',
      ]
    );
  });

  beforeEach(() => {
    shape1 = {id: 'foobar'};
    shape2 = {id: 'heinz'};
    shape3 = {id: 'berddasbrot'};
    allShapes = [shape1, shape2, shape3];
    shapesTwoAndThree = [shape2, shape3];
    shapeObject1 = {shape: shape1, label: 'Rectangle #3', labelStructureObject: {}};
    shapeObject2 = {shape: shape2, label: 'Pedestrian #1', labelStructureObject: {}};
    shapeObject3 = {shape: shape3, label: 'Car #2', labelStructureObject: {}};
    allShapeObjects = [shapeObject1, shapeObject2, shapeObject3];
    shapeObjectsOneAndThree = [shapeObject1, shapeObject3];
  });

  beforeEach(() => {
    shapeInboxObjectServiceMock.getInboxObject.and.callFake(
      shape => angularQ.resolve(
        allShapeObjects.find(candidate => candidate.shape === shape)
      )
    );
  });

  function createShapeInboxService() {
    return new ShapeInboxService(
      angularQ,
      shapeInboxObjectServiceMock,
      shapeInboxLabelServiceMock,
    );
  }

  it('can be created', () => {
    const inbox = createShapeInboxService();
    expect(inbox).toEqual(jasmine.any(ShapeInboxService));
  });

  describe('addShape', () => {
    it('only adds a shape once', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape1);

      expect(inbox.count()).toEqual(1);
    });

    it('adds two different shapes', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);

      expect(inbox.count()).toEqual(2);
    });
  });

  describe('addShapes', () => {
    it('adds multiple shapes with one call', () => {
      const inbox = createShapeInboxService();

      inbox.addShapes(allShapes);

      expect(inbox.count()).toEqual(3);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith(allShapeObjects);
    });

    it('only adds the shapes once', () => {
      const inbox = createShapeInboxService();

      inbox.addShapes(allShapes);
      inbox.addShapes(allShapes);

      expect(inbox.count()).toEqual(3);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith(allShapeObjects);
    });

    it('does not remove previously added shapes', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShapes(shapesTwoAndThree);

      expect(inbox.count()).toEqual(3);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith(allShapeObjects);
    });
  });

  describe('removeShape', () => {
    it('does nothing if the shape is not known', () => {
      const inbox = createShapeInboxService();

      inbox.removeShape(shape1);

      expect(inbox.count()).toEqual(0);
    });

    it('removes a previously added shape', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      expect(inbox.count()).toEqual(1);

      inbox.removeShape(shape1);
      expect(inbox.count()).toEqual(0);
    });

    it('only removes a shape once', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      expect(inbox.count()).toEqual(1);

      inbox.removeShape(shape1);
      inbox.removeShape(shape1);
      expect(inbox.count()).toEqual(0);
    });

    it('removes the correct shape', () => {
      const inbox = createShapeInboxService();
      const allShapesExpected = [shapeObject2];

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.removeShape(shape1);

      expect(inbox.count()).toEqual(1);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith(allShapesExpected);
    });
  });

  describe('getAllShapeInformations', () => {
    it('returns an empty array by default', () => {
      const inbox = createShapeInboxService();

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith([]);
    });

    it('returns an array with all the shapes', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.addShape(shape3);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith(allShapeObjects);

      inbox.removeShape(shape2);

      const oneAndThreeShapesPromise = inbox.getAllShapeInformations();
      const oneAndThreeShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      oneAndThreeShapesPromise.then(oneAndThreeShapesPromiseSpy);

      rootScope.$apply();

      expect(oneAndThreeShapesPromiseSpy).toHaveBeenCalledWith(shapeObjectsOneAndThree);
    });
  });

  describe('clear', () => {
    it('does nothing by default', () => {
      const inbox = createShapeInboxService();
      inbox.clear();
      expect(inbox.count()).toEqual(0);
    });

    it('removes all the shapes', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape2);
      inbox.addShape(shape3);
      inbox.clear();

      expect(inbox.count()).toEqual(0);

      const allShapesPromise = inbox.getAllShapeInformations();
      const allShapesPromiseSpy = jasmine.createSpy('getAllShapeInformations resolved');
      allShapesPromise.then(allShapesPromiseSpy);

      rootScope.$apply();

      expect(allShapesPromiseSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('count()', () => {
    it('returns 0 by default', () => {
      const inbox = createShapeInboxService();
      expect(inbox.count()).toEqual(0);
    });

    // All other test cases can be found within the addShape and removeShape test cases
  });

  describe('hasShape', () => {
    it('returns false if the shape is not known', () => {
      const inbox = createShapeInboxService();
      expect(inbox.hasShape(shape1)).toEqual(false);
    });

    it('returns true if the shape is known', () => {
      const inbox = createShapeInboxService();

      inbox.addShape(shape1);
      inbox.addShape(shape3);

      expect(inbox.hasShape(shape1)).toEqual(true);
      expect(inbox.hasShape(shape2)).toEqual(false);
      expect(inbox.hasShape(shape3)).toEqual(true);
    });
  });
});
