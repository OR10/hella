class UploadProgressController {
  /**
   * @param {UploadService} uploadService
   */
  constructor(uploadService) {
    this._uploadService = uploadService;
  }

  hasFilesToUpload() {
    return this._uploadService.hasFiles();
  }

  progress() {
    return this._uploadService.progress();
  }

  hasError() {
    return this._uploadService.hasError();
  }

  progressClassName() {
    let className = '';

    if(this.hasError()) {
      return 'error';
    }

    return className;
  }
}

UploadProgressController.$inject = [
  'uploadService',
];

export default UploadProgressController;