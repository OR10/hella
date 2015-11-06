import StateMachine from 'Application/Common/Support/StateMachine';

export default class MetaLabelWorkflow {
  constructor($scope) {
    this.$scope = $scope;

    this.machine = new StateMachine([
      'start',
      'complete',
    ], 'start');

    this.machine.from('start').on('incomplete-labels').to('start');
    this.machine.from('start').on('complete-labels').to('complete')
      .register(this.$scope.storeLabeledFrame);
    this.machine.from('complete').on('incomplete-labels').to('start');
    this.machine.from('complete').on('complete-labels').to('complete')
      .register(this.$scope.storeLabeledFrame);
  }

  transition(transitionValue, ...args) {
    this.machine.transition(transitionValue, ...args);
  }
}
