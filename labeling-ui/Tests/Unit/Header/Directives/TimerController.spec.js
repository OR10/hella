import TimerController from 'Application/Header/Directives/TimerController';
import {inject} from 'angular-mocks';
import angular from 'angular';

fdescribe('TimerController', () => {
  /**
   * @type {$q}
   */
  let angularQ;

  /**
   * @type {angular.$document}
   */
  let document;

  /**
   * @type {angular.element}
   */
  let element;

  /**
   * @type {angular.$interval}
   */
  let interval;

  /**
   * @type {TimerGateway}
   */
  let timerGateway;

  /**
   * @type {TimerController}
   */
  let controller;

  /**
   * @type {angular.$rootScope}
   */
  let rootScope;

  beforeEach(inject(($q, $rootScope) => {
    angularQ = $q;
    rootScope = $rootScope;
  }));

  beforeEach(() => {
    document = jasmine.createSpyObj('$document', ['on', 'off']);
    element = angular.element('<div></div>');
    timerGateway = jasmine.createSpyObj('timerGateway', ['getTime', 'updateTime']);
    interval = jasmine.createSpy('$interval');
    interval.cancel = jasmine.createSpy('$interval.cancel');

    timerGateway.getTime.and.returnValue(angularQ.resolve({time: 0}));
  });

  beforeEach(() => {
    controller = new TimerController(document, element, interval, timerGateway);
  });

  it('can be created', () => {
    expect(controller).toEqual(jasmine.any(TimerController));
    expect(controller.listenToEvents).toBe(true);
  });

  it('starts the save interval', () => {
    rootScope.$apply();

    expect(interval).toHaveBeenCalledWith(jasmine.any(Function), controller.saveFrequency * 1000);
    expect(controller._intervalHandle).not.toBeNull();
  });

  it('starts the idle interval', () => {
    rootScope.$apply();

    expect(interval).toHaveBeenCalledWith(jasmine.any(Function), controller.idleTimeout * 1000);
    expect(controller._idleTimeoutHandle).not.toBeNull();
  });

  describe('$destroy', () => {
    it('deregisters all document handlers on destroy', () => {
      element.remove();

      expect(document.off).toHaveBeenCalledTimes(2);
      expect(document.off).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
      expect(document.off).toHaveBeenCalledWith('keypress', jasmine.any(Function));
    });

    it('sets listenToEvents to false', () => {
      element.remove();

      expect(controller.listenToEvents).toBe(false);
    });

    it('does not stop any interval, if not started', () => {
      element.remove();

      expect(interval.cancel).not.toHaveBeenCalled();
    });

    it('stops the save interval', () => {
      const saveHandle = 'I am the save handle';
      interval.and.returnValue(saveHandle);

      controller.init({});
      element.remove();

      expect(interval.cancel).toHaveBeenCalledWith(saveHandle);
    });

    it('stops the idle interval', () => {
      const idleHandle = 'I am the idle handle';
      interval.and.returnValue(idleHandle);

      controller.startIdleTimer();
      element.remove();

      expect(interval.cancel).toHaveBeenCalledWith(idleHandle);
    });
  });

  describe('triggerAction()', () => {
    it('does nothing if listenToEvents is false', () => {
      controller.isIdle = true;

      controller.listenToEvents = false;
      controller.triggerAction();

      expect(controller.isIdle).toEqual(true);
      expect(interval.cancel).not.toHaveBeenCalled();
      expect(interval).not.toHaveBeenCalled();
    });

    it('sets idle to true', () => {
      controller.isIdle = true;

      controller.triggerAction();

      expect(controller.isIdle).toEqual(false);
    });

    it('stops the current idle timer and starts a new one', () => {
      const idleTimeoutHandle = 'I am the idle timeout handle';
      interval.and.returnValue(idleTimeoutHandle);
      controller.startIdleTimer();

      controller.triggerAction();

      expect(interval).toHaveBeenCalledTimes(2);
      expect(interval).toHaveBeenCalledWith(jasmine.any(Function), controller.idleTimeout * 1000);
      expect(interval.cancel).toHaveBeenCalledTimes(1);
      expect(interval.cancel).toHaveBeenCalledWith(idleTimeoutHandle);
    });
  });

  describe('calculateTime()', () => {
    it('calculcates the elapsed hours and minutes and rounding down', () => {
      controller.elapsedTime = 5678945;

      controller.calculateTime();

      expect(controller.elapsedHours).toEqual(1577);
      expect(controller.elapsedMinutes).toEqual(29);
    });
  });

  describe('setIdle', () => {
    it('sets isIdle to true', () => {
      controller.isIdle = false;

      controller.setIdle();

      expect(controller.isIdle).toBe(true);
    });
  });

  describe('saveTime()', () => {
    it('does nothing if idle', () => {
      controller.setIdle();

      controller.saveTime();

      expect(controller.elapsedTime).toEqual(0);
      expect(timerGateway.updateTime).not.toHaveBeenCalled();
    });

    it('updates all the elapsed times', () => {
      timerGateway.updateTime.and.returnValue(angularQ.resolve());
      controller.elapsedTime = 5678935;

      controller.saveTime();

      expect(controller.elapsedTime).toEqual(5678945);
      expect(controller.elapsedHours).toEqual(1577);
      expect(controller.elapsedMinutes).toEqual(29);
    });

    it('stores the elapsed seconds', () => {
      const user = {id: 'user-id'};
      const task = {id: 'task-id'};
      controller.user = user;
      controller.task = task;
      timerGateway.updateTime.and.returnValue(angularQ.resolve());

      controller.saveTime();

      expect(timerGateway.updateTime).toHaveBeenCalledWith(task, user, 10);
    });

    it('starts listening to events after saving', () => {
      controller.listenToEvents = false;
      timerGateway.updateTime.and.returnValue(angularQ.resolve());

      controller.saveTime();
      rootScope.$apply();

      expect(controller.listenToEvents).toBe(true);
    });

    it('sets the user idle and deinits when the save promise is rejected', () => {
      const intervalHandle = 'le interval handle';
      const idleTimeoutHandle = 'le idle handle';
      controller.isIdle = false;
      controller.listenToEvents = true;
      interval.and.returnValues(intervalHandle, idleTimeoutHandle);
      timerGateway.updateTime.and.returnValue(angularQ.reject('o noes!'));

      controller.saveTime();
      rootScope.$apply();

      expect(controller.isIdle).toEqual(true);
      expect(interval.cancel).toHaveBeenCalledWith(intervalHandle);
      expect(interval.cancel).toHaveBeenCalledWith(idleTimeoutHandle);
      expect(controller.listenToEvents).toEqual(false);
    });
  });
});
