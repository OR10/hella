import toolSelectorTemplate from './ToolSelectorDirective.html!';
import ToolSelectorController from './ToolSelectorController';

/**
 * Directive to display the popupPanel bar of the page
 */
class ToolSelectorDirective {
  constructor() {
    this.scope = {
      drawableThings: '=',
      selectedLabelStructureThing: '=',
      selectedDrawingTool: '=',
      selectedPaperShape: '=',
    };

    this.template = toolSelectorTemplate;

    this.controller = ToolSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default ToolSelectorDirective;
