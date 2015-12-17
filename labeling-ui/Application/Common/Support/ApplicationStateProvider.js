class ApplicationStateProvider {
  $get($rootScope) {
    const state = $rootScope.$new();

    state.viewer = {
      disabled: false,
    };

    state.mediaControls = {
      disabled: false,
    };

    state.thumbnails = {
      disabled: false,
    };

    state.sidebarLeft = {
      disabled: false,
    };

    state.sidebarRight = {
      disabled: false,
    };

    state.timeline = {
      disabled: false,
    };

    state.header = {
      disabled: false,
    };

    state.disableAll = () => {
      ['viewer', 'mediaControls', 'thumbnails', 'sidebarLeft', 'sidebarRight', 'timeline', 'header'].forEach(component => {
        state[component].disabled = true;
      });
    };

    state.enableAll = () => {
      ['viewer', 'mediaControls', 'thumbnails', 'sidebarLeft', 'sidebarRight', 'timeline', 'header'].forEach(component => {
        state[component].disabled = false;
      });
    };

    return state;
  }
}

ApplicationStateProvider.prototype.$get.$inject = [
  '$rootScope',
];

export default ApplicationStateProvider;
