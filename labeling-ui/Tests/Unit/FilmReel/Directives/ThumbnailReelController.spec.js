import ThumbnailReelController from 'Application/FilmReel/Directives/ThumbnailReelController';

// Extend the original class, because there are variables that are implictly set by angular which are already
// used in the constructor (task e.g.)
class ThumbnailReelControllerTestable extends ThumbnailReelController {
  constructor($scope,
              $rootScope,
              $window,
              $element,
              $q,
              abortablePromiseFactory,
              frameLocationGateway,
              labeledThingInFrameGateway,
              labeledThingGateway,
              animationFrameService,
              applicationState,
              lockService,
              frameIndexService,
              labeledThingGroupService) {
    super($scope,
      $rootScope,
      $window,
      $element,
      $q,
      abortablePromiseFactory,
      frameLocationGateway,
      labeledThingInFrameGateway,
      labeledThingGateway,
      animationFrameService,
      applicationState,
      lockService,
      frameIndexService,
      labeledThingGroupService);
  }
}

ThumbnailReelControllerTestable.prototype.task = {};

fdescribe('ThumbnailReelController tests', () => {
  let scope;
  let rootScope;
  let window;
  let animationFrameService;
  let frameIndexService;
  let frameLocationGateway;
  let applicationState;

  function createController() {
    return new ThumbnailReelControllerTestable(
      scope,
      rootScope,
      window,
      null,                   // $element
      null,                   // $q
      null,                   // abortablePromiseFactory
      frameLocationGateway,
      null,                   // labeledThingInFrameGateway
      null,                   // labeledThingGateway
      animationFrameService,
      applicationState,
      null,                   // lockService
      frameIndexService,      // frameIndexService
      null                    // labeledThingGroupService
    );
  }

  beforeEach(() => {
    scope = jasmine.createSpyObj('$scope', ['$on', '$watch']);
    rootScope = jasmine.createSpyObj('$rootScope', ['$on']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameIndexLimits']);
    frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    applicationState = jasmine.createSpyObj('applicationState', ['$watch']);

    animationFrameService.debounce.and.returnValue(() => {});
    frameIndexService.getFrameIndexLimits.and.returnValue({upperLimit: 0, lowerLimit: 0});
  });

  it('can be created', () => {
    const directive = createController();
    expect(directive).toEqual(jasmine.any(ThumbnailReelController));
  });

  describe('handleDrop()', () => {

  });
});