import Module from '../Module';

import OrganisationRouteController from './Controllers/OrganisationRouteController';

import OrganisationSelectController from './Controllers/OrganisationSelectController';
import OrganisationSelectTemplate from './Views/OrganisationSelectView.html!';
import OrganisationsController from './Controllers/OrganisationsController';
import OrganisationsTemplate from './Views/OrganisationsView.html!';

import OrganisationService from './Services/OrganisationService';
import OrganisationGateway from './Gateways/OrganisationGateway';
import OrganisationRoutingService from './Services/OrganisationRoutingService';

import OrganisationPickerDirective from './Directives/OrganisationPickerDirective';
import OrganisationListDirective from './Directives/OrganisationListDirective';
import OrganisationEditDirective from './Directives/OrganisationEditDirective';

class OrganisationModule extends Module {
  /**
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Organisation', []);
    this.module.service('organisationService', OrganisationService);
    this.module.service('organisationGateway', OrganisationGateway);
    this.module.service('organisationRoutingService', OrganisationRoutingService);

    this.registerDirective('organisationPicker', OrganisationPickerDirective);
    this.registerDirective('organisationList', OrganisationListDirective);
    this.registerDirective('organisationEdit', OrganisationEditDirective);
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
          controller: OrganisationsController,
          controllerAs: 'vm',
          template: OrganisationsTemplate,
        },
      },
    });

    $stateProvider.state('labeling.organisation-management.detail', {
      url: 'management/{organisationId:[0-9a-f]{1,32}|new}',
      views: {
        '@labeling': {
          controller: OrganisationsController,
          controllerAs: 'vm',
          template: OrganisationsTemplate,
        },
      },
    });
  }
}

OrganisationModule.prototype.config.$inject = [
  '$stateProvider',
];

export default OrganisationModule;
