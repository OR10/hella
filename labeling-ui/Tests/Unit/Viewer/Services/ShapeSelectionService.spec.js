import ShapeSelectionService from 'Application/Common/Services/ShapeSelectionService';

class MockShape {
  constructor(id) {
    this.id = id;
  }

  select() {
  }

  deselect() {
  }
}

class Rectangle extends MockShape {
}

class Cuboid extends MockShape {
}

describe('ShapeSelectionService tests', () => {
  let drawingContextMock;

  function createRectangle(id = 'some-rectangle-id') {
    const rectangle = new Rectangle(id);
    spyOn(rectangle, 'select');
    spyOn(rectangle, 'deselect');
    return rectangle;
  }

  function createCuboid(id = 'some-cuboid-id') {
    const cuboid = new Cuboid(id);
    spyOn(cuboid, 'select');
    spyOn(cuboid, 'deselect');
    return cuboid;
  }

  function createShapeSelectionService(drawingContext = drawingContextMock) {
    const service = new ShapeSelectionService();
    if (drawingContext !== null) {
      service.setDrawingContext(drawingContext);
    }
    return service;
  }

  beforeEach(() => {
    drawingContextMock = jasmine.createSpyObj('DrawingContext', ['withScope']);
    drawingContextMock.withScope.and.callFake(callback => callback());
  });

  it('can be created', () => {
    const service = createShapeSelectionService();
    expect(service).toEqual(jasmine.any(ShapeSelectionService));
  });

  describe('toggleShape', () => {
    it('adds a shape', () => {
      const service = createShapeSelectionService();
      const shape = createRectangle();

      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalled();
      expect(service.count()).toEqual(1);
    });

    it('removes a shape', () => {
      const service = createShapeSelectionService();
      const shape = createCuboid();

      service.toggleShape(shape);
      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalledTimes(1);
      expect(shape.deselect).toHaveBeenCalledTimes(1);
      expect(service.count()).toEqual(0);
    });

    it('adds two shapes', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalled();
      expect(shapeTwo.select).toHaveBeenCalled();
      expect(service.count()).toEqual(2);
    });

    it('selects all the shapes when adding a new shape', () => {
      const service = createShapeSelectionService();
      const shapeOne = createRectangle('some-id-1');
      const shapeTwo = createRectangle('some-id-2');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalledTimes(2);
    });

    it('adds three shapes and removes one shape', () => {
      const service = createShapeSelectionService();
      const shapeOne = createRectangle('some-id-1');
      const shapeTwo = createRectangle('some-id-2');
      const shapeThree = createRectangle('some-id-3');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalled();
      expect(shapeTwo.select).toHaveBeenCalled();
      expect(shapeTwo.deselect).toHaveBeenCalled();
      expect(shapeThree.select).toHaveBeenCalled();
      expect(service.count()).toEqual(2);
    });

    it('only allows shapes of the same type', () => {
      const service = createShapeSelectionService();
      const cuboid = createCuboid();
      const rectangle = createRectangle();

      service.toggleShape(cuboid);
      service.toggleShape(rectangle);
      const count = service.count();
      const selectedShape = service.getSelectedShape();

      expect(selectedShape).toBe(cuboid);
      expect(count).toEqual(1);
    });
  });

  describe('count()', () => {
    it('returns 0 by default', () => {
      const service = createShapeSelectionService();

      const count = service.count();

      expect(count).toEqual(0);
    });
  });

  describe('clear', () => {
    it('removes all the shapes and deselects them', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');
      const shapeThree = createCuboid('some-id-3');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);

      service.clear();
      const count = service.count();

      expect(shapeOne.deselect).toHaveBeenCalled();
      expect(shapeTwo.deselect).toHaveBeenCalled();
      expect(shapeThree.deselect).toHaveBeenCalled();
      expect(count).toEqual(0);
    });
  });

  describe('setSelectedShape', () => {
    it('removes all previous shapes and only sets this one', () => {
      const service = createShapeSelectionService();
      const shapeOne = createRectangle('some-id-1');
      const shapeTwo = createRectangle('some-id-2');
      const shapeThree = createRectangle('some-id-3');
      const shapeFour = createRectangle('some-id-4');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);
      service.setSelectedShape(shapeFour);
      const count = service.count();

      expect(shapeOne.deselect).toHaveBeenCalled();
      expect(shapeTwo.deselect).toHaveBeenCalled();
      expect(shapeThree.deselect).toHaveBeenCalled();
      expect(shapeFour.select).toHaveBeenCalled();
      expect(count).toEqual(1);
    });
  });

  describe('getSelectedShape', () => {
    it('returns the shape set via setSelectedShape', () => {
      const service = createShapeSelectionService();
      const shape = createRectangle();

      service.setSelectedShape(shape);
      const selectedShape = service.getSelectedShape();

      expect(selectedShape).toBe(shape);
    });

    it('returns the first shape set via toggleShaoe', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');
      const shapeThree = createCuboid('some-id-3');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);
      const selectedShape = service.getSelectedShape();

      expect(selectedShape).toBe(shapeOne);
    });
  });

  describe('getAllShapes', () => {
    it('returns an empty array by default', () => {
      const service = createShapeSelectionService();

      const allShapes = service.getAllShapes();

      expect(allShapes).toEqual(jasmine.any(Array));
      expect(allShapes.length).toEqual(0);
    });

    it('returns all the shapes as array', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');
      const shapeThree = createCuboid('some-id-3');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.toggleShape(shapeThree);
      const allShapes = service.getAllShapes();

      expect(allShapes).toEqual(jasmine.any(Array));
      expect(allShapes.length).toEqual(3);
      expect(allShapes[0]).toBe(shapeOne);
      expect(allShapes[1]).toBe(shapeTwo);
      expect(allShapes[2]).toBe(shapeThree);
    });
  });

  describe('removeShape()', () => {
    it('deselects the shape, even if it is not known to the service', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');

      service.removeShape(shapeOne);

      expect(shapeOne.deselect).toHaveBeenCalled();
      expect(service.count()).toEqual(0);
    });

    it('removes the shape from the selected shapes', () => {
      const service = createShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);
      service.removeShape(shapeOne);
      const allShapes = service.getAllShapes();

      expect(shapeOne.deselect).toHaveBeenCalled();
      expect(shapeTwo.deselect).not.toHaveBeenCalled();
      expect(service.count()).toEqual(1);
      expect(allShapes[0]).toBe(shapeTwo);
    });
  });

  describe('DrawingContext', () => {
    it('should accept a new drawingContext to be set', () => {
      const service = createShapeSelectionService(null);
      const someContextMock = {};
      expect(() => service.setDrawingContext(someContextMock)).not.toThrow();
    });

    it('should clear the selected shapes once an initial new drawingContext is set', () => {
      const service = createShapeSelectionService(null);
      const someContextMock = {};
      spyOn(service, 'clear');
      service.setDrawingContext(someContextMock);

      expect(service.clear).toHaveBeenCalled();
    });

    it('should not clear the selected shapes if the same drawing context is set again', () => {
      const service = createShapeSelectionService(null);
      const someContextMock = {};

      spyOn(service, 'clear');

      service.setDrawingContext(someContextMock);
      service.setDrawingContext(someContextMock);

      expect(service.clear).toHaveBeenCalledTimes(1);
    });

    it('should clear the selected shapes if the the drawingContext is changed', () => {
      const service = createShapeSelectionService(null);
      const someContextMock = {};
      const someOtherContextMock = {};

      spyOn(service, 'clear');

      service.setDrawingContext(someContextMock);
      service.setDrawingContext(someOtherContextMock);

      expect(service.clear).toHaveBeenCalledTimes(2);
    });
  });
});
