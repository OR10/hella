import {module, inject} from 'angular-mocks';
import ThumbnailDirective from 'Application/FilmReel/Directives/ThumbnailDirective';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';
import ToFrameNumberFilterProvider from 'Application/Task/Filters/toFrameNumberFilterProvider';
import AbortablePromise from 'Application/Common/Support/AbortablePromise';

const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

describe('ThumbnailDirective', () => {
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
    location = 'http://example.com/some/nice/thumbnail.jpg',
  ) {
    const dimensionsWidth = 192;
    const dimensionsHeight = 108;
    const isCurrent = true;
    const frameIndexPosition = 423;
    const viewportWidth = 1920;
    const viewportHeight = 1080;

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

  it('should request the image based on the given location', () => {
    const location = 'The ultimate location for an image file';
    renderThumbnailDirective(location);
    expect(frameGatewayMock.getImage).toHaveBeenCalledWith(location);
  });

  it('should render the image-element provided by the frame gateway to its container', () => {
    const image = new Image();
    image.setAttribute('id', 'some-readable-and-findable-id');
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(image))
    );

    renderThumbnailDirective();

    rootScope.$apply();

    const $imageElement = element.find('.thumbnail-image-container > img');
    expect($imageElement.length).toEqual(1);
    expect($imageElement.get(0)).toBe(image);
  });

  it('should load image on change of location attribute', () => {
    const firstLocation = 'The ultimate first location for an image file';
    const secondLocation = 'The ultimate and even better location for another image file';
    renderThumbnailDirective(firstLocation);

    rootScope.$apply();

    scope.location = secondLocation;

    rootScope.$apply();

    expect(frameGatewayMock.getImage).toHaveBeenCalledWith(secondLocation);
  });

  it('should replace image on change of location attribute', () => {
    const firstLocation = 'The ultimate first location for an image file';
    const secondLocation = 'The ultimate and even better location for another image file';

    const firstImage = new Image();
    firstImage.setAttribute('id', 'some-readable-and-findable-id');

    const secondImage = new Image();
    secondImage.setAttribute('id', 'another-cool-and-unique-id-for-an-image');

    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(firstImage))
    );

    renderThumbnailDirective(firstLocation);

    rootScope.$apply();

    scope.location = secondLocation;
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(secondImage))
    );

    rootScope.$apply();

    const $imageElement = element.find('.thumbnail-image-container > img');
    expect($imageElement.length).toEqual(1);
    expect($imageElement.get(0)).toBe(secondImage);
  });

  it('should have no displayed image if location is null', () => {
    renderThumbnailDirective(null);

    rootScope.$apply();

    const $imageElement = element.find('.thumbnail-image-container > img');
    expect($imageElement.length).toEqual(0);
  });

  it('should remove but not load another image if location is changed to null', () => {
    const image = new Image();
    image.setAttribute('id', 'some-readable-and-findable-id');
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(image))
    );

    renderThumbnailDirective();

    rootScope.$apply();

    scope.location = null;

    rootScope.$apply();

    const $imageElement = element.find('.thumbnail-image-container > img');
    expect($imageElement.length).toEqual(0);
  });

  it('should abort loading promise if location change occurs during image loading', () => {
    const secondLocation = 'some awesome location';
    const secondImage = new Image();
    secondImage.setAttribute('id', 'another-cool-and-unique-id-for-an-image');

    const firstImageLoadPromise = createAbortablePromise(angularQ.defer().promise);
    spyOn(firstImageLoadPromise, 'abort').and.callThrough();

    frameGatewayMock.getImage.and.returnValue(
      firstImageLoadPromise
    );

    renderThumbnailDirective();

    rootScope.$apply();

    expect(firstImageLoadPromise.abort).not.toHaveBeenCalled();

    scope.location = secondLocation;
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(secondImage))
    );

    rootScope.$apply();

    expect(firstImageLoadPromise.abort).toHaveBeenCalled();
  });

  it('should set the image width and height to the maximum within the container', () => {
    const image = new Image();
    image.setAttribute('id', 'some-readable-and-findable-id');
    frameGatewayMock.getImage.and.returnValue(
      createAbortablePromise(angularQ.resolve(image))
    );

    renderThumbnailDirective();

    rootScope.$apply();

    const $imageElement = element.find('.thumbnail-image-container > img');
    expect($imageElement.attr('width')).toEqual('100%');
    expect($imageElement.attr('height')).toEqual('100%');
  });
});

