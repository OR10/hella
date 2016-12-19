import idleIndicatorTemplate from './IdleIndicatorDirective.html!';

class IdleIndicatorDirective {
  constructor(replicationStateService) {
    this.template = idleIndicatorTemplate;
    this.scope = {};
    this._replicationStateService = replicationStateService;
  }

  link(scope) {
    const replicationStateService = this._replicationStateService;
    Object.defineProperty(scope, 'isVisible', {
      get: replicationStateService.isReplicating.bind(replicationStateService),
    });
  }
}

IdleIndicatorDirective.$inject = [
  'replicationStateService',
];

export default IdleIndicatorDirective;

