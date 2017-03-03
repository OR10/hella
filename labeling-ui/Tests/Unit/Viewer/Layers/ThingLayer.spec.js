import {inject} from 'angular-mocks';
import ThingLayer from 'Application/Viewer/Layers/ThingLayer';
import PanAndZoomPaperLayer from 'Application/Viewer/Layers/PanAndZoomPaperLayer';

fdescribe('ThingLayer test suite', function() {
  let injector;
  let scope;
  let drawingContext;

  let toolService;

  beforeEach(module(($provide) => {
    // Service mocks
    const logger = jasmine.createSpyObj('$logger', ['warn']);
    $provide.service('loggerService', () => logger);

    toolService = jasmine.createSpyObj('toolService', ['']);
    $provide.service('toolService', () => toolService);

    const viewerMouseCursorService = jasmine.createSpyObj('viewerMouseCursorService', ['']);
    $provide.service('viewerMouseCursorService', () => viewerMouseCursorService);
  }));

  beforeEach(inject(($injector, $rootScope) => {
    injector = $injector;
    scope = $rootScope.$new();
  }));

  it('is a PanAndZoomPaperLayer', function() {
    const drawingContext = jasmine.createSpyObj('drawingContext', ['withScope']);
    drawingContext.withScope.and.callFake((callback) => callback());

    const framePosition = jasmine.createSpyObj('framePosition', ['beforeFrameChangeAlways', 'afterFrameChangeAlways']);

    const thing = new ThingLayer(0, 0, scope, injector, drawingContext, toolService, null, null, null, framePosition);
    expect(thing).toEqual(jasmine.any(PanAndZoomPaperLayer));
  });
});