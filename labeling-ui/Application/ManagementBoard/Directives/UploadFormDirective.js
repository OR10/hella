import uploadFormTemplate from './UploadFormDirective.html!';
import UploadFormController from './UploadFormController';


/**
 * Controller of the {@link UploadFormDirective}
 */
class UploadFormDirective {
  constructor() {
    this.scope = {
      id: '=',
      readonly: '=?',
      project: '=',
      uploadPath: '@',
      uploadCompletePath: '@',
      uploadCompleteMessage: '@',
      uploadAdditionalForText: '@',
    };

    this.template = uploadFormTemplate;

    this.controller = UploadFormController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UploadFormDirective;
