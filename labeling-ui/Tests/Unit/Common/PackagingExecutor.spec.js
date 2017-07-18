import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';

import Common from 'Application/Common/Common';
import ConfigurableAssemblyFactory from 'Application/Common/Services/PackagingExecutor/ConfigurableAssemblyFactory';
import SimpleAssemblyStrategy from 'Application/Common/Services/PackagingExecutor/SimpleAssemblyStrategy';

describe('PackagingExecutor', () => {
  let $q = null;
  let $rootScope = null;

  function createExposedPromise() {
    const deferred = $q.defer();

    return {
      resolve: deferred.resolve,
      reject: deferred.reject,
      promise: deferred.promise,
    };
  }

  describe('Basic Linear Execution', () => {
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;
    let mockedAssemblyStrategy;

    beforeEach(() => {
      const featureFlags = {};

      const commonModule = new Common();
      commonModule.registerWithAngular(angular, featureFlags);
      module('AnnoStation.Common');

      mockedAssemblyStrategy = {
        // New boundary is always after the first element in the assembly
        // This should provide sequential processing.
        getPackageBoundary: jasmine.createSpy().and.returnValue(1),
      };

      module($provide => {
        $provide.value('assemblyStrategy', mockedAssemblyStrategy);
        $provide.service('assemblyFactory', ConfigurableAssemblyFactory);
      });

      inject($injector => {
        $q = $injector.get('$q');
        $rootScope = $injector.get('$rootScope');
        packagingExecutor = $injector.get('packagingExecutor');
      });
    });

    it('should execute first entry in queue directly', () => {
      const {promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      packagingExecutor.execute('test-assembly', spyWorker);

      expect(spyWorker).toHaveBeenCalled();
    });

    it('should provide promise, which is fulfilled once job is executed', done => { // eslint-disable-line jasmine/missing-expect
      const {resolve, promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      const jobPromise = packagingExecutor.execute('test-assembly', spyWorker);
      resolve();

      // Test will timeout if promise was not resolved and therefore fail.
      jobPromise.then(() => done());

      $rootScope.$apply();
    });

    it('should call strategy after job has been added', () => {
      const {promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      packagingExecutor.execute('test-assembly', spyWorker);

      expect(mockedAssemblyStrategy.getPackageBoundary).toHaveBeenCalled();
    });

    it('should call strategy for each cycle (add/remove/state)', () => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      // Add 1, Running 1
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(2);

      packagingExecutor.execute('test-assembly', spyWorkerTwo);
      // Add 1, Running 1, Add 2
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(3);

      packagingExecutor.execute('test-assembly', spyWorkerThree);
      // Add 1, Running 1, Add 2, Add 3
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(4);

      resolveOne();
      $rootScope.$apply();

      // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(6);
      resolveTwo();
      $rootScope.$apply();

      // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2, Remove 2, State 3
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(8);
      resolveThree();
      $rootScope.$apply();

      // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2, Remove 2, State 3, Remove 3
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(9);
    });

    it('Multiple assemblies execute in parallel', () => {
      const {promise: promiseOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const {promise: promiseThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly-one', spyWorkerOne);
      packagingExecutor.execute('test-assembly-two', spyWorkerTwo);
      packagingExecutor.execute('test-assembly-three', spyWorkerThree);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).toHaveBeenCalled();
      expect(spyWorkerThree).toHaveBeenCalled();
    });

    it('Result values are returned by the provided promise in case of success', done => {
      const {promise, resolve} = createExposedPromise();

      const spyWorker = jasmine.createSpy('worker').and.returnValue(promise);
      const testData = ['some', 'test', 'results', 42, {foo: 'bar'}];

      const jobPromise = packagingExecutor.execute('test-assembly', spyWorker);
      resolve(testData);

      jobPromise.then(result => {
        expect(result).toEqual(testData);
        done();
      });

      $rootScope.$apply();
    });

    it('Result values are returned by the provided promise in case of failure', done => {
      const {promise, reject} = createExposedPromise();

      const spyWorker = jasmine.createSpy('worker').and.returnValue(promise);
      const testData = ['', 'test', 'results', 42, {foo: 'bar'}];

      const jobPromise = packagingExecutor.execute('test-assembly', spyWorker);
      reject(testData);

      jobPromise.catch(reason => {
        expect(reason).toEqual(testData);
        done();
      });

      $rootScope.$apply();
    });
  });

  describe('Packaged Execution', () => {
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;
    let mockedAssemblyStrategy;

    beforeEach(() => {
      const featureFlags = {};

      const commonModule = new Common();
      commonModule.registerWithAngular(angular, featureFlags);
      module('AnnoStation.Common');

      mockedAssemblyStrategy = {
        // New boundary is two elements in the future.
        // This should provide processing in chunks of 2.
        getPackageBoundary: jasmine.createSpy().and.returnValue(2),
      };

      module($provide => {
        $provide.value('assemblyStrategy', mockedAssemblyStrategy);
        $provide.service('assemblyFactory', ConfigurableAssemblyFactory);
      });

      inject($injector => {
        $q = $injector.get('$q');
        $rootScope = $injector.get('$rootScope');
        packagingExecutor = $injector.get('packagingExecutor');
      });
    });

    it('should execute two jobs in parallel', () => {
      const {promise: promiseOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).toHaveBeenCalled();
    });

    it('should not execute third job before one is finished', () => {
      const {promise: promiseOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const {promise: promiseThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);
      packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerThree).not.toHaveBeenCalled();
    });

    it('should execute third job once first is finished', () => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const {promise: promiseThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);
      packagingExecutor.execute('test-assembly', spyWorkerThree);

      resolveOne();
      $rootScope.$apply();

      expect(spyWorkerThree).toHaveBeenCalled();
    });

    it('should execute third job once second is finished', () => {
      const {promise: promiseOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);
      packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerThree).not.toHaveBeenCalled();

      resolveTwo();
      $rootScope.$apply();

      expect(spyWorkerThree).toHaveBeenCalled();
    });
  });

  describe('SimpleAssemblyStrategy', () => {
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;

    beforeEach(() => {
      const featureFlags = {};

      const commonModule = new Common();
      commonModule.registerWithAngular(angular, featureFlags);
      module('AnnoStation.Common');

      module($provide => {
        $provide.service('assemblyStrategy', SimpleAssemblyStrategy);
        $provide.service('assemblyFactory', ConfigurableAssemblyFactory);
      });

      inject($injector => {
        $q = $injector.get('$q');
        $rootScope = $injector.get('$rootScope');
        packagingExecutor = $injector.get('packagingExecutor');
      });
    });

    it('should not execute second job before first is finished', () => {
      const {promise: promiseOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).not.toHaveBeenCalled();
    });

    it('should execute second job once first is finished', () => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);

      expect(spyWorkerTwo).not.toHaveBeenCalled();

      resolveOne();
      $rootScope.$apply();

      expect(spyWorkerTwo).toHaveBeenCalled();
    });

    it('should execute second job even if first fails', () => {
      const {promise: promiseOne, reject: rejectOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).not.toHaveBeenCalled();

      rejectOne();
      $rootScope.$apply();

      expect(spyWorkerTwo).toHaveBeenCalled();
    });

    it('should execute three jobs in serial', () => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      packagingExecutor.execute('test-assembly', spyWorkerOne);
      packagingExecutor.execute('test-assembly', spyWorkerTwo);
      packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).not.toHaveBeenCalled();
      expect(spyWorkerThree).not.toHaveBeenCalled();
      resolveOne();
      $rootScope.$apply();

      expect(spyWorkerTwo).toHaveBeenCalled();
      expect(spyWorkerThree).not.toHaveBeenCalled();
      resolveTwo();
      $rootScope.$apply();

      expect(spyWorkerThree).toHaveBeenCalled();
      resolveThree();
      $rootScope.$apply();
    });
  });
});
