import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import StatisticsGateway from 'Application/Statistics/Gateways/StatisticsGateway';

fdescribe('StatisticsGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(StatisticsGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof StatisticsGateway).toBe(true);
  });

  it('should load a list of task statistics', (done) => {
    const response = {
      result: [
        {
          taskId: '7999cf8d8d5275330fa67fc69501d977',
          totalNumberOfLabeledThings: 1,
          totalLabelingTimeInSeconds: 62580,
        },
        {
          taskId: '7999cf8d8d5275330fa67fc69502b446',
          totalNumberOfLabeledThings: 2,
          totalLabelingTimeInSeconds: 3540,
        },
      ],
    };

    $httpBackend.expectGET('/backend/api/statistics/tasks').respond(response);

    gateway.getTaskStatistics().then(stats => {
      expect(stats).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });
});
