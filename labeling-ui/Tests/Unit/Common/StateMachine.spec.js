import StateMachine from 'Application/Common/Support/StateMachine';
import State from 'Application/Common/Support/State';
import Transition from 'Application/Common/Support/Transition';

describe('StateMachine', () => {
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
      const transition = new Transition(first, 'foobar', second);
      first.addTransition(transition);
      const retrievedTransition = first.getTransition('foobar');
      expect(retrievedTransition).toBe(transition);
    });

    it('should provide shortcut to create and store transitions', () => {
      const transition = first.on('foobar').to('second');
      expect(first.getTransition('foobar') instanceof Transition).toBeTruthy();
      expect(first.getTransition('foobar')).toBe(transition);
    });

    describe('Transition', () => {
      let firstSecond;
      const transitionEvent = {from: 'first', on: 'foobar', to: 'second'};

      beforeEach(() => {
        firstSecond = new Transition(first, 'foobar', second);
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
        expect(handler).toHaveBeenCalled();
      });

      it('should call handlers with transitionEvent upon transition', () => {
        const handler = jasmine.createSpy();
        firstSecond.register(handler);
        firstSecond.transition();
        expect(handler).toHaveBeenCalledWith(transitionEvent);
      });

      it('should call handlers upon transition with given arguments', () => {
        const handler = jasmine.createSpy();
        firstSecond.register(handler);
        firstSecond.transition("foo", "bar");
        expect(handler).toHaveBeenCalledWith(transitionEvent, "foo", "bar");
      });
    });
  });

  it('should trigger proper State while transitioning', () => {
    const machine = new StateMachine(['first', 'second', 'third']);
    const handler = jasmine.createSpy();
    machine.from('first').on('foo').to('second').register(handler);
    machine.transition('foo');
    expect(handler).toHaveBeenCalledWith({from: 'first', to: 'second', on: 'foo'});
  });

  it('should pass arguments while transitioning', () => {
    const machine = new StateMachine(['first', 'second', 'third']);
    const handler = jasmine.createSpy();
    machine.from('first').on('foo').to('second').register(handler);
    machine.transition('foo', 'bar', 'baz');
    expect(handler).toHaveBeenCalledWith({from: 'first', to: 'second', on: 'foo'}, 'bar', 'baz');
  });

  it('should pass arguments while transitioning', () => {
    const machine = new StateMachine(['first', 'second', 'third']);
    const handler = jasmine.createSpy();
    machine.from('first').on('foo').to('second').register(handler);
    machine.transition('foo', {blub: 'blib'});
    expect(handler).toHaveBeenCalledWith({from: 'first', to: 'second', on: 'foo'}, {blub: 'blib'});
  });
});
