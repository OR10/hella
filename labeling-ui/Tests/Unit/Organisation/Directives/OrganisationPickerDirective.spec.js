import {module, inject} from 'angular-mocks';
import OrganisationPickerDirective from 'Application/Organisation/Directives/OrganisationPickerDirective';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';

const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

describe('Organisation-Picker', () => {
  let rootScope;
  let compile;
  let element;
  let scope;

  let currentUserServiceMock;
  let organisationServiceMock;
  let organisationRoutingServiceMock;

  beforeEach(() => {
    currentUserServiceMock = jasmine.createSpyObj('currentUserService', ['getOrganisations']);
    organisationServiceMock = jasmine.createSpyObj('organisationService', ['get', 'subscribe']);
    organisationRoutingServiceMock = jasmine.createSpyObj(
      'organisationRoutingService',
      ['transistionToNewOrganisation']
    );

    const firstOrganization = {id: 1, name: 'Unit Test Organization One'};
    const secondOrganization = {id: 2, name: 'Unit Test Organization Two'};

    organisationServiceMock.get.and.returnValue(firstOrganization.id);

    currentUserServiceMock.getOrganisations.and.returnValue([
      firstOrganization,
      secondOrganization,
    ]);

    module($provide => {
      $provide.value('currentUserService', currentUserServiceMock);
      $provide.value('organisationService', organisationServiceMock);
      $provide.value('organisationRoutingService', organisationRoutingServiceMock);
    });
  });

  beforeEach(() => {
    const angularModule = new AnnoStationUnitTestModule();
    angularModule.registerDirective('organisationPicker', OrganisationPickerDirective);
    module('AnnoStation-Unit');
  });

  beforeEach(inject(($rootScope, $compile) => {
    rootScope = $rootScope;
    compile = $compile;
  }));

  function renderDirective() {
    scope = rootScope.$new();
    element = compile(`<organisation-picker></organisation-picker>`)(scope);
    scope.$apply();
  }

  it('renders the correct selected organization in dropdown', () => {
    renderDirective();

    const organisationElement = element.find('select');
    expect(organisationElement.val()).toEqual('1');
  });

  it('does not render the organisation if user is not in the active organisation', () => {
    organisationServiceMock.get.and.returnValue(5);

    renderDirective();

    const organisationElement = element.find('select');
    expect(organisationElement.val()).toEqual('?');
  });
});
