import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import Common from 'Application/Common/Common';
import ConfigurableAssemblyFactory from 'Application/Common/Services/PackagingExecutor/ConfigurableAssemblyFactory';
import SimpleAssemblyStrategy from 'Application/Common/Services/PackagingExecutor/SimpleAssemblyStrategy';

describe('PackagingExecutor', () => {
  function createExposedPromise() {
    let resolve = null;
    let reject = null;
    let promise = new Promise((innerResolve, innerReject) => {
      resolve = innerResolve;
      reject = innerReject;
    });

    return {resolve, reject, promise};
  }

  describe('Basic Linear Execution', () => {
    let $rootScope;
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;
    let mockedAssemblyStrategy;

    beforeEach(() => {
      const commonModule = new Common();
      commonModule.registerWithAngular(angular);
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
        packagingExecutor = $injector.get('packagingExecutor');
        $rootScope = $injector.get('$rootScope');
      });
    });

    it('should execute first entry in queue directly', () => {
      const {resolve, reject, promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      packagingExecutor.execute('test-assembly', spyWorker);

      expect(spyWorker).toHaveBeenCalled();
    });

    it('should provide promise, which is fulfilled once job is executed', done => {
      const {resolve, reject, promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      const jobPromise = packagingExecutor.execute('test-assembly', spyWorker);
      resolve();

      // Test will timeout if promise was not resolved and therefore fail.
      // Unfortunately there is no other way to test this, due to the encapsulated promise cycle.
      // Maybe mocking `Promise` would be a way?
      jobPromise.then(() => done());
    });

    it('should call strategy after job has been added', () => {
      const {resolve, reject, promise} = createExposedPromise();
      const spyWorker = jasmine.createSpy().and.returnValue(promise);

      packagingExecutor.execute('test-assembly', spyWorker);

      expect(mockedAssemblyStrategy.getPackageBoundary).toHaveBeenCalled();
    });

    it('should call strategy for each cycle (add/remove/state)', done => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      // Add 1, Running 1
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(2);

      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);
      // Add 1, Running 1, Add 2
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(3);

      const jobPromiseThree = packagingExecutor.execute('test-assembly', spyWorkerThree);
      // Add 1, Running 1, Add 2, Add 3
      expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(4);

      resolveOne();

      jobPromiseOne.then(() => {
        // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2
        expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(6);
        resolveTwo();
      });

      jobPromiseTwo.then(() => {
        // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2, Remove 2, State 3
        expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(8);
        resolveThree();
      });

      jobPromiseThree.then(() => {
        // Add 1, Running 1, Add 2, Add 3, Remove 1, State 2, Remove 2, State 3, Remove 3
        expect(mockedAssemblyStrategy.getPackageBoundary.calls.count()).toBe(9);
        done();
      });
    });

    it('Multiple assemblies execute in parallel', () => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly-one', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly-two', spyWorkerTwo);
      const jobPromiseThree = packagingExecutor.execute('test-assembly-three', spyWorkerThree);

      expect(spyWorkerOne).toHaveBeenCalled();
      expect(spyWorkerTwo).toHaveBeenCalled();
      expect(spyWorkerThree).toHaveBeenCalled();
    });
  });

  describe('Packaged Execution', () => {
    let $rootScope;
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;
    let mockedAssemblyStrategy;

    beforeEach(() => {
      const commonModule = new Common();
      commonModule.registerWithAngular(angular);
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
        packagingExecutor = $injector.get('packagingExecutor');
        $rootScope = $injector.get('$rootScope');
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
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);
      const jobPromiseThree = packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerThree).not.toHaveBeenCalled();
    });

    it('should execute third job once first is finished', done => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);
      const jobPromiseThree = packagingExecutor.execute('test-assembly', spyWorkerThree);

      resolveOne();
      jobPromiseOne.then(() => {
        expect(spyWorkerThree).toHaveBeenCalled();
        done();
      });
    });

    it('should execute third job once second is finished', done => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);
      const jobPromiseThree = packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerThree).not.toHaveBeenCalled();
      resolveTwo();
      jobPromiseTwo.then(() => {
        expect(spyWorkerThree).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('SimpleAssemblyStrategy', () => {
    let $rootScope;
    /**
     * @type {PackagingExecutor}
     */
    let packagingExecutor;

    beforeEach(() => {
      const commonModule = new Common();
      commonModule.registerWithAngular(angular);
      module('AnnoStation.Common');

      module($provide => {
        $provide.service('assemblyStrategy', SimpleAssemblyStrategy);
        $provide.service('assemblyFactory', ConfigurableAssemblyFactory);
      });

      inject($injector => {
        packagingExecutor = $injector.get('packagingExecutor');
        $rootScope = $injector.get('$rootScope');
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

    it('should execute second job once first is finished', done => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);

      resolveOne();

      jobPromiseOne.then(() => {
        expect(spyWorkerTwo).toHaveBeenCalled();
        done();
      });
    });

    it('should execute second job even if first fails', done => {
      const {promise: promiseOne, reject: rejectOne} = createExposedPromise();
      const {promise: promiseTwo} = createExposedPromise();
      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);

      rejectOne();

      jobPromiseOne.catch(() => {
        expect(spyWorkerTwo).toHaveBeenCalled();
        done();
      });
    });

    it('should execute three jobs in serial', done => {
      const {promise: promiseOne, resolve: resolveOne} = createExposedPromise();
      const {promise: promiseTwo, resolve: resolveTwo} = createExposedPromise();
      const {promise: promiseThree, resolve: resolveThree} = createExposedPromise();

      const spyWorkerOne = jasmine.createSpy('workerOne').and.returnValue(promiseOne);
      const spyWorkerTwo = jasmine.createSpy('workerTwo').and.returnValue(promiseTwo);
      const spyWorkerThree = jasmine.createSpy('workerThree').and.returnValue(promiseThree);

      const jobPromiseOne = packagingExecutor.execute('test-assembly', spyWorkerOne);
      const jobPromiseTwo = packagingExecutor.execute('test-assembly', spyWorkerTwo);
      const jobPromiseThree = packagingExecutor.execute('test-assembly', spyWorkerThree);

      expect(spyWorkerOne).toHaveBeenCalled();
      resolveOne();

      jobPromiseOne.then(() => {
        expect(spyWorkerTwo).toHaveBeenCalled();
        resolveTwo();
      });

      jobPromiseTwo.then(() => {
        expect(spyWorkerThree).toHaveBeenCalled();
        resolveThree();
      });

      jobPromiseThree.then(() => {
        done();
      });
    });
  });
  /*
   it('should parallelize non destructive http requests', () => {
   bufferedHttp.get('http://foo.bar/baz');
   bufferedHttp.get('http://foo.bar/baz');
   bufferedHttp.get('http://foo.bar/baz');

   expect($http.calls.count()).toBe(3);
   });

   it('should parallelize non destructive http requests on non default queue', () => {
   bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
   bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
   bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
   $rootScope.$digest();

   expect($http.calls.count()).toBe(3);
   });

   it('should serialize destructive http requests', () => {
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
   expect($http.calls.count()).toBe(1);
   $httpDefers[0].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(2);
   $httpDefers[1].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(3);
   $httpDefers[2].resolve();
   $rootScope.$digest();
   });

   it('should serialize destructive http requests on non default queue', () => {
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
   expect($http.calls.count()).toBe(1);
   $httpDefers[0].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(2);
   $httpDefers[1].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(3);
   $httpDefers[2].resolve();
   $rootScope.$digest();
   });

   it('should wait with non destructive operations until destructives are finished', () => {
   bufferedHttp.get('http://foo.bar/baz');
   bufferedHttp.get('http://foo.bar/baz');
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
   bufferedHttp.get('http://foo.bar/baz');
   bufferedHttp.get('http://foo.bar/baz');
   expect($http.calls.count()).toBe(2);
   $httpDefers[0].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(2);
   $httpDefers[1].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(3);
   $httpDefers[2].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(4);
   $httpDefers[3].resolve();
   $rootScope.$digest();
   expect($http.calls.count()).toBe(6);
   $httpDefers[4].resolve();
   $httpDefers[5].resolve();
   $rootScope.$digest();
   });

   it('should parallelize destructive operations on multiple queues', () => {
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
   bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blib');
   expect($http.calls.count()).toBe(2);
   $httpDefers[0].resolve();
   $httpDefers[1].resolve();
   $rootScope.$digest();
   });

   // @TODO: More tests needed here
   // - usage of entityManager
   // - deferred timeout injection
   */
});
