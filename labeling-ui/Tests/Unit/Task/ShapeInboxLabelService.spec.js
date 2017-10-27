import ShapeInboxLabelService from '../../../Application/Task/Services/ShapeInboxLabelService';

fdescribe('ShapeInboxLabelService', () => {
  function createService() {
    return new ShapeInboxLabelService();
  }

  it('should be instantiable', () => {
    const service = createService();
    expect(service).toEqual(jasmine.any(ShapeInboxLabelService));
  });


});