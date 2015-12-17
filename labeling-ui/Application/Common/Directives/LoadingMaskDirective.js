import loadingMaskTemplate from './LoadingMask.html!';
import LoadingMaskController from './LoadingMaskController';

class LoadingMaskDirective
{
  constructor() {
    this.template = loadingMaskTemplate;
    this.scope = {
      spinner: '=?',
    };
    this.bindToController = true;
    this.controllerAs = 'vm';
    this.controller = LoadingMaskController;
  }
}

export default LoadingMaskDirective;
