import Module from '../Module';

import OrganisationRouteController from './Controllers/OrganisationRouteController';

import OrganisationSelectController from './Controllers/OrganisationSelectController';
import OrganisationSelectTemplate from './Views/OrganisationSelectView.html!';
import OrganisationListController from './Controllers/OrganisationListController';
import OrganisationListTemplate from './Views/OrganisationListView.html!';

import OrganisationService from './Services/OrganisationService';
import OrganisationGateway from './Gateways/OrganisationGateway';

import OrganisationPickerDirective from './Directives/OrganisationPickerDirective';

class OrganisationModule extends Module {
  /**
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Organisation', []);
    this.module.service('organisationService', OrganisationService);
    this.module.service('organisationGateway', OrganisationGateway);

    this.registerDirective('organisationPicker', OrganisationPickerDirective);
  }

  /**
   * @param {$stateProvider} $stateProvider
   */
  config($stateProvider) {
    $stateProvider.state('organisation', {
      url: 'organisation/:organisationId/',
      parent: 'labeling',
      views: {
        '@labeling': {
          controller: OrganisationRouteController,
          controllerAs: 'vm',
          template: '<ui-view class="grid-frame vertical"></ui-view>',
        },
      },
    });

    $stateProvider.state('labeling.organisation-management', {
      url: 'organisations/',
      redirectTo: 'labeling.organisation-management.selection',
    });

    $stateProvider.state('labeling.organisation-management.selection', {
      url: 'selection',
      views: {
        '@labeling': {
          controller: OrganisationSelectController,
          controllerAs: 'vm',
          template: OrganisationSelectTemplate,
        },
      },
    });

    $stateProvider.state('labeling.organisation-management.list', {
      url: 'management',
      views: {
        '@labeling': {
          controller: OrganisationListController,
          controllerAs: 'vm',
          template: OrganisationListTemplate,
        },
      },
    });
  }
}

OrganisationModule.prototype.config.$inject = [
  '$stateProvider',
];

export default OrganisationModule;
