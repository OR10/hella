import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import LabeledThingGroupGateway from 'Application/LabelingData/Gateways/LabeledThingGroupGateway';
import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';
import LabeledThingGroupInFrame from 'Application/LabelingData/Models/LabeledThingGroupInFrame';

describe('LabeledThingGroupGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelingData');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('labeledThingGateway', {
        saveLabeledThing: jasmine.createSpy('saveLabeledThing').and.callFake(() => {
        }),
      });

      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledThingGroupGateway);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingGroupGateway).toEqual(true);
  });

  it('should receive labeled thing groups in frame by frame index', done => {
    const task = {id: 'someTaskId234'};
    const frameIndex = '123';
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingGroupInFrame/frame/${frameIndex}`;

    const response = {
      result: {
        labeledThingGroupsInFrame: [
          {
            id: 'LTGIF-1',
            frameIndex,
            classes: [],
            labeledThingGroupId: 'LTG-1',
          },
        ],
        labeledThingGroups: [
          {
            id: 'LTG-1',
            groupType: 'fancy-group-type',
            lineColor: 423,
            groupIds: null,
          },
        ],
      },
    };


    const expectedResult = new LabeledThingGroupInFrame({
      id: 'LTGIF-1',
      frameIndex,
      classes: [],
      labeledThingGroupId: 'LTG-1',
      labeledThingGroup: new LabeledThingGroup({
        task,
        id: 'LTG-1',
        groupType: 'fancy-group-type',
        lineColor: 423,
        groupIds: null,
      }),
    });

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, response);

    gateway.getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex)
      .then(result => {
        expect(result).toEqual([expectedResult]);
        done();
      });

    $httpBackend.flush();
  });

  it('should delete a labeled thing group', done => {
    const ltg = new LabeledThingGroup({
      id: 'LTG-1',
      groupType: 'fancy-group-type',
      lineColor: 423,
      groupIds: null,
      task: {
        id: 'TASK-1',
      },
    });
    const expectedUrl = `/backend/api/task/TASK-1/labeledThingGroup/${ltg.id}`;

    const expectedResult = {
      result: {
        success: true,
      },
    };

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    gateway.deleteLabeledThingGroup(ltg)
      .then(result => {
        expect(result).toBeTruthy();
        done();
      });

    $httpBackend.flush();
  });

  it('should create a labeled thing group with given type', done => {
    const expectedUrl = `/backend/api/task/TASK-1/labeledThingGroup`;
    const task = {
      id: 'TASK-1',
    };

    const ltg = new LabeledThingGroup({
      task,
      id: 'LTG-1',
      groupType: 'fancy-group-type',
      lineColor: 423,
      groupIds: null,
    });

    $httpBackend
      .expect('POST', expectedUrl, {groupType: ltg.type, lineColor: ltg.lineColor})
      .respond(200, {result: ltg.toJSON()});

    gateway.createLabeledThingGroup(task, ltg)
      .then(result => {
        expect(result).toEqual(ltg);
        done();
      });

    $httpBackend.flush();
  });
});
