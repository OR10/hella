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

      expect(throwWrapper).toThrowError();
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

      expect(throwWrapper).toThrowError();
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

      expect(throwWrapper).toThrowError();
    });

    it('returns the organisations that are set', () => {
      const organisations = {};
      const currentUserService = new CurrentUserService();
      currentUserService.setOrganisations(organisations);
      const returnedOrganisations = currentUserService.getOrganisations();
      expect(returnedOrganisations).toBe(organisations);
    });
  });

  describe('isSuperAdmin', () => {
    it('throws false by default (because there is no user set)', () => {
      const currentUserService = new CurrentUserService();
      const throwWrapper = function() {
        currentUserService.isSuperAdmin();
      }

      expect(throwWrapper).toThrowError();
    });

    it('returns false if the set user does not have the super admin role', () => {
      const user = {
        roles: ['LABELER', 'ADMIN'],
      };
      const currentUserService = new CurrentUserService();
      currentUserService.set(user);

      const isSuperAdmin = currentUserService.isSuperAdmin();

      expect(isSuperAdmin).toBe(false);
    });

    it('returns true if the set user has the super admin role', () => {
      const user = {
        roles: ['LABELER', 'ADMIN', 'ROLE_SUPER_ADMIN'],
      };
      const currentUserService = new CurrentUserService();
      currentUserService.set(user);

      const isSuperAdmin = currentUserService.isSuperAdmin();

      expect(isSuperAdmin).toBe(true);
    });
  });
});