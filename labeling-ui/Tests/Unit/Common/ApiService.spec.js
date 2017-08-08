import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import ApiService from 'Application/Common/Services/ApiService';

describe('ApiService', () => {
  let getApiService;

  beforeEach(() => {
    getApiService = (configuration = {}) => {
      if (configuration.apiVersion === undefined) {
        configuration.apiVersion = 'v42';
      }

      let service;
      module($provide => {
        $provide.value('applicationConfig', {Common: configuration});
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

  describe('getApiUrl', () => {
    it('should provide url based on configuration', () => {
      const service = getApiService({backendPrefix: '/backend', apiPrefix: '/api/'});
      const apiUrl = service.getApiUrl('/');
      expect(apiUrl).toEqual('/backend/api/v42/');
    });

    it('should handle unneeded slashes correctly', () => {
      const service = getApiService({backendPrefix: '/backend/', apiPrefix: '/api/'});
      const apiUrl = service.getApiUrl('/');
      expect(apiUrl).toEqual('/backend/api/v42/');
    });

    using([
      ['/', '/'],
      ['', ''],
      ['/', ''],
      ['', '/'],
    ], (backendPrefix, apiPrefix) => {
      it('should work with two empty prefixes', () => {
        const service = getApiService({backendPrefix, apiPrefix});
        const apiUrl = service.getApiUrl('/');
        expect(apiUrl).toEqual('/v42/');
      });
    });

    using([
      ['', '/api'],
      ['/', '/api'],
    ], (backendPrefix, apiPrefix) => {
      it('should work with empty apiPrefix', () => {
        const service = getApiService({backendPrefix, apiPrefix});
        const apiUrl = service.getApiUrl('/');
        expect(apiUrl).toEqual('/api/v42/');
      });
    });

    using([
      ['/backend', ''],
      ['/backend', '/'],
    ], (backendPrefix, apiPrefix) => {
      it('should work with empty apiPrefix', () => {
        const service = getApiService({backendPrefix, apiPrefix});
        const apiUrl = service.getApiUrl('/');
        expect(apiUrl).toEqual('/backend/v42/');
      });
    });

    it('should append given path', () => {
      const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
      const apiUrl = service.getApiUrl('/some/path/I/specified');
      expect(apiUrl).toEqual('/v42/some/path/I/specified');
    });

    it('should encode and append given query string', () => {
      const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
      const apiUrl = service.getApiUrl('/', {param: 'value'});
      expect(apiUrl).toEqual('/v42/?param=value');
    });

    it('should properly handle empty query object', () => {
      const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
      const apiUrl = service.getApiUrl('/', {});
      expect(apiUrl).toEqual('/v42/');
    });

    it('should always create a deterministic order of query paramaters', () => {
      const service = getApiService({backendPrefix: '/', apiPrefix: '/'});
      const firstApiUrl = service.getApiUrl('/', {foo: 'foo', bar: 'bar'});
      const secondApiUrl = service.getApiUrl('/', {bar: 'bar', foo: 'foo'});
      expect(firstApiUrl).toEqual(secondApiUrl);
    });

    it('accepts a version parameter', () => {
      const service = getApiService({backendPrefix: '/', apiPrefix: '/api'});
      const apiUrl = service.getApiUrl('/', {}, 'v1337');
      expect(apiUrl).toEqual('/api/v1337/');
    });
  });

  describe('getFrontendUrl', () => {
    it('should provide url based on configuration', () => {
      const service = getApiService({frontendPrefix: '/frontend', appPrefix: '/labeling'});
      const frontendUrl = service.getFrontendUrl('/');
      expect(frontendUrl).toEqual('/frontend/labeling/');
    });

    it('should handle unneeded slashes correctly', () => {
      const service = getApiService({frontendPrefix: '/frontend/', appPrefix: '/labeling/'});
      const frontendUrl = service.getFrontendUrl('/');
      expect(frontendUrl).toEqual('/frontend/labeling/');
    });

    using([
      ['/', '/'],
      ['', ''],
      ['/', ''],
      ['', '/'],
    ], (frontendPrefix, appPrefix) => {
      it('should work with two empty prefixes', () => {
        const service = getApiService({frontendPrefix, appPrefix});
        const frontendUrl = service.getFrontendUrl('/');
        expect(frontendUrl).toEqual('/');
      });
    });

    using([
      ['', '/labeling'],
      ['/', '/labeling'],
    ], (frontendPrefix, appPrefix) => {
      it('should work with empty frontendPrefix', () => {
        const service = getApiService({frontendPrefix, appPrefix});
        const frontendUrl = service.getFrontendUrl('/');
        expect(frontendUrl).toEqual('/labeling/');
      });
    });

    using([
      ['/frontend', ''],
      ['/frontend', '/'],
    ], (frontendPrefix, appPrefix) => {
      it('should work with empty appPrefix', () => {
        const service = getApiService({frontendPrefix, appPrefix});
        const frontendUrl = service.getFrontendUrl('/');
        expect(frontendUrl).toEqual('/frontend/');
      });
    });

    it('should append given path', () => {
      const service = getApiService({frontendPrefix: '/', appPrefix: '/'});
      const frontendUrl = service.getFrontendUrl('/some/path/I/specified');
      expect(frontendUrl).toEqual('/some/path/I/specified');
    });

    it('should encode and append given query string', () => {
      const service = getApiService({frontendPrefix: '/', appPrefix: '/'});
      const frontendUrl = service.getFrontendUrl('/', {param: 'value'});
      expect(frontendUrl).toEqual('/?param=value');
    });

    it('should properly handle empty query object', () => {
      const service = getApiService({frontendPrefix: '/', appPrefix: '/'});
      const frontendUrl = service.getFrontendUrl('/', {});
      expect(frontendUrl).toEqual('/');
    });

    it('should always create a deterministic order of query paramaters', () => {
      const service = getApiService({frontendPrefix: '/', appPrefix: '/'});
      const firstFrontendUrl = service.getFrontendUrl('/', {foo: 'foo', bar: 'bar'});
      const secondFrontendUrl = service.getFrontendUrl('/', {bar: 'bar', foo: 'foo'});
      expect(firstFrontendUrl).toEqual(secondFrontendUrl);
    });

    using([
      ['/', '/'],
      ['', ''],
      ['/', ''],
      ['', '/'],
    ], (backendPrefix, monitorPrefix) => {
      it('should work with two empty prefixes', () => {
        const service = getApiService({backendPrefix, monitorPrefix});
        const monitorUrl = service.getMonitorUrl('/');
        expect(monitorUrl).toEqual('/');
      });
    });

    using([
      ['', '/backendPrefix'],
      ['/', '/backendPrefix'],
    ], (monitorPrefix, backendPrefix) => {
      it('should work with empty monitorPrefix', () => {
        const service = getApiService({backendPrefix, monitorPrefix});
        const monitorUrl = service.getMonitorUrl('/');
        expect(monitorUrl).toEqual('/backendPrefix/');
      });
    });

    using([
      ['/monitor', ''],
      ['/monitor', '/'],
    ], (monitorPrefix, backendPrefix) => {
      it('should work with empty appPrefix', () => {
        const service = getApiService({backendPrefix, monitorPrefix});
        const monitorUrl = service.getMonitorUrl('/');
        expect(monitorUrl).toEqual('/monitor/');
      });
    });
  });
});
