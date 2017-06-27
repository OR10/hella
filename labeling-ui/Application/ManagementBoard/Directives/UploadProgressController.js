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

  progressText() {
    let progressText = `Upload ${this.progress()}%`;

    if (this._uploadService.isComplete() && this.hasError()) {
      progressText = 'Errors uploading';
    }

    return progressText;
  }
}

UploadProgressController.$inject = [
  'uploadService',
];

export default UploadProgressController;