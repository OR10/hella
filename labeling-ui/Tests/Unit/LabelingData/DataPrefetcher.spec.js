import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';
import LabelingData from 'Application/LabelingData/LabelingData';

import DataPrefetcher from 'Application/LabelingData/Services/DataPrefetcher';

describe('DataPrefetcher', () => {
  let dataPrefetcher;
  let labeledThingInFrameGateway;
  let labeledThingInFrameData;
  let labeledThingData;
  let $rootScope;
  let $q;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    const labelingDataModule = new LabelingData();
    labelingDataModule.registerWithAngular(angular);
    module('AnnoStation.LabelingData');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();

      labeledThingInFrameGateway = {};
      $provide.value('labeledThingInFrameGateway', labeledThingInFrameGateway);

      $provide.value('loggerService', {
        log: () => {},
      });
    });

    inject($injector => {
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
      labeledThingInFrameData = $injector.get('labeledThingInFrameData');
      labeledThingData = $injector.get('labeledThingData');

      dataPrefetcher = $injector.instantiate(DataPrefetcher);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(dataPrefetcher instanceof DataPrefetcher).toEqual(true);
  });

  it('should fetch LabeledThingInFrame data in chunks', () => {
    const startFrameNumber = 1;
    const task = {
      frameRange: {
        startFrameNumber: 1,
        endFrameNumber: 30,
      },
    };

    labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame = jasmine.createSpy('LabeledThingInFrameGateway#bulkFetchLabeledThingsInFrame')
      .and.callFake((taskObject, startFrame) => {
        switch (startFrame) {
          case 1:
            return $q.resolve([{frameNumber: 2}, {frameNumber: 14}]);
          case 21:
            return $q.resolve([{frameNumber: 23}]);
          default:
            return $q.resolve([]);
        }
      });

    dataPrefetcher.prefetchLabeledThingsInFrame(task, startFrameNumber);

    $rootScope.$digest();

    expect(labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame.calls.count()).toEqual(2);
    expect(labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame.calls.argsFor(0)).toEqual([task, 1, 20]);
    expect(labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame.calls.argsFor(1)).toEqual([task, 21, 10]);

    expect(labeledThingInFrameData.get(2)).toEqual([{frameNumber: 2}]);
    expect(labeledThingInFrameData.get(14)).toEqual([{frameNumber: 14}]);
    expect(labeledThingInFrameData.get(23)).toEqual([{frameNumber: 23}]);
  });

  const labeledThing = {
    id: 'some-test-id',
  };

  using([
    [1, [{id: 'foobar', labeledThing}], [{id: 'barbaz', labeledThing}], [{id: 'bazfoo', labeledThing}]],
    [2, [{id: 'barbaz', labeledThing}], [{id: 'bazfoo', labeledThing}], [{id: 'foobar', labeledThing}]],
  ], (startFrameNumber, expectedData, ignoredNewData, newData) => {
    it('should fetch LabeledThingInFrame data for a single LabeledThing', () => {
      const task = {
        frameRange: {
          startFrameNumber: 1,
          endFrameNumber: 4,
        },
      };

      labeledThingInFrameGateway.getLabeledThingInFrame = jasmine.createSpy('LabeledThingInFrameGateway#getLabeledThingInFrame')
        .and.returnValue($q.resolve(expectedData));

      dataPrefetcher.prefetchSingleLabeledThing(task, labeledThing, startFrameNumber);
      $rootScope.$digest();

      expect(labeledThingInFrameGateway.getLabeledThingInFrame.calls.count()).toEqual(1);
      expect(labeledThingInFrameGateway.getLabeledThingInFrame.calls.argsFor(0)).toEqual(
        [
          task,
          startFrameNumber,
          labeledThing,
          0,
          task.frameRange.endFrameNumber - startFrameNumber + 1,
        ]
      );

      expect(labeledThingData.get(labeledThing.id)).toEqual(expectedData);

      labeledThingInFrameGateway.getLabeledThingInFrame.calls.reset();

      dataPrefetcher.prefetchSingleLabeledThing(task, labeledThing, startFrameNumber);
      $rootScope.$digest();

      expect(labeledThingInFrameGateway.getLabeledThingInFrame).not.toHaveBeenCalled();
      expect(labeledThingData.get(labeledThing.id)).toEqual(expectedData);

      labeledThingInFrameGateway.getLabeledThingInFrame.calls.reset();

      labeledThingInFrameGateway.getLabeledThingInFrame = jasmine.createSpy('LabeledThingInFrameGateway#getLabeledThingInFrame')
        .and.returnValue($q.resolve(newData));

      dataPrefetcher.prefetchSingleLabeledThing(task, labeledThing, startFrameNumber, true);
      $rootScope.$digest();

      expect(labeledThingInFrameGateway.getLabeledThingInFrame.calls.count()).toEqual(1);
      expect(labeledThingInFrameGateway.getLabeledThingInFrame.calls.argsFor(0)).toEqual(
        [
          task,
          startFrameNumber,
          labeledThing,
          0,
          task.frameRange.endFrameNumber - startFrameNumber + 1,
        ]
      );

      expect(labeledThingData.get(labeledThing.id)).toEqual(newData);
    });
  });
});
