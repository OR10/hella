import UploadFormController from 'Application/ManagementBoard/Directives/UploadFormController';

fdescribe('UploadFormController test suite', () => {
  it('can be created', () => {
    const uploadGateway = jasmine.createSpyObj('uploadGateway', ['getApiUrl']);
    const organisationService = jasmine.createSpyObj('organisationService', ['get', 'subscribe']);
    const controller = new UploadFormController(null, uploadGateway, null, null, organisationService);

    expect(controller).toEqual(jasmine.any(UploadFormController));
    expect(controller.$flow).toBeNull();
    expect(uploadGateway.getApiUrl).toHaveBeenCalledTimes(1);
    expect(organisationService.get).toHaveBeenCalledTimes(1);
    expect(organisationService.subscribe).toHaveBeenCalledWith(jasmine.any(Function));
  });
});