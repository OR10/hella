import UploadService from 'Application/ManagementBoard/Services/UploadService';

describe('UploadService test suite', () => {
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

  describe('isComplete()', () => {
    it('returns true by default', () => {
      const actual = uploadService.isComplete();

      expect(actual).toBe(true);
    });

    it('returns true if all files are complete', () => {
      uploadService.addFile({ isComplete: () => true });
      uploadService.addFile({ isComplete: () => true });
      uploadService.addFile({ isComplete: () => true });
      uploadService.addFile({ isComplete: () => true });

      const actual = uploadService.isComplete();

      expect(actual).toBe(true);
    });

    it('returns false if only one file is complete', () => {
      uploadService.addFile({ isComplete: () => false });
      uploadService.addFile({ isComplete: () => false });
      uploadService.addFile({ isComplete: () => true });
      uploadService.addFile({ isComplete: () => false });

      const actual = uploadService.isComplete();

      expect(actual).toBe(false);
    });

    it('returns false if all files are incomplete', () => {
      uploadService.addFile({ isComplete: () => false });
      uploadService.addFile({ isComplete: () => false });
      uploadService.addFile({ isComplete: () => false });
      uploadService.addFile({ isComplete: () => false });

      const actual = uploadService.isComplete();

      expect(actual).toBe(false);
    });
  });

  describe('progress', () => {
    it('returns 0 by defaukt', () => {
      const actual = uploadService.progress();

      expect(actual).toEqual(0);
    });

    it('returns the progress of one file if there is only one', () => {
      uploadService.addFile({ progress: () => 0.89 });

      const actual = uploadService.progress();

      expect(actual).toEqual(89);
    });

    it('returns the progress of two files', () => {
      uploadService.addFile({ progress: () => 0.60 });
      uploadService.addFile({ progress: () => 0.40 });

      const actual = uploadService.progress();

      expect(actual).toEqual(50);
    });

    it('rounds the result', () => {
      uploadService.addFile({ progress: () => 0.62 });
      uploadService.addFile({ progress: () => 0.40 });
      uploadService.addFile({ progress: () => 0.38 });

      const actual = uploadService.progress();

      expect(actual).toEqual(47); // without rounding the result would be 46.66666
    });
  });
});
