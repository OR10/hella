class PartialApplicationState {
  constructor() {
    this._disabled = 0;
    this._working = 0;
  }

  get isDisabled() {
    return this._disabled !== 0;
  }

  disable() {
    this._disabled += 1;
  }

  enable() {
    if (this._disabled === 0) {
      throw new Error('Tried to enable component, which is already enabled. Possible disable/enable mismatch.');
    }

    this._disabled -= 1;
  }

  get isWorking() {
    return this._working !== 0;
  }

  work() {
    this._working += 1;
  }

  finish() {
    if (this._working === 0) {
      throw new Error('Tried to set component to finish, which is already finished. Possible work/finish mismatch.');
    }

    this._working -= 1;
  }
}

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

    return state;
  }
}

ApplicationStateProvider.prototype.$get.$inject = [
  '$rootScope',
];

export default ApplicationStateProvider;
