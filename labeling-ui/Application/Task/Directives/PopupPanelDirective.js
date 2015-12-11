import popupPanelTemplate from './PopupPanelDirective.html!';
import PopupPanelController from './PopupPanelController';

/**
 * Directive to display the popupPanel bar of the page
 */
class PopupPanelDirective {
  constructor() {
    this.scope = {
      popupPanelState: '=',
      brightnessSliderValue: '=',
      contrastSliderValue: '=',
      viewerViewport: '=',
      video: '=',
      task: '=',
      framePosition: '=',
      filters: '=',
    };

    this.template = popupPanelTemplate;

    this.controller = PopupPanelController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default PopupPanelDirective;
