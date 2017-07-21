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
    uploadGateway = jasmine.createSpyObj('uploadGateway', ['getApiUrl', 'markUploadAsFinished']);
    organisationService = jasmine.createSpyObj('organisationService', ['get', 'subscribe']);
    inProgressService = jasmine.createSpyObj('inProgressService', ['end']);
    uploadService = jasmine.createSpyObj('uploadService', ['reset']);
    modalService = jasmine.createSpyObj('modalService', ['info']);

    controller = new UploadFormController(
      null,                 // $state
      uploadGateway,
      modalService,
      null,                 // ListDialog
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

    beforeEach(() => {
      $flow = {
        files: [],
      };
      controller.$flow = $flow;
    });

    it('removes the upload progress bar if upload was fine', () => {
      const result = {
        missing3dVideoCalibrationData: [],
      };
      uploadGateway.markUploadAsFinished.and.returnValue(promise.resolve(result));
      controller.uploadComplete();
      rootScope.$apply();

      timeout.flush();
      expect(uploadService.reset).toHaveBeenCalledTimes(1);
    });
  });
});