import {module, inject} from 'angular-mocks';
import ThumbnailDirective from 'Application/FilmReel/Directives/ThumbnailDirective';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';
import ToFrameNumberFilterProvider from 'Application/Task/Filters/toFrameNumberFilterProvider';
import AbortablePromise from 'Application/Common/Support/AbortablePromise';

const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

fdescribe('ThumbnailDirective', () => {
  let angularQ;
  let rootScope;
  let compile;
  let element;
  let scope;

  let frameGatewayMock;
  let loggerServiceMock;
  let frameIndexServiceMock;
  let framePositionMock;

  function createAbortablePromise(inputPromise) {
    return new AbortablePromise(angularQ, inputPromise, angularQ.defer());
  }

  function renderThumbnailDirective(
    dimensionsWidth = 192,
    dimensionsHeight = 108,
    location = 'http://example.com/some/nice/thumbnail.jpg',
    isCurrent = true,
    frameIndexPosition = 423,
    viewportWidth = 1920,
    viewportHeight = 1080
  ) {
    scope = rootScope.$new();
    scope.dimensions = {
      width: dimensionsWidth,
      height: dimensionsHeight,
    };
    scope.location = location;
    scope.isCurrent = isCurrent;
    framePositionMock.position = frameIndexPosition;
    scope.framePosition = framePositionMock;
    scope.viewport = {
      width: viewportWidth,
      height: viewportHeight,
    };

    element = compile(`
      <thumbnail dimensions="dimensions"
                 location="location"
                 video="video"
                 is-current="isCurrent"
                 frame-position="framePosition"
                 labeled-thing-viewport="viewport"
        ></thumbnail>
    `)(scope);
    scope.$apply();
  }

  beforeEach(() => {
    frameGatewayMock = jasmine.createSpyObj('FrameGateway', ['getImage']);
    loggerServiceMock = jasmine.createSpyObj(
      'LoggerService',
      ['log', 'warn', 'error', 'groupStart', 'groupStartOpenend', 'groupEnd']
    );
    frameIndexServiceMock = jasmine.createSpyObj(
      'FrameIndexService',
      ['setTask', 'getFrameNumber', 'getFrameIndex', 'getNearestFrameIndex', 'getFrameNumberLimits', 'getFrameIndexLimits']
    );
    framePositionMock = jasmine.createSpyObj('FramePosition', ['goto']);
  });

  beforeEach(() => {
    module($provide => {
      $provide.value('frameGateway', frameGatewayMock);
      $provide.value('loggerService', loggerServiceMock);
      $provide.value('frameIndexService', frameIndexServiceMock);
    });
  });

  beforeEach(() => {
    const angularModule = new AnnoStationUnitTestModule();
    angularModule.registerDirective('thumbnail', ThumbnailDirective);
    angularModule.registerFilter('toFrameNumber', ToFrameNumberFilterProvider);
  });

  beforeEach(module('AnnoStation-Unit'));

  beforeEach(inject(($rootScope, $compile, $q) => {
    rootScope = $rootScope;
    compile = $compile;
    angularQ = $q;
  }));

  beforeEach(() => {
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(new Image()))
    );
  });

  it('should be renderable', () => {
    renderThumbnailDirective();
    expect(element.prop('tagName')).toEqual('THUMBNAIL');
  });
});

