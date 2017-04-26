import {inject} from 'angular-mocks';
import PouchDbLabeledFrameGateway from 'Application/LabelingData/Gateways/PouchDbLabeledFrameGateway';

fdescribe('PouchDbLabeledFrameGateway', () => {
  let angularQ;
  let packagingExecutor;
  let pouchDbContextService;
  let couchDbModelDeserializer;
  let pouchDbViewService;
  let gateway;

  beforeEach(() => packagingExecutor = jasmine.createSpyObj(['execute']));
  beforeEach(() => pouchDbContextService = jasmine.createSpyObj(['provideContextForTaskId']));
  beforeEach(() => couchDbModelDeserializer = jasmine.createSpyObj(['deserializeLabeledFrame']));
  beforeEach(() => pouchDbViewService = jasmine.createSpyObj(['getDesignDocumentViewName']));

  beforeEach(inject($q => angularQ = $q));

  beforeEach(
    () => gateway = new PouchDbLabeledFrameGateway(
      angularQ,
      packagingExecutor,
      pouchDbContextService,
      couchDbModelDeserializer,
      pouchDbViewService,
    )
  );

  it('should be able to instantiate', () => {
    expect(gateway).toEqual(jasmine.any(PouchDbLabeledFrameGateway));
  });
});
