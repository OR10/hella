import PartialApplicationState from './ApplicationStateProvider/PartialApplicationState';

class ApplicationStateProvider {
  $get($rootScope) {
    /**
     * @name ApplicationState
     * @type {$rootScope.$scope}
     */
    const state = $rootScope.$new();

    state.viewer = new PartialApplicationState();
    state.mediaControls = new PartialApplicationState();
    state.thumbnails = new PartialApplicationState();
    state.sidebarLeft = new PartialApplicationState();
    state.sidebarRight = new PartialApplicationState();
    state.timeline = new PartialApplicationState();
    state.header = new PartialApplicationState();

    state.disableAll = () => {
      ['viewer', 'mediaControls', 'thumbnails', 'sidebarLeft', 'sidebarRight', 'timeline', 'header'].forEach(component => {
        state[component].disable();
      });
    };

    state.enableAll = () => {
      ['viewer', 'mediaControls', 'thumbnails', 'sidebarLeft', 'sidebarRight', 'timeline', 'header'].forEach(component => {
        state[component].enable();
      });
    };

    state.startFrameChange = () => {
      state.sidebarRight.disable();
      state.sidebarRight.startFrameChange();

      state.viewer.disable();
      state.viewer.startFrameChange();
    };

    state.endFrameChange = () => {
      state.viewer.endFrameChange();
      state.viewer.enable();

      state.sidebarRight.endFrameChange();
      state.sidebarRight.enable();
    };

    return state;
  }
}

ApplicationStateProvider.prototype.$get.$inject = [
  '$rootScope',
];

export default ApplicationStateProvider;
