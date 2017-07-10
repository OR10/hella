const {Replicator} = require('../Application/Jobs/Replicator');

describe('Replicator Job', () => {
  let nanoAdminMock;
  let replicatorDbMock;

  function createReplicator(sourceUrl = '', targetUrl = '') {
    return new Replicator(nanoAdminMock, sourceUrl, targetUrl);
  }

  beforeEach(() => {
    nanoAdminMock = jasmine.createSpyObj('nanoAdmin', ['use']);
    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);

    nanoAdminMock.use.and.returnValue(replicatorDbMock);
  });

  it('should instantiate', () => {
    const replicator = createReplicator();
    expect(replicator).toEqual(jasmine.any(Replicator));
  });

  it('should run return a promise', () => {
    const replicator = createReplicator();
    expect(replicator.run()).toEqual(jasmine.any(Promise));
  });
});