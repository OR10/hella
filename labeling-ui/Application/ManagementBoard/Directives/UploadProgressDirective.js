import uploadProgressTemplate from './UploadProgressDirective.html!';
import UploadProgressController from './UploadProgressController';


/**
 * Controller of the {@link UploadFormDirective}
 */
class UploadProgressDirective {
  constructor() {
    this.scope = {};

    this.template = uploadProgressTemplate;

    this.controller = UploadProgressController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UploadProgressDirective;
