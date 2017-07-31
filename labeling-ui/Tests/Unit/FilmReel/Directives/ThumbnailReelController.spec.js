import ThumbnailReelController from 'Application/FilmReel/Directives/ThumbnailReelController';
import AbortablePromise from 'Application/Common/Support/AbortablePromise';

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

ThumbnailReelControllerTestable.prototype.task = {
  requiredImageTypes: ['thumbnail'],
};

fdescribe('ThumbnailReelController tests', () => {
  let scope;
  let rootScope;
  let window;
  let animationFrameService;
  let frameIndexService;
  let frameLocationGateway;
  let applicationState;
  let labeledThingGateway;
  let promise;
  let lockService;

  function createController() {
    return new ThumbnailReelControllerTestable(
      scope,
      rootScope,
      window,
      null,                   // $element
      promise,
      null,                   // abortablePromiseFactory
      frameLocationGateway,
      null,                   // labeledThingInFrameGateway
      labeledThingGateway,
      animationFrameService,
      applicationState,
      lockService,
      frameIndexService,      // frameIndexService
      null                    // labeledThingGroupService
    );
  }

  beforeEach(inject(($q, $rootScope) => {
    promise = $q;
    scope = $rootScope.$new();
  }));

  beforeEach(() => {
    // scope = jasmine.createSpyObj('$scope', ['$on', '$watch']);
    rootScope = jasmine.createSpyObj('$rootScope', ['$on', '$emit']);
    window = jasmine.createSpyObj('$window', ['addEventListener']);
    animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    frameIndexService = jasmine.createSpyObj('frameIndexService', ['getFrameIndexLimits']);
    frameLocationGateway = jasmine.createSpyObj('frameLocationGateway', ['getFrameLocations']);
    applicationState = jasmine.createSpyObj('applicationState', ['$watch']);
    labeledThingGateway = jasmine.createSpyObj('labeledThingGateway', ['saveLabeledThing']);
    lockService = jasmine.createSpyObj('lockService', ['acquire']);

    animationFrameService.debounce.and.returnValue(() => {});
    frameIndexService.getFrameIndexLimits.and.returnValue({upperLimit: 0, lowerLimit: 0});
    scope.$root = rootScope;
  });

  it('can be created', () => {
    const reel = createController();
    expect(reel).toEqual(jasmine.any(ThumbnailReelController));
  });

  fdescribe('handleDrop()', () => {
    it('sends the framerange:change:after event if the framerange of a LT narrowed', () => {
      const frameIndex = 2;
      const oldStartFrameIndex = 1;
      const currentFrameIndex = 0;

      const reel = createController();
      const index = 0;
      const dragObject = {
        draggable: {
          hasClass: () => true
        },
      };
      const frameRange = {
        startFrameIndex: oldStartFrameIndex,
        endFrameIndex: 4,
      };
      const selectedPaperShape = {
        labeledThingInFrame: {
          labeledThing: {
            frameRange: frameRange
          },
        },
      };
      reel.selectedPaperShape = selectedPaperShape;
      reel.thumbnails = [ {},  { location: { frameIndex: frameIndex } } ];
      reel.framePosition = {position: currentFrameIndex};

      labeledThingGateway.saveLabeledThing.and.returnValue(promise.resolve());
      const frameLocationGatewayPromise = new AbortablePromise(promise, promise.resolve([]), promise.defer());
      frameLocationGateway.getFrameLocations.and.returnValue(frameLocationGatewayPromise);

      reel.handleDrop({}, dragObject, index);
      scope.$apply();

      expect(rootScope.$emit).toHaveBeenCalledWith('framerange:change:after');
    });
  });
});