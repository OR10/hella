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
}

UploadProgressController.$inject = [
  'uploadService'
];

export default UploadProgressController;