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
}

UploadProgressController.$inject = [
  'uploadService',
];

export default UploadProgressController;