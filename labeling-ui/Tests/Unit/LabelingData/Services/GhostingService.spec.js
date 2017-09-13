import {inject} from 'angular-mocks';
import GhostingService from '../../../../Application/LabelingData/Services/GhostingService';

import labeledThingGroupFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroup';

describe('GhostingService', () => {
  let angularQ;
  let rootScope;
  let pouchDbContextServiceMock;
  let pouchDbViewServiceMock;

  let labeledThingGroup;

  function createGhostingService() {
    return new GhostingService(angularQ, pouchDbContextServiceMock, pouchDbViewServiceMock);
  }

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    labeledThingGroup = labeledThingGroupFixture.clone();
  });

  beforeEach(() => {
    pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextServiceMock', ['provideContextForTaskId']);
    pouchDbViewServiceMock = jasmine.createSpyObj('PouchDbViewServiceMock', ['getDesignDocumentViewName']);
  });

  it('should be instantiable', () => {
    const ghostingService = createGhostingService();
    expect(ghostingService).toEqual(jasmine.any(GhostingService));
  });

  describe('calculateClassGhostsForLabeledThingGroupsAndFrameIndex', () => {
    it('should return a promise', () => {
      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        0
      );

      expect(returnValue.then).toEqual(jasmine.any(Function));
    });
  });
});
