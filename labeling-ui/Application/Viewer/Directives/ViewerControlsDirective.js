import viewerControlsTempate from './ViewerControlsDirective.html!';

/**
 * @class ViewerControlsDirective
 * @ngdoc directive
 */
export default class ViewerControlsDirective {
  constructor() {
    this.template = viewerControlsTempate;
    this.scope = {
      frameForward: '&',
      frameBackward: '&',
    };
  }
}
