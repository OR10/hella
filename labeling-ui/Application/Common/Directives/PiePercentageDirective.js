import PiePercentageController from './PiePercentageController';
import PiePercentageTemplate from './PiePercentageDirective.html!';

class PiePercentageDirective {
  constructor() {
    this.template = PiePercentageTemplate;
    this.scope = {
      value: '=',
      width: '@',
      height: '@',
      color: '@',
    };
    this.bindToController = true;
    this.controllerAs = 'vm';
    this.controller = PiePercentageController;
  }
}

export default PiePercentageDirective;
