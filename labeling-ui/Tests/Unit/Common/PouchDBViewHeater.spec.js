import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import PouchDbViewHeaterService from 'Application/Common/Services/PouchDbViewHeater';

describe('PouchDbViewHeater', () => {
  /**
   * @param {PouchDbViewHeater}
   */
  let pouchDbViewHeater;
  let pouchDbContext;
  let $rootScope;
  let expectedSingleDocumentConfig;
  let allDesignDocsResponse;

  beforeEach(() => {
    allDesignDocsResponse = {
      total_rows: 258,
      offset: 149,
      rows: [
        {
          id: '_design/ddoc1',
          key: '_design/ddoc1',
          value: {'rev': '1-a4cd71ecc53136676a3afaf1b7acf9c3'},
          doc: {
            _id: '_design/ddoc1',
            _rev: '1-a4cd71ecc53136676a3afaf1b7acf9c3',
            views: {view1: {map: 'function(doc) {}'}},
            language: 'javascript'
          }
        },
        {
          id: '_design/ddoc2',
          key: '_design/ddoc2',
          value: {'rev': '1-a4cd71ecc53136676a3afaf1b7acf9c3'},
          doc: {
            _id: '_design/ddoc2',
            _rev: '1-a4cd71ecc53136676a3afaf1b7acf9c3',
            views: {
              view1: {map: 'function(doc) {}'},
              view2: {map: 'function(doc) {}'},
            },
            language: 'javascript'
          }
        },
        {
          id: '_design/ddoc3',
          key: '_design/ddoc3',
          value: {'rev': '1-a4cd71ecc53136676a3afaf1b7acf9c3'},
          doc: {
            _id: '_design/ddoc3',
            _rev: '1-a4cd71ecc53136676a3afaf1b7acf9c3',
            views: {
              view1: {map: 'function(doc) {}'},
              view2: {map: 'function(doc) {}'},
              view3: {map: 'function(doc) {}'},
            },
            language: 'javascript'
          }
        },
      ]
    };

    const featureFlags = {
      pouchdb: true,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    inject(($injector, $q) => {
      pouchDbViewHeater = $injector.instantiate(PouchDbViewHeaterService);

      $rootScope = $injector.get('$rootScope');

      pouchDbContext = {
        query: jasmine.createSpy().and.callFake(() => {
        }),
        allDocs: jasmine.createSpy().and.callFake(() => {
          const deferred = $q.defer();
          deferred.resolve(allDesignDocsResponse);
          return deferred.promise;
        }),
      };

      expectedSingleDocumentConfig = {
        include_docs: false,
        limit: 1,
      }
    })
  })
  ;

  it('should be able to be instantiated', () => {
    expect(pouchDbViewHeater).toBeDefined();
  });

  it('should heat a single view', ()=> {
    const viewName = 'viewName123';
    pouchDbViewHeater.heatView(pouchDbContext, viewName);

    expect(pouchDbContext.query).toHaveBeenCalledWith(viewName, expectedSingleDocumentConfig);
  });

  it('should heat a multiple views', ()=> {
    const viewNames = ['viewName1', 'viewName2', 'viewName3'];
    pouchDbViewHeater.heatViews(pouchDbContext, viewNames);

    expect(pouchDbContext.query).toHaveBeenCalledWith(viewNames[0], expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith(viewNames[1], expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith(viewNames[2], expectedSingleDocumentConfig);
  });

  it('should heat all views of a specific design document', ()=> {
    const taskId = 'taskId123';
    pouchDbViewHeater.heatAllViewsForDesignDocument(pouchDbContext, allDesignDocsResponse.rows[1].doc);

    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc2/view1', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc2/view2', expectedSingleDocumentConfig);
  });

  it('should heat all views', ()=> {
    pouchDbViewHeater.heatAllViews(pouchDbContext);

    expect(pouchDbContext.allDocs).toHaveBeenCalledWith({
      include_docs: true,
      startkey: '_design/',
      endkey: '_design0',
    });

    $rootScope.$digest();

    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc1/view1', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc2/view1', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc2/view2', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc3/view1', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc3/view2', expectedSingleDocumentConfig);
    expect(pouchDbContext.query).toHaveBeenCalledWith('ddoc3/view3', expectedSingleDocumentConfig);
  });
});
