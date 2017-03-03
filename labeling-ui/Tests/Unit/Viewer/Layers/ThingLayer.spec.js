import {inject} from 'angular-mocks';
import ThingLayer from 'Application/Viewer/Layers/ThingLayer';
import PanAndZoomPaperLayer from 'Application/Viewer/Layers/PanAndZoomPaperLayer';

fdescribe('ThingLayer test suite', function() {
  let injector;
  let scope;
  let drawingContext;

  // Service mocks
  let loggerService;
  let toolService;
  let viewerMouseCursorService;

  beforeEach(module(($provide) => {
    // Service mocks
    loggerService = jasmine.createSpyObj('$logger', ['groupStart', 'log', 'groupEnd', 'groupStartOpened']);
    $provide.service('loggerService', () => loggerService);

    toolService = jasmine.createSpyObj('toolService', ['getTool']);
    $provide.service('toolService', () => toolService);

    viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['setMouseCursor']);
    $provide.service('viewerMouseCursorService', () => viewerMouseCursorService);
  }));

  beforeEach(inject(($injector, $rootScope) => {
    injector = $injector;
    scope = $rootScope.$new();
  }));

  function createThingLayerInstance() {
    const drawingContext = jasmine.createSpyObj('drawingContext', ['withScope']);
    drawingContext.withScope.and.callFake((callback) => callback(scope));

    const framePosition = jasmine.createSpyObj('framePosition', ['beforeFrameChangeAlways', 'afterFrameChangeAlways']);

    return new ThingLayer(0, 0, scope, injector, drawingContext, toolService, null, loggerService, null, framePosition, viewerMouseCursorService);
  }

  it('is a PanAndZoomPaperLayer', function() {
    const thing = createThingLayerInstance();
    expect(thing).toEqual(jasmine.any(PanAndZoomPaperLayer));
  });

  it('updates the view when leaving the canvas', function() {
    const task = {
      minimalVisibleShapeOverflow: null
    };

    scope.view = jasmine.createSpyObj('scope.view', ['update']);
    scope.vm = { task: task };

    const keyboardTool = jasmine.createSpyObj('keyboardTool', ['invokeKeyboardShortcuts']);
    toolService.getTool.and.returnValue(keyboardTool);

    const thing = createThingLayerInstance();
    const event = {type: 'mouseenter'};
    thing.activateTool('multi', {});
    thing.dispatchDOMEvent(event);

    expect(scope.view.update).toHaveBeenCalled();
  });
});