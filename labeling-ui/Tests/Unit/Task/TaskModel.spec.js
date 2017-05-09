import Task from 'Application/Task/Model/Task';
import User from 'Application/ManagementBoard/Models/User';

describe('Task model', () => {
  let users;
  let task;

  beforeEach(() => {
    users = {
      'user-id-1': new User({id: 'user-id-1'}),
      'user-id-2': new User({id: 'user-id-2'}),
      'user-id-3': new User({id: 'user-id-3'}),
      'user-id-4': new User({id: 'user-id-4'}),
      'user-id-5': new User({id: 'user-id-5'}),
    };
    task = {
      id: 'task-id-1',
      assignmentHistory: [
        {userId: null, assignedAt: '100', phase: 'labeling', status: 'todo'},
        {userId: 'user-id-1', assignedAt: '123', phase: 'labeling', status: 'in_progress'},
        {userId: 'user-id-2', assignedAt: '423', phase: 'labeling', status: 'in_progress'},
        {userId: null, assignedAt: '888', phase: 'review', status: 'todo'},
        {userId: 'user-id-3', assignedAt: '999', phase: 'review', status: 'in_progress'},
      ],
    };
  });

  it('should be instantiaable', () => {
    const model = new Task({id: 'task-1'}, {});
    expect(model instanceof Task).toBe(true);
  });

  it('should retrieve latest assignment for labeling phase', () => {
    const model = new Task(task, users);
    const assignment = model.getLatestAssignmentForPhase('labeling');

    expect(assignment).toEqual(task.assignmentHistory[2]);
  });

  it('should retrieve latest assignment for review phase', () => {
    const model = new Task(task, users);
    const assignment = model.getLatestAssignmentForPhase('review');

    expect(assignment).toEqual(task.assignmentHistory[4]);
  });

  it('should resolve userId from assignment', () => {
    const model = new Task(task, users);
    const user = model.lookupUserFromAssignment('user-id-4');

    expect(user).toEqual(users['user-id-4']);
  });

  it('should retrieve latest assigned user for labeling phase', () => {
    const model = new Task(task, users);
    const user = model.getLatestAssignedUserForPhase('labeling');

    expect(user).toEqual(users['user-id-2']);
  });

  it('should retrieve latest assigned user for labeling review', () => {
    const model = new Task(task, users);
    const user = model.getLatestAssignedUserForPhase('review');

    expect(user).toEqual(users['user-id-3']);
  });

  it('should extract id from embedded video', () => {
    const taskWithVideo = {
      id: 'task-id-2',
      assignmentHistory: [
        {userId: null, assignedAt: '100', phase: 'labeling', status: 'todo'},
        {userId: 'user-id-1', assignedAt: '123', phase: 'labeling', status: 'in_progress'},
        {userId: 'user-id-2', assignedAt: '423', phase: 'labeling', status: 'in_progress'},
        {userId: null, assignedAt: '888', phase: 'review', status: 'todo'},
        {userId: 'user-id-3', assignedAt: '999', phase: 'review', status: 'in_progress'},
      ],
      video: {
        id: 'video-id-1',
      },
    };
    const model = new Task(taskWithVideo, users);
    expect(model.videoId).toEqual('video-id-1');
  });

  it('should process videoId with priority if present', () => {
    const taskWithVideoAndVideoId = {
      id: 'task-id-2',
      assignmentHistory: [
        {userId: null, assignedAt: '100', phase: 'labeling', status: 'todo'},
        {userId: 'user-id-1', assignedAt: '123', phase: 'labeling', status: 'in_progress'},
        {userId: 'user-id-2', assignedAt: '423', phase: 'labeling', status: 'in_progress'},
        {userId: null, assignedAt: '888', phase: 'review', status: 'todo'},
        {userId: 'user-id-3', assignedAt: '999', phase: 'review', status: 'in_progress'},
      ],
      video: {
        id: 'video-id-1',
      },
      videoId: 'prioritized-video-id-1',
    };
    const model = new Task(taskWithVideoAndVideoId, users);
    expect(model.videoId).toEqual('prioritized-video-id-1');
  });

  it('should utilize videoId without video being present', () => {
    const taskWithVideoId = {
      id: 'task-id-2',
      assignmentHistory: [
        {userId: null, assignedAt: '100', phase: 'labeling', status: 'todo'},
        {userId: 'user-id-1', assignedAt: '123', phase: 'labeling', status: 'in_progress'},
        {userId: 'user-id-2', assignedAt: '423', phase: 'labeling', status: 'in_progress'},
        {userId: null, assignedAt: '888', phase: 'review', status: 'todo'},
        {userId: 'user-id-3', assignedAt: '999', phase: 'review', status: 'in_progress'},
      ],
      videoId: 'video-id-1',
    };
    const model = new Task(taskWithVideoId, users);
    expect(model.videoId).toEqual('video-id-1');
  });

  describe('getPhase()', () => {
    it('throws an Error if an invalid task phase is given', () => {
      const taskModel = new Task({status: {labeling: 'foobar'}});

      function throwWrapper() {
        taskModel.getPhase();
      }

      expect(throwWrapper).toThrowError('Failed to determine the tasks phase');
    });

    it('returns all_phases_done by default', () => {
      const taskModel = new Task({});
      const phase = taskModel.getPhase();
      expect(phase).toEqual('all_phases_done');
    });

    it('returns the phase which has todo or in_progress last (in_progress)', () => {
      const status = {
        labeling: 'todo',
        revision: 'in_progress',
      };
      const taskModel = new Task({status: status});
      const phase = taskModel.getPhase();

      expect(phase).toEqual('revision');
    });

    it('returns the phase which has todo or in_progress last (todo)', () => {
      const status = {
        revision: 'in_progress',
        labeling: 'todo',
      };
      const taskModel = new Task({status: status});
      const phase = taskModel.getPhase();

      expect(phase).toEqual('labeling');
    });

    it('returns the phase which is not yet done', () => {
      const status = {
        revision: 'done',
        labeling: 'todo',
        something: 'done',
      };
      const taskModel = new Task({status: status});
      const phase = taskModel.getPhase();

      expect(phase).toEqual('labeling');
    });

    it('returns all_phases_done if all phases are marked as done', () => {
      const status = {
        revision: 'done',
        labeling: 'done',
        something: 'done',
      };
      const taskModel = new Task({status: status});
      const phase = taskModel.getPhase();

      expect(phase).toEqual('all_phases_done');
    });

    it('accepts all phase names', () => {
      const status = {
        revision: 'done',
        foobar: 'todo',
        something: 'done',
      };
      const taskModel = new Task({status: status});
      const phase = taskModel.getPhase();

      expect(phase).toEqual('foobar');
    });
  });

  describe('isUserAllowedtoBeAssigned', () => {
    function createUser(username, id = `user-id-${username}`) {
      return new User({
        id,
        username,
        email: 'foo@bar.com',
        enabled: true,
        lastLogin: '12345678',
        locked: false,
        roles: [],
      });
    }

    using([
      [{revision: 'waiting', labeling: 'todo', 'review': 'waiting', 'processing': 'done'}, 'labeling', 'todo'],
      [{revision: 'waiting', labeling: 'in_progress', 'review': 'waiting', 'processing': 'done'}, 'labeling', 'in_progress'],
      [{revision: 'todo', labeling: 'done', 'review': 'done', 'processing': 'done'}, 'revision', 'todo'],
      [{revision: 'in_progress', labeling: 'done', 'review': 'done', 'processing': 'done'}, 'revision', 'in_progress'],
      [{revision: 'waiting', labeling: 'done', 'review': 'todo', 'processing': 'done'}, 'review', 'todo'],
      [{revision: 'waiting', labeling: 'done', 'review': 'in_progress', 'processing': 'done'}, 'review', 'in_progress'],
      [{revision: 'done', labeling: 'done', 'review': 'done', 'processing': 'done'}, 'all_phases_done', null],
    ], (status, activePhase, activeStatus) => {
      it('should allow assignment of non assigned task', () => {
        const assignmentHistory = [];
        const taskModel = new Task({status, assignmentHistory});

        const user = createUser('Bernd-das-Brot');

        const actualResult = taskModel.isUserAllowedToBeAssigned(user);
        expect(actualResult).toBeTruthy();
      });

      it('should allow assignment of task assigned in non active phases', () => {
        const nonActivePhase = activePhase === 'labeling' ? 'review' : 'labeling';

        const assignedUser = createUser('Jay-der-Jogurt', 'user-id-1');

        const assignmentHistory = [
          {userId: assignedUser.id, assignedAt: '123', phase: nonActivePhase, status: activeStatus},
        ];
        const taskModel = new Task({status, assignmentHistory}, users);

        const user = createUser('Bernd-das-Brot');

        const actualResult = taskModel.isUserAllowedToBeAssigned(user);
        expect(actualResult).toBeTruthy();
      });

      it('should disallow assignment of task, which is assigned in current phase to another user', () => {
        const assignedUser = createUser('Jay-der-Jogurt', 'user-id-1');

        const assignmentHistory = [
          {userId: assignedUser.id, assignedAt: '123', phase: activePhase, status: activeStatus},
        ];
        const taskModel = new Task({status, assignmentHistory}, users);

        const user = createUser('Bernd-das-Brot', 'user-id-5');

        const actualResult = taskModel.isUserAllowedToBeAssigned(user);
        expect(actualResult).toBeFalsy();
      });
    });
  });
});
