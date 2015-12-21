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
    const service = getEntityColorService({'primary': {'1': 'abc', '2': 'ghi'}, 'secondary': {'1': 'def'}});

    expect(service.getColorById('1', 'primary')).toEqual('abc');
    expect(service.getColorById('1', 'secondary')).toEqual('def');
    expect(service.getColorById('2', 'primary')).toEqual('ghi');
  });

  it('should pick colors in order on successive calls', () => {
    const service = getEntityColorService({'primary': {'1': 'abc', '2': 'def'}});

    expect(service.getColorId()).toEqual('1');
    expect(service.getColorId()).toEqual('2');
  });

  it('should loop around to the first color when requesting more colors than available', () => {
    const service = getEntityColorService({'primary': {'1': 'abc', '2': 'def'}});

    expect(service.getColorId()).toEqual('1');
    expect(service.getColorId()).toEqual('2');
    expect(service.getColorId()).toEqual('1');
  });
});
