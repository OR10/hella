import {inject} from 'angular-mocks';
import {cloneDeep} from 'lodash';
import GhostingService from '../../../../Application/LabelingData/Services/GhostingService';

import LabeledThingGroupInFrame from '../../../../Application/LabelingData/Models/LabeledThingGroupInFrame';

import labeledThingGroupFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroup';
import labeledThingGroupTwoFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroup2';
import labeledThingGroupInFrameFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroupInFrame';
import labeledThingGroupInFrameDocumentFixture from '../../../Fixtures/Models/CouchDb/LabeledThingGroupInFrame';
import labeledThingGroupInFrameTwoFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroupInFrameTwo';
import labeledThingGroupInFrameTwoDocumentFixture from '../../../Fixtures/Models/CouchDb/LabeledThingGroupInFrameTwo';


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
  let labeledThingGroupTwo;
  let labeledThingGroupInFrame;
  let labeledThingGroupInFrameDocument;
  let labeledThingGroupInFrameTwo;
  let labeledThingGroupInFrameTwoDocument;

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
    labeledThingGroupTwo = labeledThingGroupTwoFixture.clone();
    labeledThingGroupInFrame = labeledThingGroupInFrameFixture.clone();
    labeledThingGroupInFrameDocument = cloneDeep(labeledThingGroupInFrameDocumentFixture);
    labeledThingGroupInFrameTwo = labeledThingGroupInFrameTwoFixture.clone();
    labeledThingGroupInFrameTwoDocument = cloneDeep(labeledThingGroupInFrameTwoDocumentFixture);
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
    let viewResponseDeferreds;
    let queryCalledWithOptions;

    function _encodeStartAndEndKey(startkey, endkey) {
      return `${JSON.stringify(startkey)}-${JSON.stringify(endkey)}`;
    }

    function viewOptionsForCall(startkey, endkey) {
      const key = _encodeStartAndEndKey(startkey, endkey);
      if (queryCalledWithOptions[key] === undefined) {
        const encodedStartkey = JSON.stringify(startkey);
        const encodiedEndkey = JSON.stringify(endkey);
        throw new Error(
          `Test error: pouchdb query was never called with startkey ${encodedStartkey} and endkey ${encodiedEndkey}.`
        );
      }

      return queryCalledWithOptions[key];
    }

    function resolveViewQuery(startkey, endkey, docs) {
      rootScope.$apply();
      const key = _encodeStartAndEndKey(startkey, endkey);

      if (viewResponseDeferreds[key] === undefined) {
        throw new Error('View with the given start and and keys was not queried: ' + key + '\n\n'
          + 'The following views were queried: \n' + Object.keys(viewResponseDeferreds).join('\n'));
      }

      viewResponseDeferreds[key].resolve({
        offset: 0,
        total_rows: docs.length,
        rows: docs.map(doc => ({_id: doc._id, _rev: doc._rev, doc})),
      });
      rootScope.$apply();
    }

    function rejectViewQuery(startkey, endkey, error) {
      rootScope.$apply();
      const key = _encodeStartAndEndKey(startkey, endkey);
      viewResponseDeferreds[key].reject(error);
      rootScope.$apply();
    }

    beforeEach(() => {
      viewResponseDeferreds = {};
      queryCalledWithOptions = {};

      dbContextMock.query.and.callFake(
        (viewName, options) => {
          const key = _encodeStartAndEndKey(options.startkey, options.endkey);
          queryCalledWithOptions[key] = options;
          viewResponseDeferreds[key] = angularQ.defer();
          return viewResponseDeferreds[key].promise;
        }
      );

      couchDbModelDeserializerMock.deserializeLabeledThingGroupInFrame.and.callFake(
        ltgifDocument => {
          switch (ltgifDocument._id) {
            case labeledThingGroupInFrameDocument._id:
              return labeledThingGroupInFrame;
            case labeledThingGroupInFrameTwoDocument._id:
              return labeledThingGroupInFrameTwo;
            default:
              throw new Error(`Test Error: Tried to unserialize unknown labeledThingGroupInFrame id: ${ltgifDocument._id}`);
          }
        }
      );

      pouchDbViewServiceMock.getDesignDocumentViewName.and.callFake(viewName => viewName);

      entityIdServiceMock.getUniqueId.and.returnValue('absolutely-unique-id-no-questions-asked');
    });

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

      const startkey = [labeledThingGroup.id, frameIndex];
      const endkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex([labeledThingGroup], frameIndex);

      rootScope.$apply();

      expect(viewOptionsForCall(startkey, endkey)).toEqual(
        {
          include_docs: true,
          startkey,
          endkey,
        }
      );
    });

    it('should reject if fetching of ltgifs failed', () => {
      const frameIndex = 423;
      const error = 'Moon Star of Limbo, give me the might, the muscle, the menace of Mon Star!';

      const startkey = [labeledThingGroup.id, frameIndex];
      const endkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      rejectViewQuery(startkey, endkey, error);

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should resolve with existing ltgifs', () => {
      const frameIndex = 423;

      const startkey = [labeledThingGroup.id, frameIndex];
      const endkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(startkey, endkey, [labeledThingGroupInFrameDocument]);

      expect(returnValueSpy).toHaveBeenCalledWith([
        labeledThingGroupInFrame,
      ]);
    });

    it('should extract revisions of loaded ltgifs', () => {
      const frameIndex = 423;

      const startkey = [labeledThingGroup.id, frameIndex];
      const endkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(startkey, endkey, [labeledThingGroupInFrameDocument]);

      expect(revisionManagerMock.extractRevision).toHaveBeenCalledWith(labeledThingGroupInFrameDocument);
    });

    it('should request ltgifs before frameIndex for ghosts', () => {
      const frameIndex = 423;

      const onFrameStartkey = [labeledThingGroup.id, frameIndex];
      const onFrameEndkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );

      resolveViewQuery(onFrameStartkey, onFrameEndkey, []);

      // Keys are inverse (descending: true)
      const beforeFrameStartkey = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkey = [labeledThingGroup.id, 0];

      expect(viewOptionsForCall(
        beforeFrameStartkey,
        beforeFrameEndkey,
      )).toBeDefined();
    });

    it('should resolve with ghosted ltgif extracted from previous frameIndex for ghosts', () => {
      const frameIndex = 423;

      const onFrameStartkey = [labeledThingGroup.id, frameIndex];
      const onFrameEndkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(onFrameStartkey, onFrameEndkey, []);

      const beforeFrameStartkey = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkey = [labeledThingGroup.id, 0];

      resolveViewQuery(beforeFrameStartkey, beforeFrameEndkey, [labeledThingGroupInFrameDocument]);

      const ghostedLabeledThingGroupsInFrame = returnValueSpy.calls.mostRecent().args[0];
      expect(ghostedLabeledThingGroupsInFrame.length).toBe(1);

      const ghostedLabeledThingGroupInFrame = ghostedLabeledThingGroupsInFrame[0];
      expect(ghostedLabeledThingGroupInFrame).toBeDefined();
      expect(ghostedLabeledThingGroupInFrame.frameIndex).toEqual(frameIndex);
      expect(ghostedLabeledThingGroupInFrame.id).toEqual('absolutely-unique-id-no-questions-asked');

      const cleanedGhost = ghostedLabeledThingGroupInFrame.toJSON();
      delete cleanedGhost.id;
      delete cleanedGhost.frameIndex;
      const cleanedLtgif = labeledThingGroupInFrame.toJSON();
      delete cleanedLtgif.id;
      delete cleanedLtgif.frameIndex;
      expect(cleanedGhost).toEqual(cleanedLtgif);
    });

    it('should reject if retrieval of previous ltgif fails', () => {
      const frameIndex = 423;

      const error = 'The cake is a lie!';

      const onFrameStartkey = [labeledThingGroup.id, frameIndex];
      const onFrameEndkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue rejected');
      returnValue.catch(returnValueSpy);

      resolveViewQuery(onFrameStartkey, onFrameEndkey, []);

      const beforeFrameStartkey = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkey = [labeledThingGroup.id, 0];

      rejectViewQuery(beforeFrameStartkey, beforeFrameEndkey, error);

      expect(returnValueSpy).toHaveBeenCalledWith(error);
    });

    it('should extract revision of previous frame ltgif if loaded', () => {
      const frameIndex = 423;

      const onFrameStartkey = [labeledThingGroup.id, frameIndex];
      const onFrameEndkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );

      resolveViewQuery(onFrameStartkey, onFrameEndkey, []);

      const beforeFrameStartkey = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkey = [labeledThingGroup.id, 0];

      resolveViewQuery(beforeFrameStartkey, beforeFrameEndkey, [labeledThingGroupInFrameDocument]);

      expect(revisionManagerMock.extractRevision).toHaveBeenCalledWith(labeledThingGroupInFrameDocument);
    });

    it('should resolve with newly created ghost if no actual or previous frameIndex could be found', () => {
      const frameIndex = 423;

      const onFrameStartkey = [labeledThingGroup.id, frameIndex];
      const onFrameEndkey = [labeledThingGroup.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [labeledThingGroup],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(onFrameStartkey, onFrameEndkey, []);

      const beforeFrameStartkey = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkey = [labeledThingGroup.id, 0];

      resolveViewQuery(beforeFrameStartkey, beforeFrameEndkey, []);

      const ghostedLabeledThingGroupsInFrame = returnValueSpy.calls.mostRecent().args[0];
      expect(ghostedLabeledThingGroupsInFrame.length).toBe(1);

      const ghostedLabeledThingGroupInFrame = ghostedLabeledThingGroupsInFrame[0];
      expect(ghostedLabeledThingGroupInFrame).toEqual(jasmine.any(LabeledThingGroupInFrame));
      expect(ghostedLabeledThingGroupInFrame.id).toEqual('absolutely-unique-id-no-questions-asked');
      expect(ghostedLabeledThingGroupInFrame.frameIndex).toEqual(frameIndex);
      expect(ghostedLabeledThingGroupInFrame.classes).toEqual([]);
      expect(ghostedLabeledThingGroupInFrame.incomplete).toEqual(true);
      expect(ghostedLabeledThingGroupInFrame.task).toBe(labeledThingGroup.task);
      expect(ghostedLabeledThingGroupInFrame.labeledThingGroup).toBe(labeledThingGroup);
    });

    it('should resolve with combined real results and previous frame ghosts', () => {
      const frameIndex = 423;

      const onFrameStartkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameEndkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];
      const onFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [
          labeledThingGroup,
          labeledThingGroupTwo,
        ],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(
        onFrameStartkeyGroupOne,
        onFrameEndkeyGroupOne,
        [
          labeledThingGroupInFrameDocument,
        ]
      );

      resolveViewQuery(
        onFrameStartkeyGroupTwo,
        onFrameEndkeyGroupTwo,
        []
      );

      const beforeFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex - 1];
      const beforeFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, 0];

      resolveViewQuery(
        beforeFrameStartkeyGroupTwo,
        beforeFrameEndkeyGroupTwo,
        []
      );

      const ghostedLabeledThingGroupsInFrame = returnValueSpy.calls.mostRecent().args[0];
      expect(ghostedLabeledThingGroupsInFrame.length).toBe(2);

      const realLtgif = ghostedLabeledThingGroupsInFrame[0];
      expect(realLtgif).toEqual(labeledThingGroupInFrame);

      const newGhostLtgif = ghostedLabeledThingGroupsInFrame[1];
      expect(newGhostLtgif.id).toEqual('absolutely-unique-id-no-questions-asked');
    });

    it('should resolve with combined real result and newly created ghost', () => {
      const frameIndex = 423;

      const onFrameStartkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameEndkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];
      const onFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [
          labeledThingGroup,
          labeledThingGroupTwo,
        ],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(
        onFrameStartkeyGroupOne,
        onFrameEndkeyGroupOne,
        [
          labeledThingGroupInFrameDocument,
        ]
      );

      resolveViewQuery(
        onFrameStartkeyGroupTwo,
        onFrameEndkeyGroupTwo,
        []
      );

      const beforeFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex - 1];
      const beforeFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, 0];

      resolveViewQuery(
        beforeFrameStartkeyGroupTwo,
        beforeFrameEndkeyGroupTwo,
        []
      );

      const ghostedLabeledThingGroupsInFrame = returnValueSpy.calls.mostRecent().args[0];
      expect(ghostedLabeledThingGroupsInFrame.length).toBe(2);

      const realLtgif = ghostedLabeledThingGroupsInFrame[0];
      expect(realLtgif).toEqual(labeledThingGroupInFrame);

      const newGhostLtgif = ghostedLabeledThingGroupsInFrame[1];
      expect(newGhostLtgif.id).toEqual('absolutely-unique-id-no-questions-asked');
    });

    it('should resolve with combined previous ghost and newly created ghost', () => {
      const frameIndex = 423;

      const onFrameStartkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameEndkeyGroupOne = [labeledThingGroup.id, frameIndex];
      const onFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];
      const onFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex];

      const ghostingService = createGhostingService();

      const returnValue = ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
        [
          labeledThingGroup,
          labeledThingGroupTwo,
        ],
        frameIndex
      );
      const returnValueSpy = jasmine.createSpy('returnValue resolved');
      returnValue.then(returnValueSpy);

      resolveViewQuery(
        onFrameStartkeyGroupOne,
        onFrameEndkeyGroupOne,
        []
      );

      resolveViewQuery(
        onFrameStartkeyGroupTwo,
        onFrameEndkeyGroupTwo,
        []
      );

      const beforeFrameStartkeyGroupOne = [labeledThingGroup.id, frameIndex - 1];
      const beforeFrameEndkeyGroupOne = [labeledThingGroup.id, 0];

      resolveViewQuery(
        beforeFrameStartkeyGroupOne,
        beforeFrameEndkeyGroupOne,
        [
          labeledThingGroupInFrameDocument,
        ]
      );

      const beforeFrameStartkeyGroupTwo = [labeledThingGroupTwo.id, frameIndex - 1];
      const beforeFrameEndkeyGroupTwo = [labeledThingGroupTwo.id, 0];

      resolveViewQuery(
        beforeFrameStartkeyGroupTwo,
        beforeFrameEndkeyGroupTwo,
        []
      );

      const ghostedLabeledThingGroupsInFrame = returnValueSpy.calls.mostRecent().args[0];
      expect(ghostedLabeledThingGroupsInFrame.length).toBe(2);

      const ghostLtgif = ghostedLabeledThingGroupsInFrame[0];
      expect(ghostLtgif.id).toEqual('absolutely-unique-id-no-questions-asked');
      expect(ghostLtgif.classes).toEqual(labeledThingGroupInFrame.classes);

      const newGhostLtgif = ghostedLabeledThingGroupsInFrame[1];
      expect(newGhostLtgif.id).toEqual('absolutely-unique-id-no-questions-asked');
      expect(newGhostLtgif.classes).toEqual([]);
    });
  });
});
