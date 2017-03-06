import FilmReelTemplate from './FilmReelDirective.html!';
import FilmReelController from './FilmReelController';

/**
 * FilmReel consisting of different {@link ThumbnailDirective}s
 */
class FilmReelDirective {
  constructor() {
    this.scope = {
      framePosition: '=',
      task: '=',
      video: '=',
      filters: '=',
      selectedPaperShape: '=',
      paperThingShapes: '=',
      playing: '=',
      freezeThumbnails: '=',
      readOnly: '@',
    };

    this.template = FilmReelTemplate;

    this.controller = FilmReelController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}

export default FilmReelDirective;
