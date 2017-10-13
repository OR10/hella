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
import LabeledThingGroupInFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThingGroupInFrame';
import LabeledThingGroupInFrameFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThingGroupInFrame';
import LabeledFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledFrame';
import LabeledFrameFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledFrame';

import FrameRangeCouchDbModel from 'Tests/Fixtures/Models/CouchDb/FrameRange';
import FrameRangeFrontendModel from 'Tests/Fixtures/Models/Frontend/FrameRange';

describe('CouchDbModelSerializer', () => {
  /**
   * @type {CouchDbModelSerializer}
   */
  let serializer;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular, {});
    module('AnnoStation.Common');

    inject($injector => {
      serializer = $injector.instantiate(CouchDbModelSerializer);
    });
  });

  using([
    [LabeledThingFrontendModel, LabeledThingCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING],
    [LabeledThingGroupFrontendModel, LabeledThingGroupCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP],
    [LabeledThingGroupInFrameFrontendModel, LabeledThingGroupInFrameCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP_IN_FRAME],
    [LabeledFrameFrontendModel, LabeledFrameCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_FRAME],
  ], (frontendModel, couchDbModel) => {
    it('serialize model by guessing its type', () => {
      const couchDbModelWithoutRevision = angular.copy(couchDbModel);
      delete couchDbModelWithoutRevision._rev;

      spyOn(frontendModel, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');

      const serializedCouchDbModel = serializer.serialize(frontendModel);
      expect(serializedCouchDbModel).toEqual(couchDbModelWithoutRevision);
    });
  });

  using([
    [LabeledThingFrontendModel, LabeledThingCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING],
    [LabeledThingGroupFrontendModel, LabeledThingGroupCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP],
    [LabeledThingGroupInFrameFrontendModel, LabeledThingGroupInFrameCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_THING_GROUP_IN_FRAME],
    [FrameRangeFrontendModel, FrameRangeCouchDbModel, CouchDbModelSerializer.TYPE_FRAME_RANGE],
    [LabeledFrameFrontendModel, LabeledFrameCouchDbModel, CouchDbModelSerializer.TYPE_LABELED_FRAME],
  ], (frontendModel, couchDbModel, type) => {
    it('serialize model by specifying its type', () => {
      const couchDbModelWithoutRevision = angular.copy(couchDbModel);
      delete couchDbModelWithoutRevision._rev;

      if (type !== CouchDbModelSerializer.TYPE_FRAME_RANGE) {
        spyOn(frontendModel, '_getCurrentDate').and.returnValue('2017-09-05 16:11:56.000000');
      }

      const serializedCouchDbModel = serializer.serialize(frontendModel, type);
      expect(serializedCouchDbModel).toEqual(couchDbModelWithoutRevision);
    });
  });
});
