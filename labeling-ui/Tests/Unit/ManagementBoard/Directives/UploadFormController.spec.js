import UploadFormController from 'Application/ManagementBoard/Directives/UploadFormController';
import ListDialog from 'Tests/Mocks/ListDialog';


describe('UploadFormController test suite', () => {
  /**
   * @type {UploadFormController}
   */
  let controller;

  /**
   * @type {UploadGateway}
   */
  let uploadGateway;

  /**
   * @type {OrganisationService}
   */
  let organisationService;

  /**
   * @type {InProgressService}
   */
  let inProgressService;

  /**
   * @type {UploadService}
   */
  let uploadService;

  /**
   * @type {Promise}
   */
  let promise;

  /**
   * @type {ModalService}
   */
  let modalService;

  /**
   * @type {$rootScope}
   */
  let rootScope;

  /**
   * @type {$timeout}
   */
  let timeout;

  /**
   * @type {Object}
   */
  let promiseResult;

  /**
   * @type {Object}
   */
  let $flow;

  beforeEach(inject(($q, $rootScope, $timeout) => { // eslint-disable-line no-undef
    promise = $q;
    rootScope = $rootScope;
    timeout = $timeout;

    promiseResult = {
      missing3dVideoCalibrationData: [],
    };
  }));

  beforeEach(() => {
    uploadGateway = jasmine.createSpyObj('uploadGateway', ['getApiUrl', 'markUploadAsFinished']);
    organisationService = jasmine.createSpyObj('organisationService', ['get', 'subscribe']);
    inProgressService = jasmine.createSpyObj('inProgressService', ['start', 'end']);
    uploadService = jasmine.createSpyObj('uploadService', ['reset', 'addFile']);
    modalService = jasmine.createSpyObj('modalService', ['info', 'show']);

    controller = new UploadFormController(
      null,                 // $state
      uploadGateway,
      modalService,
      ListDialog,
      organisationService,
      inProgressService,
      timeout,
      uploadService
    );
  });

  beforeEach(() => {
    $flow = {
      files: [],
    };
    controller.$flow = $flow;
  });

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(UploadFormController));
    expect(controller.$flow).toBe($flow);
    expect(uploadGateway.getApiUrl).toHaveBeenCalledTimes(1);
    expect(organisationService.get).toHaveBeenCalledTimes(1);
    expect(organisationService.subscribe).toHaveBeenCalledWith(jasmine.any(Function));
  });

  describe('Removing upload progress bar (TTANNO-1818)', () => {
    it('removes the upload progress bar if upload was fine', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));
      controller.uploadComplete();
      rootScope.$apply();

      timeout.flush();
      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('does not remove the upload progress bar if timeout is not reached', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));
      controller.uploadComplete();
      rootScope.$apply();

      expect(uploadService.reset).not.toHaveBeenCalled();
    });

    it('does not remove the upload progress bar if a second upload has been started in the meantime', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));

      controller.uploadComplete();
      rootScope.$apply();
      controller.uploadInProgress = true;
      timeout.flush();

      expect(uploadService.reset).not.toHaveBeenCalled();
    });

    it('removes the upload progress bar after another timeout if a second upload has been started in the meantime and is then completed', () => {
      uploadGateway.markUploadAsFinished.and.callFake(() => promise.resolve(promiseResult));

      controller.uploadComplete();
      controller.uploadInProgress = true;
      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('removes the progress bar if the result has an error', () => {
      const promiseWithResultError = promise.resolve({
        missing3dVideoCalibrationData: [],
        error: {
          message: 'Oh look, something shiny',
        },
      });
      uploadGateway.markUploadAsFinished.and.returnValue(promiseWithResultError);

      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('removes the progress bar if at least one of the files had an error', () => {
      const completeFile = { hasUploadError: () => false };
      const incompleteFile = { hasUploadError: () => true };
      const files = [completeFile, incompleteFile];
      $flow.files = files;
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve({
        missing3dVideoCalibrationData: files,
      }));

      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      expect(modalService.show).toHaveBeenCalled();
      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('removes the progress bar if mark upload as finished was rejected', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.reject());

      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadComplete()', () => {
    it('sets the uploadInProgress to false', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));

      controller.uploadInProgress = true;
      controller.uploadComplete();
      rootScope.$apply();

      expect(controller.uploadInProgress).toBe(false);
    });

    it('calls end on the inProgressService', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));

      controller.uploadComplete();
      rootScope.$apply();

      expect(inProgressService.end).toHaveBeenCalled();
    });

    it('shows a modal if markUploadAsFinished had an error', () => {
      promiseResult = {
        missing3dVideoCalibrationData: [],
        error: {
          message: 'PANIK',
        },
      };

      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));

      const modalParams = {
        title: 'Upload completed with errors',
        headline: jasmine.any(String),
        message: jasmine.any(Array),
        confirmButtonText: 'Understood',
      };

      controller.uploadComplete();
      rootScope.$apply();

      expect(modalService.info).toHaveBeenCalledWith(
        modalParams,
        undefined,
        undefined,
        jasmine.any(Object)
      );
    });

    it('shows an error modal with the files if there were incomplete files', () => {
      const completeFile = { hasUploadError: () => false };
      const incompleteFile = { hasUploadError: () => true };
      const files = [completeFile, incompleteFile];
      $flow.files = files;
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve({
        missing3dVideoCalibrationData: files,
      }));

      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      expect(modalService.show).toHaveBeenCalled();
      const modalServiceShowArguments = modalService.show.calls.argsFor(0);
      expect(modalServiceShowArguments[0].config.data).toBe(files);
    });

    it('shows an error modal if there were files with upload errors, but none incomplete', () => {
      const completeFile = { hasUploadError: () => false };
      const incompleteFile = { hasUploadError: () => true };
      const files = [completeFile, incompleteFile];
      $flow.files = files;
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve({
        missing3dVideoCalibrationData: [],
      }));

      controller.uploadComplete();
      rootScope.$apply();
      timeout.flush();

      const modalParams = {
        title: 'Upload completed with errors',
        headline: jasmine.any(String),
        message: jasmine.any(Array),
        confirmButtonText: 'Understood',
      };

      expect(modalService.info).toHaveBeenCalledWith(
        modalParams,
        undefined,
        undefined,
        jasmine.any(Object)
      );
    });

    it('shows a modal if upload was finished successfully, no incomplete files', () => {
      const uploadCompleteMessage = 'Bernd das Brot';
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(promiseResult));

      controller.uploadCompleteMessage = uploadCompleteMessage;
      controller.uploadComplete();
      rootScope.$apply();

      const modalParams = {
        title: 'Upload complete',
        headline: 'Your upload is complete',
        message: uploadCompleteMessage,
        confirmButtonText: jasmine.any(String),
      };
      expect(modalService.info).toHaveBeenCalledWith(modalParams, jasmine.any(Function));
    });

    it('shows a modal if upload was finished successfully, but there were incomplete files', () => {
      const files = ['one', 'two', 'three'];

      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve({
        missing3dVideoCalibrationData: files,
      }));

      controller.uploadComplete();
      rootScope.$apply();

      expect(modalService.show).toHaveBeenCalled();
      const modalServiceShowArguments = modalService.show.calls.argsFor(0);
      expect(modalServiceShowArguments[0].config.data).toBe(files);
    });

    it('shows an error modal if markUploadAsFinished was rejected', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.reject());

      controller.uploadComplete();
      rootScope.$apply();

      const modalParams = {
        title: 'Upload completed with errors',
        headline: 'Your upload is complete, but errors occured.',
        message: jasmine.any(Array),
        confirmButtonText: jasmine.any(String),
      };
      expect(modalService.info).toHaveBeenCalledWith(
        modalParams,
        undefined,
        undefined,
        jasmine.any(Object)
      );
    });

    it('sets uploadInProgress to false if markUploadAsFinished was rejected', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.reject());

      controller.uploadInProgress = true;
      controller.uploadComplete();
      rootScope.$apply();

      expect(controller.uploadInProgress).toBe(false);
    });

    it('calls end on the inProgressService if markUploadAsFinished was rejected', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.reject());

      controller.uploadComplete();
      rootScope.$apply();

      expect(inProgressService.end).toHaveBeenCalled();
    });
  });

  describe('uploadStarted()', () => {
    it('sets uploadInProgress to true', () => {
      expect(controller.uploadInProgress).toBe(false);
      controller.uploadStarted();
      expect(controller.uploadInProgress).toBe(true);
    });

    it('triggers the inProgressService', () => {
      controller.uploadStarted();
      expect(inProgressService.start).toHaveBeenCalled();
    });
  });

  describe('fileAdded', () => {
    it('adds the hasUploadError function, which returns false', () => {
      const file = {};
      controller.fileAdded(file);
      expect(file.hasUploadError).toEqual(jasmine.any(Function));
      expect(file.hasUploadError()).toBe(false);
    });

    it('passes the file to the uploadService', () => {
      const file = {};
      controller.fileAdded(file);
      expect(uploadService.addFile).toHaveBeenCalledWith(file);
    });
  });

  describe('filesAdded', () => {
    it('adds the hasUploadError function, which returns false, to every file', () => {
      const fileOne = {id: 1};
      const fileTwo = {id: 2};
      const fileThree = {id: 3};

      controller.filesAdded([fileOne, fileTwo, fileThree]);

      expect(fileOne.hasUploadError).toEqual(jasmine.any(Function));
      expect(fileTwo.hasUploadError).toEqual(jasmine.any(Function));
      expect(fileThree.hasUploadError).toEqual(jasmine.any(Function));

      expect(fileOne.hasUploadError()).toBe(false);
      expect(fileTwo.hasUploadError()).toBe(false);
      expect(fileThree.hasUploadError()).toBe(false);
    });

    it('passes every file to the upload service', () => {
      const fileOne = {id: 1};
      const fileTwo = {id: 2};
      const fileThree = {id: 3};

      controller.filesAdded([fileOne, fileTwo, fileThree]);

      expect(uploadService.addFile).toHaveBeenCalledWith(fileOne);
      expect(uploadService.addFile).toHaveBeenCalledWith(fileTwo);
      expect(uploadService.addFile).toHaveBeenCalledWith(fileThree);
    });
  });

  describe('fileError', () => {
    const message = { error: 'O NOES! Something terrible has happened' };
    const messageAsJsonString = JSON.stringify(message);

    it('adds the provided error message', () => {
      const file = {};

      controller.fileError(file, messageAsJsonString);

      expect(file.errorMessage).toEqual(message.error);
    });

    it('adds the hasUploadError function which returns true', () => {
      const file = {};

      controller.fileError(file, messageAsJsonString);

      expect(file.hasUploadError).toEqual(jasmine.any(Function));
      expect(file.hasUploadError()).toBe(true);
    });
  });

  describe('fileColorClass()', () => {
    let file;

    beforeEach(() => {
      file = jasmine.createSpyObj('file', ['isUploading', 'isComplete', 'hasUploadError']);
    });

    it('returns an empty string by default', () => {
      const color = controller.fileColorClass(file);

      expect(color).toEqual('');
    });

    it('returns upload-success if upload is complete', () => {
      file.isComplete.and.returnValue(true);

      const color = controller.fileColorClass(file);

      expect(color).toEqual('upload-success');
    });

    it('returns upload-error if file is complete but has an upload error', () => {
      file.isUploading.and.returnValue(false);
      file.isComplete.and.returnValue(true);
      file.hasUploadError.and.returnValue(true);

      const color = controller.fileColorClass(file);

      expect(color).toEqual('upload-error');
    });

    it('returns an empty string if uploading and complete (should not exist) but no errors', () => {
      file.isUploading.and.returnValue(true);
      file.isComplete.and.returnValue(true);
      file.hasUploadError.and.returnValue(false);

      const color = controller.fileColorClass(file);

      expect(color).toEqual('');
    });

    it('returns upload-success if not uploading, complete and no errors', () => {
      file.isUploading.and.returnValue(false);
      file.isComplete.and.returnValue(true);
      file.hasUploadError.and.returnValue(false);

      const color = controller.fileColorClass(file);

      expect(color).toEqual('upload-success');
    });
  });

  describe('uploadFilesFromSystem', () => {
    let getElementById;
    let element;
    let original;

    beforeEach(() => {
      getElementById = jasmine.createSpy('document.getElementById()');
      element = jasmine.createSpyObj('element', ['click']);
      getElementById.and.returnValue(element);

      original = document.getElementById;
      document.getElementById = getElementById;
    });

    afterEach(() => {
      document.getElementById = original;
    });

    it('clicks an element after a timeout', () => {
      controller.uploadFilesFromSystem();
      timeout.flush();

      expect(getElementById).toHaveBeenCalledWith('project-upload-input');
      expect(element.click).toHaveBeenCalled();
    });

    it('does nothing if the timeout was not reached', () => {
      controller.uploadFilesFromSystem();

      expect(getElementById).not.toHaveBeenCalled();
      expect(element.click).not.toHaveBeenCalled();
    });
  });

  describe('clearFiles', () => {
    beforeEach(() => {
      $flow.cancel = jasmine.createSpy('$flow.cancel()');
    });

    it('calls cancel on the flow object', () => {
      controller.clearFiles();

      expect($flow.cancel).toHaveBeenCalled();
    });

    it('calls reset on the uploadService', () => {
      controller.clearFiles();

      expect(uploadService.reset).toHaveBeenCalled();
    });
  });
});