import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import PouchDBViewHeaterService from 'Application/Common/Services/PouchDBViewHeater';

describe('PouchDBViewHeater', () => {
  /**
   * @param {PouchDBViewHeater}
   */
  let pouchDBViewHeater;
  let pouchDb;
  let $rootScope;
  const mockConfig = {
    Common: {
      storage: {
        local: {
          databaseName: 'AnnoStation',
        },
        remote: {
          baseUrl: 'http://localhost:5984/',
          databaseName: 'AnnoStation',
        },
      },
    },
  };

  const storageContextFactory = {
    getContextForTaskName: () => {
      return pouchDb;
    },
  };

  beforeEach(module($provide => {
    $provide.value('applicationConfig', mockConfig);
    $provide.value('PouchDB', pouchDb);
    $provide.value('storageContextFactory', storageContextFactory);
  }));

  beforeEach(inject(($injector, $q) => {
    pouchDBViewHeater = $injector.instantiate(PouchDBViewHeaterService);

    $rootScope = $injector.get('$rootScope');

    pouchDb = {
      query: jasmine.createSpy().and.callFake(() => {
      }),
      allDocs: jasmine.createSpy().and.callFake(() => {
        const deferred = $q.defer();
        deferred.resolve([{key: 'view1'}, {key: 'view2'}, {key: 'view3'}]);
        return deferred.promise;
      }),
    };
  }));

  it('should be able to be instantiated', () => {
    expect(pouchDBViewHeater).toBeDefined();
  });

  it('should heat a single view', ()=> {
    const taskId = 'taskId123';
    const viewName = 'viewName123';
    pouchDBViewHeater.heatView(taskId, viewName);

    expect(pouchDb.query).toHaveBeenCalledWith(viewName);
  });

  it('should heat a multiple views', ()=> {
    const taskId = 'taskId123';
    const viewNames = ['viewName1', 'viewName2', 'viewName3'];
    pouchDBViewHeater.heatViews(taskId, viewNames);

    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[0]);
    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[1]);
    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[2]);
  });

  it('should heat all views', ()=> {
    spyOn(pouchDBViewHeater, 'heatView');
    const taskId = 'taskId123';
    pouchDBViewHeater.heatAllViews(taskId);

    expect(pouchDb.allDocs).toHaveBeenCalledWith({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    });

    $rootScope.$digest();


    expect(pouchDBViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view1');
    expect(pouchDBViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view2');
    expect(pouchDBViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view3');
  });
});
