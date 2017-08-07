import ShapeSelectionService from 'Application/Common/Services/ShapeSelectionService';

class MockShape {
  constructor(id) {
    this.id = id;
  }
  select() {}
  deselect() {}
}
class Rectangle extends MockShape {}
class Cuboid extends MockShape {}

describe('ShapeSelectionService tests', () => {
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

  it('can be created', () => {
    const service = new ShapeSelectionService();
    expect(service).toEqual(jasmine.any(ShapeSelectionService));
  });

  describe('toggleShape', () => {
    it('adds a shape', () => {
      const service = new ShapeSelectionService();
      const shape = createRectangle();

      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalled();
      expect(service.count()).toEqual(1);
    });

    it('removes a shape', () => {
      const service = new ShapeSelectionService();
      const shape = createCuboid();

      service.toggleShape(shape);
      service.toggleShape(shape);

      expect(shape.select).toHaveBeenCalledTimes(1);
      expect(shape.deselect).toHaveBeenCalledTimes(1);
      expect(service.count()).toEqual(0);
    });

    it('adds two shapes', () => {
      const service = new ShapeSelectionService();
      const shapeOne = createCuboid('some-id-1');
      const shapeTwo = createCuboid('some-id-2');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalled();
      expect(shapeTwo.select).toHaveBeenCalled();
      expect(service.count()).toEqual(2);
    });

    it('selects all the shapes when adding a new shape', () => {
      const service = new ShapeSelectionService();
      const shapeOne = createRectangle('some-id-1');
      const shapeTwo = createRectangle('some-id-2');

      service.toggleShape(shapeOne);
      service.toggleShape(shapeTwo);

      expect(shapeOne.select).toHaveBeenCalledTimes(2);
    });

    it('adds three shapes and removes one shape', () => {
      const service = new ShapeSelectionService();
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
      const service = new ShapeSelectionService();
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
      const service = new ShapeSelectionService();

      const count = service.count();

      expect(count).toEqual(0);
    });
  });

  describe('clear', () => {
    it('removes all the shapes and deselects them', () => {
      const service = new ShapeSelectionService();
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
      const service = new ShapeSelectionService();
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
      const service = new ShapeSelectionService();
      const shape = createRectangle();

      service.setSelectedShape(shape);
      const selectedShape = service.getSelectedShape();

      expect(selectedShape).toBe(shape);
    });

    it('returns the first shape set via toggleShaoe', () => {
      const service = new ShapeSelectionService();
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
});
