import Module from '../Module';

import OrganisationRouteController from './Controllers/OrganisationRouteController';

import OrganisationSelectController from './Controllers/OrganisationSelectController';
import OrganisationSelectTemplate from './Views/OrganisationSelectView.html!';

import Organisation from './Models/Organisation';
import OrganisationService from './Services/OrganisationService';

import OrganisationPickerDirective from './Directives/OrganisationPickerDirective';

class OrganisationModule extends Module {
  /**
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Organisation', []);
    this.module.service('organisationService', OrganisationService);

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

    $stateProvider.state('labeling.organisation-list', {
      url: 'organisations/',
      views: {
        '@labeling': {
          controller: OrganisationSelectController,
          controllerAs: 'vm',
          template: OrganisationSelectTemplate,
        },
      },
    });
  }
}

OrganisationModule.prototype.config.$inject = [
  '$stateProvider',
];

export default OrganisationModule;
