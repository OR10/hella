import UploadProgressController from 'Application/ManagementBoard/Directives/UploadProgressController';

describe('UploadProgressController test suite', () => {
  /**
   * @type {UploadService}
   */
  let uploadServiceMock;

  /**
   * @type {UploadProgressController}
   */
  let controller;

  beforeEach(() => {
    uploadServiceMock = jasmine.createSpyObj('uploadService', ['hasFiles', 'progress', 'hasError', 'isComplete']);
    controller = new UploadProgressController(uploadServiceMock);
  });

  describe('hasFilesToUpload()', () => {
    it('returns whatever hasFiles() from the uploadService returns', () => {
      const hasFilesReturn = {};
      uploadServiceMock.hasFiles.and.returnValue(hasFilesReturn);

      const actual = controller.hasFilesToUpload();

      expect(actual).toBe(hasFilesReturn);
    });
  });

  describe('progress()', () => {
    it('returns whatever progress from the uploadService returns', () => {
      const progressReturn = {};
      uploadServiceMock.progress.and.returnValue(progressReturn);

      const actual = controller.progress();

      expect(actual).toBe(progressReturn);
    });
  });

  describe('hasError()', () => {
    it('returns whatever hasError from the uploadService returns', () => {
      const hasErrorReturn = {};
      uploadServiceMock.hasError.and.returnValue(hasErrorReturn);

      const actual = controller.hasError();

      expect(actual).toBe(hasErrorReturn);
    });
  });

  describe('progressClassName()', () => {
    it('returns an empty string by default', () => {
      const actual = controller.progressClassName();

      expect(actual).toEqual('');
    });

    it('returns an empty string if upload was successful', () => {
      uploadServiceMock.hasError.and.returnValue(false);

      const actual = controller.progressClassName();

      expect(actual).toEqual('');
    });

    it('returns the error class if upload had errors', () => {
      uploadServiceMock.hasError.and.returnValue(true);

      const actual = controller.progressClassName();

      expect(actual).toEqual('error');
    });
  });

  describe('progressText()', () => {
    it('returns a string with the progress by default', () => {
      uploadServiceMock.progress.and.returnValue(37);

      const actual = controller.progressText();

      expect(actual).toEqual('Upload 37%');
    });

    it('returns a string with the progress if upload has error but is not yet complete', () => {
      uploadServiceMock.progress.and.returnValue(39);
      uploadServiceMock.hasError.and.returnValue(true);
      uploadServiceMock.isComplete.and.returnValue(false);

      const actual = controller.progressText();

      expect(actual).toEqual('Upload 39%');
    });

    it('returns a string with the progress if upload has error and isComplete from the uploadService returns undefined', () => {
      uploadServiceMock.progress.and.returnValue(39);
      uploadServiceMock.hasError.and.returnValue(true);

      const actual = controller.progressText();

      expect(actual).toEqual('Upload 39%');
    });

    it('returns a string with the progress if upload is complete and had no errors', () => {
      uploadServiceMock.progress.and.returnValue(100);
      uploadServiceMock.hasError.and.returnValue(false);
      uploadServiceMock.isComplete.and.returnValue(true);

      const actual = controller.progressText();

      expect(actual).toEqual('Upload 100%');
    });

    it('shows 99% if progress returns 100% but upload is not yet complete', () => {
      uploadServiceMock.progress.and.returnValue(100);
      uploadServiceMock.hasError.and.returnValue(false);
      uploadServiceMock.isComplete.and.returnValue(false);

      const actual = controller.progressText();

      expect(actual).toEqual('Upload 99%');
    });

    it('returns an error message if upload is complete but had errors', () => {
      uploadServiceMock.progress.and.returnValue(66);
      uploadServiceMock.hasError.and.returnValue(true);
      uploadServiceMock.isComplete.and.returnValue(true);

      const actual = controller.progressText();

      expect(actual).toEqual('Errors uploading');
    });
  });
});