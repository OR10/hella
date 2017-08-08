import imagePreloadIndicatorTemplate from './ImagePreloadIndicatorDirective.html!';
import ImagePreloadIndicatorController from './ImagePreloadIndicatorController';

/**
 * Directive displaying the image preloading status
 */
class ImagePreloadIndicatorDirective {
  constructor() {
    this.scope = {};

    this.template = imagePreloadIndicatorTemplate;

    this.controller = ImagePreloadIndicatorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default ImagePreloadIndicatorDirective;
