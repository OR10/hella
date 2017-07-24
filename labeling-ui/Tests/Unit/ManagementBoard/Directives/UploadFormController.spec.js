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
    inProgressService = jasmine.createSpyObj('inProgressService', ['end']);
    uploadService = jasmine.createSpyObj('uploadService', ['reset']);
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

    fit('removes the progress bar if at least one of the files had an error', () => {
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
  });
});