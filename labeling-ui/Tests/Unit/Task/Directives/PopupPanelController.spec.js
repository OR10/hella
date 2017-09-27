import PopupPanelController from 'Application/Task/Directives/PopupPanelController';

fdescribe('PopupPanelController', () => {
  let element;
  let scope;
  let controller;
  let context;
  let drawingContextService;
  let drawingScope;
  let animationFrameService;
  let window;
  let resizeDebounced;
  let shapeSelectionService;

  beforeEach(inject(($compile, $rootScope) => {
    scope = $rootScope.$new();
    element = $compile('<div></div>')(scope);

    context = jasmine.createSpyObj('context', ['setup', 'withScope']);
    drawingContextService = jasmine.createSpyObj('drawingContextService', ['createContext']);
    drawingScope = jasmine.createSpyObj('drawingScope', ['Layer']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    resizeDebounced = jasmine.createSpy('resizeDebounced');
    shapeSelectionService = jasmine.createSpyObj('shapeSelectionService', ['afterAnySelectionChange']);

    drawingContextService.createContext.and.returnValue(context);
    context.withScope.and.callFake(callback => callback(drawingScope));
    animationFrameService.debounce.and.returnValue(resizeDebounced);
  }));

  beforeEach(() => {
    controller = new PopupPanelController(
      scope,
      window,
      element,
      animationFrameService,
      drawingContextService,
      null, // frameGateway,
      null, // frameLocationGateway,
      null, // abortablePromiseFactory,
      null, // $timeout,
      null, // labelStructureService,
      shapeSelectionService,
      null, // shapeInboxService
    );
  });

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(PopupPanelController));
  });
});