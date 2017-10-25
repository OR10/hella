import {inject} from 'angular-mocks';
import TaskListController from 'Application/ManagementBoard/Directives/TaskListController';

describe('TaskListController', () => {
  let scope;
  let angularQ;

  let taskListController;

  let loggerServiceMock;
  let taskGatewayMock;
  let modalServiceMock;
  let selectionDialogMock;
  let replicationStateServiceMock;

  beforeEach(inject(($rootScope, $q) => {
    scope = $rootScope.$new();
    angularQ = $q;
    loggerServiceMock = jasmine.createSpyObj('loggerService', ['createContext']);
    taskGatewayMock = jasmine.createSpyObj('taskGateway', ['unassignUserFromTask', 'flagTask', 'moveTaskToPhase']);
    modalServiceMock = jasmine.createSpyObj('modalService', ['createContext']);
    selectionDialogMock = jasmine.createSpyObj('selectionDialog', ['createContext']);
    replicationStateServiceMock = jasmine.createSpyObj('replicationStateService', ['createContext']);
  }));

  beforeEach(() => {
    taskListController = new TaskListController(
      scope,
      null, // $state
      angularQ,
      loggerServiceMock,
      taskGatewayMock,
      modalServiceMock,
      selectionDialogMock,
      replicationStateServiceMock
    );

    taskListController.tasks = [
      {
        id: 'task-id-1',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
      {
        id: 'task-id-2',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
      {
        id: 'task-id-3',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
      {
        id: 'task-id-4',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
      {
        id: 'task-id-5',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
      {
        id: 'task-id-6',
        latestAssignee: {
          id: 'user-id-1',
          username: 'username-1',
        },
      },
    ];
  });

  it('numberOfSelectedTasks', () => {
    taskListController.selectedTasks = {
      'task-id-1': true,
      'task-id-2': true,
      'task-id-3': true,
      'task-id-4': true,
      'task-id-5': false,
      'task-id-6': false,
    };

    expect(taskListController._numberOfSelectedTasks()).toEqual(4);
  });

  describe('calculateAllSelectionsCheckbox', () => {
    it('should be false', () => {
      taskListController.selectedTasks = {
        'task-id-1': true,
        'task-id-2': true,
        'task-id-3': true,
        'task-id-4': true,
        'task-id-5': false,
        'task-id-6': false,
      };

      taskListController.calculateAllSelectionCheckbox();

      expect(taskListController.isAllSelected).toBeFalsy();
    });

    it('should be true', () => {
      taskListController.selectedTasks = {
        'task-id-1': true,
        'task-id-2': true,
        'task-id-3': true,
        'task-id-4': true,
        'task-id-5': true,
        'task-id-6': true,
      };

      taskListController.calculateAllSelectionCheckbox();

      expect(taskListController.isAllSelected).toBeTruthy();
    });
  });

  describe('selectUnselectAllSelections', () => {
    it('select all', () => {
      taskListController.isAllSelected = true;
      taskListController.toggleAllSelections();

      expect(taskListController._numberOfSelectedTasks()).toEqual(6);
    });

    it('unselect all', () => {
      taskListController._unselectAllSelections();

      expect(taskListController._numberOfSelectedTasks()).toEqual(0);
    });
  });

  describe('unassignUsersFromTasks', () => {
    it('unassign all users from tasks', () => {
      taskListController.selectedAction = 'unassignUsers';

      taskListController.selectedTasks = {
        'task-id-1': true,
      };
      taskGatewayMock.unassignUserFromTask.and.returnValue(angularQ.resolve());

      taskListController.doAction();
      expect(taskGatewayMock.unassignUserFromTask).toHaveBeenCalled();
    });
  });

  describe('flagTasks', () => {
    it('flag all selected tasks', () => {
      taskListController.user = {
        username: 'username-1',
      };
      taskListController.selectedAction = 'flagTasks';

      taskListController.selectedTasks = {
        'task-id-1': true,
      };
      taskGatewayMock.flagTask.and.returnValue(angularQ.resolve());

      taskListController.doAction();
      expect(taskGatewayMock.flagTask).toHaveBeenCalled();
    });
  });

  describe('moveTasksInOtherPhase', () => {
    it('move all selected tasks in other phase', () => {
      taskListController.user = {
        username: 'username-1',
      };
      taskListController.selectedAction = 'flagTasks';

      taskListController.selectedTasks = {
        'task-id-1': true,
      };

      taskGatewayMock.moveTaskToPhase.and.returnValue(angularQ.resolve());

      taskListController._moveTasksInOtherPhase(taskListController.tasks, 'in_progress');
      expect(taskGatewayMock.moveTaskToPhase).toHaveBeenCalled();
    });
  });
});
