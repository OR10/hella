import CurrentUserService from 'Application/Common/Services/CurrentUserService';

describe('CurrentUserService specs', () => {
  it('can be created', () => {
    const currentUserService = new CurrentUserService();
    expect(currentUserService).toEqual(jasmine.any(CurrentUserService));
  });

  describe('set/get', () => {
    it('throws if there is no user', () => {
      const currentUserService = new CurrentUserService();

      function throwWrapper() {
        currentUserService.get();
      }

      expect(throwWrapper).toThrow();
    });

    it('returns what is set', () => {
      const user = {};
      const currentUserService = new CurrentUserService();
      currentUserService.set(user);
      const returnedUser = currentUserService.get();
      expect(returnedUser).toBe(user);
    });
  });

  describe('setPermissions/getPermissions', () => {
    it('throws if there are no permissions', () => {
      const currentUserService = new CurrentUserService();

      function throwWrapper() {
        currentUserService.getPermissions();
      }

      expect(throwWrapper).toThrow();
    });

    it('returns the permissions that are set', () => {
      const permissions = {};
      const currentUserService = new CurrentUserService();
      currentUserService.setPermissions(permissions);
      const returnedPermissions = currentUserService.getPermissions();
      expect(returnedPermissions).toBe(permissions);
    });
  });

  describe('setOrganisations/getOrganisations', () => {
    it('throws if there are no organistations', () => {
      const currentUserService = new CurrentUserService();

      function throwWrapper() {
        currentUserService.getOrganisations();
      }

      expect(throwWrapper).toThrow();
    });

    it('returns the organisations that are set', () => {
      const organisations = {};
      const currentUserService = new CurrentUserService();
      currentUserService.setOrganisations(organisations);
      const returnedOrganisations = currentUserService.getOrganisations();
      expect(returnedOrganisations).toBe(organisations);
    });
  });
});