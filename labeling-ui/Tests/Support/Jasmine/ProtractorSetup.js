let protractorPromise;
import features from '../../../Application/features.json';
import PouchDb from '../PouchDb/PouchDbWrapper';

beforeEach(() => {
  protractorPromise = protractor.promise.defer();
});

afterEach(done => {
  protractorPromise.promise.then(result => {
    expect(result).toBe('ok');
    PouchDb.destroy().then(() => done());
  });

  protractorPromise.fulfill('ok');
});