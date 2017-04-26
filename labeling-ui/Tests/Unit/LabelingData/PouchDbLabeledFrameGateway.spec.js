import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

fdescribe('PouchDbLabeledFrameGateway', () => {
  let gateway;

  beforeEach(() => gateway = new PouchDbLabeledFrameGateway());

  it('should be able to instantiate', () => {
    expect(gateway).toEqual(jasmine.any(PouchDbLabeledFrameGateway));
  });
});
