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
    this.task = {};
  }
}

ThumbnailReelControllerTestable.prototype.task = null;

fdescribe('ThumbnailReelController tests', () => {

  beforeEach(() => {
    ThumbnailReelController.prototype.task = {};
  });

  it('can be created', () => {
    const scope = jasmine.createSpyObj('$scope', ['$on', '$watch']);
    const rootScope = jasmine.createSpyObj('$rootScope', ['$on']);
    const window = jasmine.createSpyObj('$window', ['addEventListener']);
    const animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    const frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameIndexLimits']);
    const frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    const applicationState = jasmine.createSpyObj('applicationState', ['$watch']);

    animationFrameService.debounce.and.returnValue(() => {});
    frameIndexService.getFrameIndexLimits.and.returnValue({upperLimit: 0, lowerLimit: 0});

    const directive = new ThumbnailReelController(
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
    expect(directive).toEqual(jasmine.any(ThumbnailReelController));
  });
});