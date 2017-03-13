import Module from 'Application/Module';

import ReportGateway from './Gateways/ReportGateway';

import ReportingListController from './Controllers/ReportingListController';
import ReportingListTemplate from './Views/ReportingListView.html!';

import ReportingController from './Controllers/ReportingController';
import ReportingTemplate from './Views/ReportingView.html!';

import ProjectExportController from './Controllers/ProjectExportController';
import projectExportTemplate from './Views/ProjectExportView.html!';

import ProjectExportListDirective from './Directives/ProjectExportListDirective';
import ProjectReportListDirective from './Directives/ProjectReportListDirective';

import ReadableTimespanFilterProvider from '../Reporting/Filters/ReadableTimespanFilterProvider';

/**
 * Reporting Module
 *
 * This module contains all modules regarding reports of some kind
 *
 * @extends Module
 */
class Reporting extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    $stateProvider.state('labeling.reporting', {
      url: 'organisations/:organisationId/reporting',
      parent: 'organisation',
      redirectTo: 'labeling.projects.list',
    });

    $stateProvider.state('labeling.reporting.list', {
      url: '/:projectId',
      views: {
        '@organisation': {
          controller: ReportingListController,
          controllerAs: 'vm',
          template: ReportingListTemplate,
          resolve: {
            project: ['$stateParams', 'projectGateway', ($stateParams, projectGateway) => {
              return projectGateway.getProject($stateParams.projectId);
            }],
            reports: ['$stateParams', 'reportGateway', ($stateParams, reportGateway) => {
              return reportGateway.getReports($stateParams.projectId);
            }],
          },
        },
      },
    });

    $stateProvider.state('labeling.reporting.show', {
      url: '/:projectId/report/:reportId',
      views: {
        '@organisation': {
          controller: ReportingController,
          controllerAs: 'vm',
          template: ReportingTemplate,
          resolve: {
            project: ['$stateParams', 'projectGateway', ($stateParams, projectGateway) => {
              return projectGateway.getProject($stateParams.projectId);
            }],
            report: ['$stateParams', 'reportGateway', ($stateParams, reportGateway) => {
              return reportGateway.getReport($stateParams.projectId, $stateParams.reportId);
            }],
          },
        },
      },
    });

    $stateProvider.state('labeling.reporting.export', {
      url: '/:projectId/export',
      views: {
        '@organisation': {
          controller: ProjectExportController,
          controllerAs: 'vm',
          template: projectExportTemplate,
          resolve: {
            project: ['$stateParams', 'projectGateway', ($stateParams, projectGateway) => {
              return projectGateway.getProject($stateParams.projectId);
            }],
          },
        },
      },
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Reporting', []);

    this.registerDirective('projectExportList', ProjectExportListDirective);
    this.registerDirective('projectReportList', ProjectReportListDirective);

    this.module.service('reportGateway', ReportGateway);

    this.module.filter('readableTimespan', ReadableTimespanFilterProvider);
  }
}

Reporting.prototype.config.$inject = ['$stateProvider'];

export default Reporting;
