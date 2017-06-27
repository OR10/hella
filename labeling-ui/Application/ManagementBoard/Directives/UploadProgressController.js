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
    let progressText;
    const uploadComplete = this._uploadService.isComplete();

    if (uploadComplete && this.hasError()) {
      progressText = 'Errors uploading';
    } else {
      let progress = this.progress();
      // Don't show 100% if the upload is not yet finished
      if (progress === 100 && !uploadComplete) {
        progress = 99;
      }
      progressText = `Upload ${progress}%`
    }

    return progressText;
  }
}

UploadProgressController.$inject = [
  'uploadService',
];

export default UploadProgressController;