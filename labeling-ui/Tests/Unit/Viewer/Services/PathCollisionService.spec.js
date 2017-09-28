import PathCollisionService from '../../../../Application/Common/Services/PathCollisionService';

describe('PathCollisionService test', () => {
  function createService() {
    return new PathCollisionService();
  }

  function createShapes() {
    return [
      {
        'points': [
          {x: 100, y: 90},
          {x: 80, y: 70 },
          {x: 60, y: 75 },
        ],
      },
      {
        'points': [
          {x: 200, y: 300},
          {x: 100, y: 150 },
          {x: 50, y: 100 },
        ],
      },
    ];
  }

  function createSnappedShapes() {
    return [
      {
        'points': [
          {x: 100, y: 90},
          {x: 80, y: 70 },
          {x: 60, y: 75 },
        ],
      },
      {
        'points': [
          {x: 200, y: 300},
          {x: 100, y: 150 },
          {x: 100, y: 90 },
        ],
      },
    ];
  }

  it('should be instantiable', () => {
    const service = createService();
    expect(service).toEqual(jasmine.any(PathCollisionService));
  });

  it('should reset shapes when new shapes are set', () => {
    const service = createService();
    service.setShapes([{'id': 1}, {'id': 2}]);
    service.setShapes([{'id': 3}]);

    expect(service.shapes).toEqual([{'id': 3}]);
  });

  it('should find a collision for given point', () => {
    const service = createService();
    const shapes = createShapes();
    service.setShapes(shapes);
    const snapPoint = service.collisionForPoint({x: 95, y: 85});

    expect(service.shapes.length).toEqual(2);
    expect(snapPoint).toEqual({x: 100, y: 90});
  });

  it('should not find a collision for given point', () => {
    const service = createService();
    const shapes = createShapes();

    service.setShapes(shapes);
    const snapPoint = service.collisionForPoint({x: 1, y: 1});

    expect(service.shapes.length).toEqual(2);
    expect(snapPoint).toEqual(undefined);
  });

  it('should find a shape that is snapped to a moving shape', () => {
    const service = createService();
    const shapes = createSnappedShapes();

    service.setShapes(shapes);
    const result = service.getConnectedShapeAndIndicesForMovingShape(shapes[1]);

    expect(result.connectedShape).toEqual(shapes[0]);
    expect(result.shapesIndices).toEqual([{connectedShapeIndex: 0, movedShapeIndex: 2}]);
  });
});
