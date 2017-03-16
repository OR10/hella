import CurrentUserService from 'Application/Common/Services/CurrentUserService';

fdescribe('CurrentUserService specs', () => {
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
      const returnedUser = currentUserService.get(user);
      expect(returnedUser).toBe(user);
    });
  });
});