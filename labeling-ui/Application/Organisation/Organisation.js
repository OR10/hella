import Module from '../Module';

import OrganisationSelectController from './Controllers/OrganisationSelectController';
import OrganisationSelectTemplate from './Views/OrganisationSelectView.html!';

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
    $stateProvider.state('labeling.organisation', {
      url: 'organisations',
      redirectTo: 'labeling.organisation.select',
    });

    $stateProvider.state('labeling.organisation.select', {
      url: '/',
      views: {
        '@labeling': {
          controller: OrganisationSelectController,
          controllerAs: 'vm',
          template: OrganisationSelectTemplate,
        },
      },
      resolve: {
        organisations: [
          'userGateway',
          userGateway => userGateway.getCurrentUserOrganisations()
        ]
      },
    });
  }
}

OrganisationModule.prototype.config.$inject = [
  '$stateProvider',
];

export default OrganisationModule;
