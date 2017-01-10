import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';

import CouchDbModelDeserializer from 'Application/Common/Services/CouchDbModelDeserializer';

// Test fixture assets
import VideoCouchDbModel from 'Tests/Fixtures/Models/CouchDb/Video';
import TaskCouchDbModel from 'Tests/Fixtures/Models/CouchDb/Task';
import TaskFrontendModel from 'Tests/Fixtures/Models/Frontend/Task';
import LabeledThingCouchDbModel from 'Tests/Fixtures/Models/CouchDb/LabeledThing';
import LabeledThingFrontendModel from 'Tests/Fixtures/Models/Frontend/LabeledThing';
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

  it('should deserialize a task', () => {
    const task = deserializer.deserializeTask(TaskCouchDbModel, VideoCouchDbModel);
    expect(task).toEqual(TaskFrontendModel);
  });

  it('should deserialize a labeledThing', () => {
    const labeledThing = deserializer.deserializeLabeledThing(LabeledThingCouchDbModel, TaskFrontendModel);
    expect(labeledThing).toEqual(LabeledThingFrontendModel);
  });

  it('should deserialize a labeledThingInFrame', () => {
    const labeledThingInFrame = deserializer.deserializeLabeledThingInFrame(LabeledThingInFrameCouchDbModel, LabeledThingFrontendModel);
    expect(labeledThingInFrame).toEqual(LabeledThingInFrameFrontendModel);
  });
});
