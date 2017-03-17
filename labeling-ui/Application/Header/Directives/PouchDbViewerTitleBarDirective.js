import PouchDbViewerTitleBarController from './PouchDbViewerTitleBarController';

import ViewerTitleBarDirective from './ViewerTitleBarDirective';

/**
 * Directive to display the header bar of the page
 */
class PouchDbViewerTitleBarDirective extends ViewerTitleBarDirective {
  constructor() {
    super();
    this.controller = PouchDbViewerTitleBarController;
  }
}

export default PouchDbViewerTitleBarDirective;
