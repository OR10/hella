let protractorPromise;
import features from '../../../Application/features.json';
import PouchDb from '../PouchDb/PouchDbWrapper';

beforeEach(() => {
  protractorPromise = protractor.promise.defer();
});

afterEach(done => {
  protractorPromise.fulfill('ok');
  expect(protractorPromise).toBe('ok');

  if (features.pouchdb) {
    PouchDb.destroy().then(() => done());
  } else {
    done();
  }
});