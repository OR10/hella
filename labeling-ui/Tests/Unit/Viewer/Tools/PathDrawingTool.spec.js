import PolygonDrawingTool from 'Application/Viewer/Tools/Polygon/PolygonDrawingTool';
import PolylineDrawingTool from 'Application/Viewer/Tools/Polyline/PolylineDrawingTool';

describe('PathDrawing Tool', () => {
  let rootScope;
  let drawContext;

  beforeEach(() => {
    rootScope = jasmine.createSpyObj('$rootScope', ['$evalAsync']);
    drawContext = jasmine.createSpyObj('drawContext', ['withScope']);
    drawContext.withScope.and.callFake(callback => callback());
  });

  it('3 default minHandles on Polygons', () => {
    const polygonDrawingTool = new PolygonDrawingTool(drawContext, rootScope);
    polygonDrawingTool._toolActionStruct = {options: {}};
    expect(polygonDrawingTool._getMinHandleCountRestriction()).toEqual(3);
  });

  it('2 default minHandles on Polylines', () => {
    const polylineDrawingTool = new PolylineDrawingTool(drawContext, rootScope);
    polylineDrawingTool._toolActionStruct = {options: {}};
    expect(polylineDrawingTool._getMinHandleCountRestriction()).toEqual(2);
  });
});
