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
    };

    this.template = FilmReelTemplate;

    this.controller = FilmReelController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default FilmReelDirective;
