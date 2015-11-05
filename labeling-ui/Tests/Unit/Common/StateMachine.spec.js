import StateMachine from 'Application/Common/Support/StateMachine';
import State from 'Application/Common/Support/State';
import Transition from 'Application/Common/Support/Transition';

fdescribe('StateMachine', () => {
  beforeEach(() => {
  });

  it('should not allow to be created with empty states', () => {
    expect(() => new StateMachine([])).toThrow();
  });

  it('should return state object for existing state', () => {
    const machine = new StateMachine(["state"]);
    expect(machine.getState('state') instanceof State).toBeTruthy();
  });

  it('should provide "from" alias for getState', () => {
    const machine = new StateMachine(["state"]);
    const state = machine.getState('state');
    const fromState = machine.from('state');
    expect(fromState).toBe(state);
  });

  it('should fail if not existing state is requested', () => {
    const machine = new StateMachine(["state"]);
    expect(() => machine.getState('otherState')).toThrow();
  });

  describe('State', () => {
    let machine;
    let first;
    let second;
    let third;
    beforeEach(() => {
      machine = new StateMachine(['first', 'second', 'third']);
      first = machine.getState('first');
      second = machine.getState('second');
      third = machine.getState('third');
    });

    it('should allow for Transitions to be added', () => {
      const transition = new Transition('first', 'second');
      first.addTransition('second', transition);
      const retrievedTransitions = first.getTransitions('second');
      expect(retrievedTransitions.has(transition)).toBeTruthy();
      expect(retrievedTransitions.size).toEqual(1);
    });

    it('should provide shortcut to create transitions', () => {
      const transition = first.to('second');
      expect(transition instanceof Transition).toBeTruthy();
      const retrievedTransitions = first.getTransitions('second');
      expect(retrievedTransitions.has(transition)).toBeTruthy();
      expect(retrievedTransitions.size).toEqual(1);
    });

    it('should provide shortcut to store transitions', () => {
      const transition = first.to('second');
      const retrievedTransitions = first.getTransitions('second');
      expect(retrievedTransitions.has(transition)).toBeTruthy();
      expect(retrievedTransitions.size).toEqual(1);
    });

    describe('Transition', () => {
      let firstSecond;
      beforeEach(() => {
        firstSecond = new Transition('first', 'second');
      });

      it('should allow the registration of handlers', () => {
        const handler = function() {};
        firstSecond.register(handler);

        const retrievedHandlers = firstSecond.getHandlers();
        expect(retrievedHandlers.has(handler)).toBeTruthy();
        expect(retrievedHandlers.size).toEqual(1);
      });

      it('should call handlers upon transition', () => {
        const handler = jasmine.createSpy();
        firstSecond.register(handler);
        firstSecond.transition();
        expect(handler).toHaveBeenCalledWith("first", "second");
      });

      it('should call handlers upon transition with given arguments', () => {
        const handler = jasmine.createSpy();
        firstSecond.register(handler);
        firstSecond.transition("foo", "bar");
        expect(handler).toHaveBeenCalledWith("first", "second", "foo", "bar");
      });
    });

    it('should trigger proper Transition while transitioning', () => {
      const handler = jasmine.createSpy();
      first.to('second').register(handler);
      first.transition('second');
      expect(handler).toHaveBeenCalledWith('first', 'second');
    });

    it('should pass arguments while transitioning', () => {
      const handler = jasmine.createSpy();
      first.to('second').register(handler);
      first.transition('second', 'foo', 'bar');
      expect(handler).toHaveBeenCalledWith('first', 'second', 'foo', 'bar');
    });
  });

  it('should trigger proper State while transitioning', () => {
    const machine = new StateMachine(['first', 'second', 'third']);
    const handler = jasmine.createSpy();
    machine.transition('first');
    machine.from('first').to('second').register(handler);
    machine.transition('second');
    expect(handler).toHaveBeenCalledWith('first', 'second');
  });

  it('should pass arguments while transitioning', () => {
    const machine = new StateMachine(['first', 'second', 'third']);
    const handler = jasmine.createSpy();
    machine.transition('first');
    machine.from('first').to('second').register(handler);
    machine.transition('second', 'foo', 'bar');
    expect(handler).toHaveBeenCalledWith('first', 'second', 'foo', 'bar');
  });
});
