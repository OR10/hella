import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import PouchDbViewHeaterService from 'Application/Common/Services/PouchDbViewHeater';

xdescribe('PouchDbViewHeater', () => {
  /**
   * @param {PouchDbViewHeater}
   */
  let pouchDbViewHeater;
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
    pouchDbViewHeater = $injector.instantiate(PouchDbViewHeaterService);

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
    expect(pouchDbViewHeater).toBeDefined();
  });

  it('should heat a single view', ()=> {
    const taskId = 'taskId123';
    const viewName = 'viewName123';
    pouchDbViewHeater.heatView(taskId, viewName);

    expect(pouchDb.query).toHaveBeenCalledWith(viewName);
  });

  it('should heat a multiple views', ()=> {
    const taskId = 'taskId123';
    const viewNames = ['viewName1', 'viewName2', 'viewName3'];
    pouchDbViewHeater.heatViews(taskId, viewNames);

    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[0]);
    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[1]);
    expect(pouchDb.query).toHaveBeenCalledWith(viewNames[2]);
  });

  it('should heat all views', ()=> {
    spyOn(pouchDbViewHeater, 'heatView');
    const taskId = 'taskId123';
    pouchDbViewHeater.heatAllViews(taskId);

    expect(pouchDb.allDocs).toHaveBeenCalledWith({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    });

    $rootScope.$digest();


    expect(pouchDbViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view1');
    expect(pouchDbViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view2');
    expect(pouchDbViewHeater.heatView).toHaveBeenCalledWith(taskId, 'view3');
  });
});
