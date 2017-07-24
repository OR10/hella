import UploadFormController from 'Application/ManagementBoard/Directives/UploadFormController';

fdescribe('UploadFormController test suite', () => {
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

  beforeEach(inject(($q, $rootScope, $timeout) => {
    promise = $q;
    rootScope = $rootScope;
    timeout = $timeout;
  }));

  beforeEach(() => {
    const ListDialog = () => {};
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

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(UploadFormController));
    expect(controller.$flow).toBeNull();
    expect(uploadGateway.getApiUrl).toHaveBeenCalledTimes(1);
    expect(organisationService.get).toHaveBeenCalledTimes(1);
    expect(organisationService.subscribe).toHaveBeenCalledWith(jasmine.any(Function));
  });

  describe('Removing upload progress bar (TTANNO-1818)', () => {
    let $flow;

    const result = {
      missing3dVideoCalibrationData: [],
    };

    beforeEach(() => {
      $flow = {
        files: [],
      };
      controller.$flow = $flow;
    });

    it('removes the upload progress bar if upload was fine', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(result));
      controller.uploadComplete();
      rootScope.$apply();

      timeout.flush();
      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('does not remove the upload progress bar if timeout is not reached', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(result));
      controller.uploadComplete();
      rootScope.$apply();

      expect(uploadService.reset).not.toHaveBeenCalled();
    });

    it('does not remove the upload progress bar if a second upload has been started in the meantime', () => {
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(result));

      controller.uploadComplete();
      rootScope.$apply();
      controller.uploadInProgress = true;
      timeout.flush();

      expect(uploadService.reset).not.toHaveBeenCalled();
    });

    it('removes the upload progress bar after another timeout if a second upload has been started in the meantime and is then completed', () => {
      uploadGateway.markUploadAsFinished.and.callFake(() => promise.resolve(result));

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

      const modalParams = {
        title: 'Upload completed with errors',
        headline: jasmine.any(String),
        message: jasmine.any(Array),
        confirmButtonText: 'Understood'
      };
      expect(modalService.info).toHaveBeenCalledWith(
        modalParams,
        undefined,
        undefined,
        jasmine.any(Object)
      );
      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });

    it('removes the progress bar if at least one of the files had an error', () => {
      const completeFile = { hasUploadError: () => false };
      const incompleteFile = { hasUploadError: () => true };
      const files = [completeFile, incompleteFile];
      $flow.files = files;
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve({
        missing3dVideoCalibrationData: files
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
});