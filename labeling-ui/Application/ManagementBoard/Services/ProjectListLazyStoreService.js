import AbstractLazyStoreService from '../../Common/Support/AbstractLazyStoreService';

/**
 * Project list lazy store implementation
 */
class ProjectListLazyStoreService extends AbstractLazyStoreService {
  constructor(projectGateway) {
    super();
    this._projectGateway = projectGateway;
  }

  getProjects(status, limit, offset, force = false) {
    return this._lazyFetch(
      `projects-${status}-${limit}-${offset}`,
      () => this._projectGateway.getProjects(limit, offset),
      30 * 1000,
      force
    ).then(data => {
      // Store the maxCount independently
      this._storeFetchedData(
        `totalRows-${status}`,
        data.totalRows
      );

      return data;
    });
  }

  getProjectCount(status, force = false) {
    return this._lazyFetch(
      `totalRows-${status}`,
      () => this._projectGateway.getProjects(0, 0).then(data => data.totalRows),
      30 * 1000,
      force
    );
  }
}

ProjectListLazyStoreService.$inject = [
  'projectGateway',
];

export default ProjectListLazyStoreService;
