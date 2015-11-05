import StateMachine from 'Application/Common/Support/StateMachine';

export default class ObjectLabelWorkflow {
  constructor($scope) {
    this.$scope = $scope;
    this._vm = $scope.vm;

    this.machine = new StateMachine([
      'start',
      'new',
      'edit',
      'complete',
      'drawing',
    ], 'start');

    this.machine.from('start').on('new-labeled-thing').to('new')
      .register(() => $scope.$apply(() => this._vm.objectLabelContext = {}));
    this.machine.from('start').on('edit-labeled-thing').to('edit')
      .register((event, context) => $scope.$apply(() => this._vm.objectLabelContext = context));
    this.machine.from('new').on('incomplete-labels').to('new');
    this.machine.from('new').on('complete-labels').to('drawing')
      .register(() => $scope.$apply(() => this._vm.activeTool = 'drawing'));
    this.machine.from('edit').on('incomplete-labels').to('edit');
    this.machine.from('edit').on('complete-labels').to('complete')
      .register(this._vm.storeLabeledThingInFrame);
    this.machine.from('drawing').on('complete-labels').to('drawing');
    this.machine.from('drawing').on('incomplete-labels').to('new')
      .register(() => $scope.$apply(() => this._vm.activeTool = null));
    this.machine.from('drawing').on('new-thing').to('complete')
      .register(this._vm.storeLabeledThingInFrame);
    this.machine.from('complete').on('complete-labels').to('complete')
      .register(this._vm.storeLabeledThingInFrame);
    this.machine.from('complete').on('incomplete-labels').to('edit');
  }

  transition(transitionValue) {
    this.machine.transition(transitionValue);
  }
}