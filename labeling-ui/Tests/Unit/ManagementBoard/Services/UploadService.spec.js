import UploadService from 'Application/ManagementBoard/Services/UploadService';

fdescribe('UploadService test suite', () => {
  /**
   * @type {UploadService}
   */
  let uploadService;

  beforeEach(() => {
    uploadService = new UploadService();
  });

  it('can be created', () => {
    expect(uploadService).toEqual(jasmine.any(UploadService));
  });

  describe('hasFiles() / addFile() / reset()', () => {
    it('returns false by default', () => {
      const actual = uploadService.hasFiles();

      expect(actual).toBe(false);
    });

    it('returns true after the first file has been added', () => {
      uploadService.addFile({});

      const actual = uploadService.hasFiles();

      expect(actual).toBe(true);
    });

    it('returns true if multiple files have been added', () => {
      uploadService.addFile({});
      uploadService.addFile({});
      uploadService.addFile({});
      uploadService.addFile({});

      const actual = uploadService.hasFiles();

      expect(actual).toBe(true);
    });

    it('returns false if files have been added and reset() has been called', () => {
      uploadService.addFile({});
      uploadService.reset();

      const actual = uploadService.hasFiles();

      expect(actual).toBe(false);
    });
  });

  describe('hasError()', () => {
    it('returns false by default', () => {
      const actual = uploadService.hasError();

      expect(actual).toBe(false);
    });

    it('returns true if all files had an upload error', () => {
      uploadService.addFile({ hasUploadError: () => true });
      uploadService.addFile({ hasUploadError: () => true });
      uploadService.addFile({ hasUploadError: () => true });
      uploadService.addFile({ hasUploadError: () => true });

      const actual = uploadService.hasError();

      expect(actual).toBe(true);
    });

    it('returns true if only one file had an upload error', () => {
      uploadService.addFile({ hasUploadError: () => false });
      uploadService.addFile({ hasUploadError: () => false });
      uploadService.addFile({ hasUploadError: () => true });
      uploadService.addFile({ hasUploadError: () => false });

      const actual = uploadService.hasError();

      expect(actual).toBe(true);
    });

    it('returns false if no file had an upload error', () => {
      uploadService.addFile({ hasUploadError: () => false });
      uploadService.addFile({ hasUploadError: () => false });
      uploadService.addFile({ hasUploadError: () => false });
      uploadService.addFile({ hasUploadError: () => false });

      const actual = uploadService.hasError();

      expect(actual).toBe(false);
    });
  });
});