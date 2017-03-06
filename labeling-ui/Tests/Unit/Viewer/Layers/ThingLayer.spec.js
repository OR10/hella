import {inject} from 'angular-mocks';
import ThingLayer from 'Application/Viewer/Layers/ThingLayer';
import PanAndZoomPaperLayer from 'Application/Viewer/Layers/PanAndZoomPaperLayer';
import ToolAbortedError from 'Application/Viewer/Tools/Errors/ToolAbortedError';

describe('ThingLayer test suite', () => {
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

    drawingContext = jasmine.createSpyObj('drawingContext', ['withScope']);
    drawingContext.withScope.and.callFake((callback) => callback(scope));
  }));

  beforeEach(inject(($injector, $rootScope) => {
    injector = $injector;
    scope = $rootScope.$new();
  }));

  function createThingLayerInstance() {
    const framePosition = jasmine.createSpyObj('framePosition', ['beforeFrameChangeAlways', 'afterFrameChangeAlways']);

    return new ThingLayer(0, 0, scope, injector, drawingContext, toolService, null, loggerService, null, framePosition, viewerMouseCursorService);
  }

  describe('Creation', () => {
    it('is a PanAndZoomPaperLayer', () => {
      const thing = createThingLayerInstance();
      expect(thing).toEqual(jasmine.any(PanAndZoomPaperLayer));
    });

    describe('Collection watchers', () => {
      beforeEach(() => {
        spyOn(scope, '$watchCollection');
      });

      it('watches the vm.paperGroupShapes collection', () => {
        createThingLayerInstance();
        expect(scope.$watchCollection).toHaveBeenCalledWith('vm.paperGroupShapes', jasmine.any(Function));
      });

      it('watches the vm.paperGroupShapes collection', () => {
        createThingLayerInstance();
        expect(scope.$watchCollection).toHaveBeenCalledWith('vm.paperThingShapes', jasmine.any(Function));
      });
    });
    
    describe('Normal watchers', () => {
      beforeEach(() => {
        spyOn(scope, '$watch');
      });

      it('watches vm.hideLabeledThingsInFrame', () => {
        createThingLayerInstance();
        expect(scope.$watch).toHaveBeenCalledWith('vm.hideLabeledThingsInFrame', jasmine.any(Function));
      });

      it('watches vm.selectedPaperShape', () => {
        createThingLayerInstance();
        expect(scope.$watch).toHaveBeenCalledWith('vm.selectedPaperShape', jasmine.any(Function));
      });
    });
  });

  it('updates the view when leaving the canvas', () => {
    const keyboardTool = jasmine.createSpyObj('keyboardTool', ['invokeKeyboardShortcuts', 'abort']);
    toolService.getTool.and.returnValue(keyboardTool);
    const keyboardPromise = jasmine.createSpyObj('keyboardPromise', ['then']);
    keyboardTool.invokeKeyboardShortcuts.and.returnValue(keyboardPromise);

    const q = jasmine.createSpyObj('$q', ['defer']);

    // const multiTool = new MultiTool(drawingContext, scope, q, loggerService, toolService, viewerMouseCursorService);
    // spyOn(injector, 'instantiate').and.returnValue(multiTool);

    const thing = createThingLayerInstance();
    const event = {type: 'mouseenter'};
    thing.activateTool('multi', {});

    const promiseMock = jasmine.createSpyObj('activeTool.invoke promise mock', ['then', 'catch']);
    promiseMock.then.and.returnValue(promiseMock);
    promiseMock.catch.and.callFake((callback) => {
      const reason = new ToolAbortedError();
      callback(reason);
    });
    spyOn(thing._activeTool, 'invoke').and.returnValue(promiseMock);

    thing.dispatchDOMEvent(event);

    expect(scope.view.update).toHaveBeenCalled();
  });
});