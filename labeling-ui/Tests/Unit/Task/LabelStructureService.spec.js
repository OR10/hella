import {inject} from 'angular-mocks';
import angular from 'angular';

import LabelStructureModule from 'Application/LabelStructure/LabelStructure';
import TaskModule from 'Application/Task/TaskModule';
import CommonModule from 'Application/Common/Common';

import LabelStructureService from 'Application/Task/Services/LabelStructureService';
import LegacyLabelStructure from 'Application/Task/Model/LabelStructure/LegacyLabelStructure';
import RequirementsLabelStructure from 'Application/Task/Model/LabelStructure/RequirementsLabelStructure';

import labelStructureFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure.json!';
import annotationDictionaryFixture from 'Tests/Fixtures/LabelStructure/meta-label-structure-ui-annotation.json!';
import requirementsXmlData from 'Tests/Fixtures/LabelStructure/requirements.xml!text';
import taskFixture from 'Tests/Fixtures/Models/Frontend/Task';

describe('LabelStructureService', () => {
  /**
   * @type {LabelStructureService}
   */
  let service;

  /**
   * @type {angular.$rootScope}
   */
  let $rootScope;

  /**
   * @type {angular.$q}
   */
  let $q;

  /**
   * @type {AbortablePromiseFactory}
   */
  let abortablePromiseFactory;

  /**
   * @type {LabelStructureDataService}
   */
  let labelStructureDataServiceMock;

  beforeEach(() => {
    labelStructureDataServiceMock = jasmine.createSpyObj(
      'LabelStructureDataService',
      [
        'getLabelStructureTypeForTask',
        'getLegacyLabelStructureAndAnnotation',
        'getRequirementsFile',
      ]
    );

    const featureFlags = {};

    const commonModule = new CommonModule();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    const taskModule = new TaskModule();
    taskModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Task');

    const labelStructureModule = new LabelStructureModule();
    labelStructureModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.LabelStructure');

    module($provide => {
      $provide.value('labelStructureDataService', labelStructureDataServiceMock);
    });

    inject($injector => {
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
      abortablePromiseFactory = $injector.get('abortablePromiseFactory');

      labelStructureDataServiceMock.getLegacyLabelStructureAndAnnotation.and.returnValue(abortablePromiseFactory($q.resolve({
        structure: labelStructureFixture,
        annotation: annotationDictionaryFixture,
      })));

      labelStructureDataServiceMock.getRequirementsFile.and.returnValue(abortablePromiseFactory($q.resolve({
        data: requirementsXmlData,
      })));

      service = $injector.instantiate(LabelStructureService);
    });
  });

  it('should be instantiable', () => {
    expect(service instanceof LabelStructureService).toBe(true);
  });

  it('should provide LegacyLabelStructure for legacy task', () => {
    labelStructureDataServiceMock.getLabelStructureTypeForTask.and.returnValue(
      abortablePromiseFactory($q.resolve('legacy'))
    );

    let labelStructure;
    service.getLabelStructure(taskFixture).then(retrievedLabelStructure => labelStructure = retrievedLabelStructure);
    $rootScope.$apply();

    expect(labelStructureDataServiceMock.getLegacyLabelStructureAndAnnotation).toHaveBeenCalled();
    expect(labelStructure instanceof LegacyLabelStructure).toBe(true);
  });

  it('should provide LegacyLabelStructure for simple task', () => {
    labelStructureDataServiceMock.getLabelStructureTypeForTask.and.returnValue(
      abortablePromiseFactory($q.resolve('simple'))
    );

    let labelStructure;
    service.getLabelStructure(taskFixture).then(retrievedLabelStructure => labelStructure = retrievedLabelStructure);
    $rootScope.$apply();

    expect(labelStructureDataServiceMock.getLegacyLabelStructureAndAnnotation).toHaveBeenCalled();
    expect(labelStructure instanceof LegacyLabelStructure).toBe(true);
  });

  it('should provide RequirementsLabelStructure for requirements task', () => {
    labelStructureDataServiceMock.getLabelStructureTypeForTask.and.returnValue(
      abortablePromiseFactory($q.resolve('requirements'))
    );

    let labelStructure;
    service.getLabelStructure(taskFixture).then(retrievedLabelStructure => labelStructure = retrievedLabelStructure);
    $rootScope.$apply();

    expect(labelStructureDataServiceMock.getRequirementsFile).toHaveBeenCalled();
    expect(labelStructure instanceof RequirementsLabelStructure).toBe(true);
  });
});
