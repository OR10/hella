import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';

import CouchDbModelSerializer from 'Application/Common/Services/CouchDbModelSerializer';

// Test fixture assets
import LabeledThingCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThing';
import LabeledThingFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';
import LabeledThingGroupCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroup';
import LabeledThingGroupFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThingGroup';

import FrameRangeCouchDbModel from 'Tests/Fixtures/Models/CouchDb/FrameRange';
import FrameRangeFrontendModel from 'Tests/Fixtures/Models/Frontend/FrameRange';

describe('CouchDbModelSerializer', () => {
  /**
   * @type {CouchDbModelSerializer}
   */
  let serializer;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: true,
    };
    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    inject($injector => {
      serializer = $injector.instantiate(CouchDbModelSerializer);
    });
  });

  using([
    [LabeledThingFrontendModel, LabeledThingCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING],
    // TODO: After live migration is present reactivate this testcase
    // [LabeledThingGroupFrontendModel, LabeledThingGroupCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP],
  ], (frontendModel, couchDbModel) => {
    it('serialize model by guessing its type', () => {
      const couchDbModelWithoutRevision = angular.copy(couchDbModel);
      delete couchDbModelWithoutRevision._rev;

      const serializedCouchDbModel = serializer.serialize(frontendModel);
      expect(serializedCouchDbModel).toEqual(couchDbModelWithoutRevision);
    });
  });

  using([
    [LabeledThingFrontendModel, LabeledThingCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING],
    // TODO: After live migration is present reactivate this testcase
    // [LabeledThingGroupFrontendModel, LabeledThingGroupCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP],
    [FrameRangeFrontendModel, FrameRangeCouchDbModel, CouchDbModelSerializer.TYPE_FRAME_RANGE],
  ], (frontendModel, couchDbModel, type) => {
    it('serialize model by specifying its type', () => {
      const couchDbModelWithoutRevision = angular.copy(couchDbModel);
      delete couchDbModelWithoutRevision._rev;

      const serializedCouchDbModel = serializer.serialize(frontendModel, type);
      expect(serializedCouchDbModel).toEqual(couchDbModelWithoutRevision);
    });
  });
});
