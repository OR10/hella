import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';
import PouchDB from 'pouchdb';

import StorageContextFactory from 'Application/Common/Services/StorageContextFactory';

describe('StorageContextFactory', () => {
  let getContextFactory;

  beforeEach(() => {
    getContextFactory = (configuration = {}) => {
      let factory;
      module($provide => {
        $provide.value('applicationConfig', {Common: configuration});
        $provide.value('PouchDB', PouchDB);
      });
      inject($injector => {
        factory = $injector.instantiate(StorageContextFactory);
      });

      return factory;
    };
  });

  it('should be able to be instantiated', () => {
    expect(getContextFactory() instanceof StorageContextFactory).toEqual(true);
  });
});
