import RibbonController from './RibbonController';

class RibbonDirective {
  constructor() {
    this.template = '{{vm.text}}';
    this.scope = {
      postition: '@?',
      text: '@',
    };
    this.bindToController = true;
    this.controllerAs = 'vm';
    this.controller = RibbonController;
  }
}

export default RibbonDirective;
