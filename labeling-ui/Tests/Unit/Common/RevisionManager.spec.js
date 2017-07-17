import 'jquery';
import angular from 'angular';
import {inject, module} from 'angular-mocks';

import Common from 'Application/Common/Common';
import RevisionManager from 'Application/Common/Services/RevisionManager';

describe('RevisionManager', () => {
  /**
   * @type {RevisionManager}
   */
  let revisionManager;

  beforeEach(() => {
    const featureFlags = {};

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    inject($injector => {
      revisionManager = $injector.instantiate(RevisionManager);
    });
  });

  it('should store/provide id/revision pair', () => {
    const idOne = 'some-id-one';
    const revisionOne = 'some-revision-one';
    const idTwo = 'some-id-two';
    const revisionTwo = 'some-revision-two';

    revisionManager.updateRevision(idOne, revisionOne);
    revisionManager.updateRevision(idTwo, revisionTwo);

    expect(revisionManager.getRevision(idTwo)).toBe(revisionTwo);
    expect(revisionManager.getRevision(idOne)).toBe(revisionOne);
  });

  it('should throw if non-existent revision is requested', () => {
    expect(
      () => revisionManager.getRevision('non-existent-id')
    ).toThrow();
  });

  it('should tell if revision is available or not', () => {
    const idOne = 'some-id-one';
    const revisionOne = 'some-revision-one';
    const idTwo = 'some-id-two';

    revisionManager.updateRevision(idOne, revisionOne);

    expect(revisionManager.hasRevision(idOne)).toBeTruthy();
    expect(revisionManager.hasRevision(idTwo)).toBeFalsy();
  });

  using([
    [{id: 'some-id', rev: 'some-revision', answer: 42}, 'some-id', 'some-revision'],
    [{_id: 'some-id', rev: 'some-revision', answer: 42}, 'some-id', 'some-revision'],
    [{id: 'some-id', _rev: 'some-revision', answer: 42}, 'some-id', 'some-revision'],
    [{_id: 'some-id', _rev: 'some-revision', answer: 42}, 'some-id', 'some-revision'],
  ], (model, id, revision) => {
    it('should extract revision from model object', () => {
      revisionManager.extractRevision(model);
      const retrievedRevision = revisionManager.getRevision(id);
      expect(retrievedRevision).toBe(revision);
    });
  });

  using([
    [{id: 'some-id', answer: 42}, 'some-id', 'some-revision', 'rev'],
    [{_id: 'some-id', answer: 42}, 'some-id', 'some-revision', '_rev'],
  ], (model, id, revision, propertyName) => {
    it('should inject revision into model object', () => {
      revisionManager.updateRevision(id, revision);
      revisionManager.injectRevision(model);
      expect(model[propertyName]).toBe(revision);
    });
  });

  using([
    [{id: 'some-id', answer: 42}],
    [{_id: 'some-id', answer: 42}],
  ], model => {
    it('should throw if no revision to extract is available', () => {
      expect(
        () => revisionManager.extractRevision(model)
      ).toThrow();
    });
  });

  using([
    [{id: 'some-id', answer: 42}],
    [{_id: 'some-id', answer: 42}],
  ], model => {
    it('should throw if no revision to inject is available', () => {
      expect(
        () => revisionManager.injectRevision(model)
      ).toThrow();
    });
  });
});
