import PouchDbViewService from 'Application/Common/Services/PouchDbViewService';

fdescribe('PouchDbViewService specs', () => {
  let service;

  beforeEach(() => {
    service = new PouchDbViewService();
  });

  it('can be created', () => {
    expect(service).toEqual(jasmine.any(PouchDbViewService));
  });

  describe('get()', () => {
    it('throws if the viewIdentifier is unknown', () => {
      function throwWrapper() {
        service.get('Wurstbrot');
      }

      expect(throwWrapper).toThrowError('Unknown view identifier Wurstbrot');
    });

    it('returns an object with a map function if the viewIdentifier exists', () => {
      const expected = {
        map: jasmine.any(Function),
      };

      const view = service.get('labeledThingGroupInFrameByTaskIdAndFrameIndex');

      expect(view).toEqual(expected);
    });
  });
});