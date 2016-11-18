import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';

import CouchDbModelDeserializer from 'Application/Common/Services/CouchDbModelDeserializer';

// Test fixture assets
import LabeledThingCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThing';
import LabeledThingInFrameCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThingInFrame';
import LabeledThingInFrameFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThingInFrame';

describe('CouchDbModelDeserializer', () => {
  /**
   * @type {CouchDbModelDeserializer}
   */
  let deserializer;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    inject($injector => {
      deserializer = $injector.instantiate(CouchDbModelDeserializer);
    });
  });

  it('should deserialize a labeledThingInFrame', () => {
    const deserializedModel = deserializer.deserializeLabeledThingInFrame(LabeledThingInFrameCouchDbModel, LabeledThingCouchDbModel);
    expect(deserializedModel).toEqual(LabeledThingInFrameFrontendModel);
  });
});
