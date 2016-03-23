import PartialApplicationState from './ApplicationStateProvider/PartialApplicationState';
import ApplicationViewerState from './ApplicationStateProvider/ApplicationViewerState';

class ApplicationStateProvider {
  $get($rootScope) {
    /**
     * @name ApplicationState
     * @type {$rootScope.$scope}
     */
    const state = $rootScope.$new();

    state.viewer = new ApplicationViewerState();
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
      ['mediaControls', 'sidebarRight'].forEach(component => {
        state[component].disable();
        state[component].work();
      });
      state.viewer.disable(false);
      state.viewer.work();
    };

    state.endFrameChange = () => {
      ['viewer', 'mediaControls', 'sidebarRight'].forEach(component => {
        state[component].finish();
        state[component].enable();
      });
    };

    return state;
  }
}

ApplicationStateProvider.prototype.$get.$inject = [
  '$rootScope',
];

export default ApplicationStateProvider;
