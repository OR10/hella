import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import EntityColorService from 'Application/Common/Services/EntityColorService';

describe('ApiService', () => {
  let getEntityColorService;

  beforeEach(() => {
    getEntityColorService = (colorPalettes) => {
      let service;

      module($provide => {
        $provide.value('applicationConfig', {
          Common: {
            colorPalettes: colorPalettes,
          },
        });
      });

      inject($injector => {
        service = $injector.instantiate(EntityColorService);
      });

      return service;
    };
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(getEntityColorService({}) instanceof EntityColorService).toEqual(true);
  });

  it('should pick colors from the right palette', () => {
    const service = getEntityColorService({'primary': ['abc', 'ghi'], 'secondary': ['def']});

    expect(service.getColorForEntity({}, 'primary')).toEqual('abc');
    expect(service.getColorForEntity({}, 'secondary')).toEqual('def');
    expect(service.getColorForEntity({}, 'primary')).toEqual('ghi');
  });

  it('should pick colors in order on successive calls', () => {
    const service = getEntityColorService({'primary': ['abc', 'def']});

    expect(service.getColorForEntity({}, 'primary')).toEqual('abc');
    expect(service.getColorForEntity({}, 'primary')).toEqual('def');
  });

  it('should loop around to the first color when requesting more colors than available', () => {
    const service = getEntityColorService({'primary': ['abc', 'def']});

    expect(service.getColorForEntity({}, 'primary')).toEqual('abc');
    expect(service.getColorForEntity({}, 'primary')).toEqual('def');
    expect(service.getColorForEntity({}, 'primary')).toEqual('abc');
  });
});
