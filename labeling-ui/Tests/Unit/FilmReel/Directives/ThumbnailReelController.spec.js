import ThumbnailReelController from 'Application/FilmReel/Directives/ThumbnailReelController';

fdescribe('ThumbnailReelController tests', () => {
  it('can be created', () => {
    const scope = jasmine.createSpyObj('$scope', ['$on']);
    const window = jasmine.createSpyObj('$window', ['addEventListener']);
    const animationFrameService = jasmine.createSpyObj('animationFrameService', ['debounce']);
    animationFrameService.debounce.and.returnValue(() => {});

    const directive = new ThumbnailReelController(
      scope,
      null,   // $rootScope
      window,
      null,   // $element
      null,   // $q
      null,   // abortablePromiseFactory
      null,   // frameLocationGateway
      null,   // labeledThingInFrameGateway
      null,   // labeledThingGateway
      animationFrameService
    );
    expect(directive).toEqual(jasmine.any(ThumbnailReelController));
  });
});