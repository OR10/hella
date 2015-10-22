import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import ApiService from 'Application/Common/Services/ApiService';

describe('ApiService', () => {
  let getApiService;

  beforeEach(() => {
    getApiService = (configuration = {}) => {
      let service;
      module($provide => {
        $provide.value('applicationConfig', {common: configuration});
      });
      inject($injector => {
        service = $injector.instantiate(ApiService);
      });

      return service;
    };
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(getApiService() instanceof ApiService).toEqual(true);
  });

  it('should provide url based on configuration', () => {
    const service = getApiService({backendPrefix: '/backend', apiPrefix: '/api'});
    const apiUrl = service.buildApiUrl('/');
    expect(apiUrl).toEqual('/backend/api/');
  });

  it('should handle unneeded slashes correctly', () => {
    const service = getApiService({backendPrefix: '/backend/', apiPrefix: '/api/'});
    const apiUrl = service.buildApiUrl('/');
    expect(apiUrl).toEqual('/backend/api/');
  });

  using([
    ['/', '/'],
    ['', ''],
    ['/', ''],
    ['', '/']
  ], (backendPrefix, apiPrefix) => {
    it('should work with two empty prefixes', () => {
      const service = getApiService({backendPrefix, apiPrefix});
      const apiUrl = service.buildApiUrl('/');
      expect(apiUrl).toEqual('/');
    });
  });

  using([
    ['', '/api'],
    ['/', '/api'],
  ], (backendPrefix, apiPrefix) => {
    it('should work with empty apiPrefix', () => {
      const service = getApiService({backendPrefix, apiPrefix});
      const apiUrl = service.buildApiUrl('/');
      expect(apiUrl).toEqual('/api/');
    });
  });

  using([
    ['/backend', ''],
    ['/backend', '/'],
  ], (backendPrefix, apiPrefix) => {
    it('should work with empty apiPrefix', () => {
      const service = getApiService({backendPrefix, apiPrefix});
      const apiUrl = service.buildApiUrl('/');
      expect(apiUrl).toEqual('/backend/');
    });
  });

  it('should append given path', ()  => {
    const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
    const apiUrl = service.buildApiUrl('/some/path/I/specified');
    expect(apiUrl).toEqual('/some/path/I/specified');
  });

  it('should encode and append given query string', ()  => {
    const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
    const apiUrl = service.buildApiUrl('/', {param: "value"});
    expect(apiUrl).toEqual('/?param=value');
  });

  it('should properly handle empty query object', ()  => {
    const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
    const apiUrl = service.buildApiUrl('/', {});
    expect(apiUrl).toEqual('/');
  });

  it('should always create a deterministic order of query paramaters', ()  => {
    const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
    const firstApiUrl = service.buildApiUrl('/', {a: 'foo', b: 'bar'});
    const secondApiUrl = service.buildApiUrl('/', {b: 'bar', a: 'foo'});
    expect(firstApiUrl).toEqual(secondApiUrl);
  });
});
