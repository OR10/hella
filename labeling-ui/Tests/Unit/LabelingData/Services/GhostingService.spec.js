import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import GhostingService from '../../../../Application/LabelingData/Services/GhostingService';

import labeledThingGroupFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroup';
import labeledThinGroupDocumentFixture from '../../../Fixtures/Models/CouchDb/LabeledThingGroup';

describe('GhostingService', () => {
  let angularQ;
  let rootScope;
  let pouchDbContextServiceMock;
  let pouchDbViewServiceMock;
  let couchDbModelDeserializerMock;
  let revisionManagerMock;
  let entityIdServiceMock;
  let dbContextMock;

  let labeledThingGroup;
  let labeledThingGroupDocument;

  function createGhostingService() {
    return new GhostingService(
      angularQ,
      pouchDbContextServiceMock,
      pouchDbViewServiceMock,
      couchDbModelDeserializerMock,
      revisionManagerMock,
      entityIdServiceMock
    );
  }

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    labeledThingGroup = labeledThingGroupFixture.clone();
    labeledThingGroupDocument = cloneDeep(labeledThingGroupFixture);
  });

  beforeEach(() => {
    pouchDbContextServiceMock = jasmine.createSpyObj('PouchDbContextServiceMock', ['provideContextForTaskId']);
    pouchDbViewServiceMock = jasmine.createSpyObj('PouchDbViewServiceMock', ['getDesignDocumentViewName']);
    couchDbModelDeserializerMock = jasmine.createSpyObj(
      'CouchDbModelDeserializer',
      ['deserializeLabeledThingGroupInFrame']
    );
    revisionManagerMock = jasmine.createSpyObj('RevisionManagerMock', ['extractRevision']);
    entityIdServiceMock = jasmine.createSpyObj('EntityIdServiceMock', ['getUniqueId']);
    dbContextMock = jasmine.createSpyObj('PouchDB Context', ['query']);
  });

  beforeEach(() => {
    pouchDbContextServiceMock.provideContextForTaskId.and.returnValue(dbContextMock);
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

    it('should query the database for corresponding ltgifs', () => {
      const frameIndex = 423;
      const viewName = '3d-slice-of-a-n-dimensional-hypercube';
      pouchDbViewServiceMock.getDesignDocumentViewName.and.returnValue(viewName);

      dbContextMock.query.and.returnValue(
        angularQ.resolve(
          {
            rows: [labeledThingGroupDocument],
          }
        )
      );

      const ghostingService = createGhostingService();

      ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex([labeledThingGroup], frameIndex);

      rootScope.$apply();

      expect(dbContextMock.query).toHaveBeenCalledWith(
        viewName,
        {
          include_docs: true,
          startkey: [labeledThingGroup.id, frameIndex],
          endkey: [labeledThingGroup.id, frameIndex],
        }
      );
    });

    it('should reject if fetching of ltgifs failed', () => {
      const frameIndex = 423;
      const error = 'Moon Star of Limbo, give me the might, the muscle, the menace of Mon Star!';

      dbContextMock.query.and.returnValue(
        angularQ.reject(error)
      );

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      rootScope.$apply();

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });
  });
});
