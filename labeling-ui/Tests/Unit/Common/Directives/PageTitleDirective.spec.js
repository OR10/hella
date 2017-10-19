import {module, inject} from 'angular-mocks';
import PageTitleDirective from 'Application/Common/Directives/PageTitleDirective';
import ReadableRoleFilterProvider from 'Application/ManagementBoard/Filters/ReadableRoleFilterProvider';
import SingleRoleFilterProvider from 'Application/ManagementBoard/Filters/SingleRoleFilterProvider';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';
const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

describe('PageTitle Directive Test Suite', () => {
  const username = 'Unit-Test';
  const roles = [
    'ROLE_SUPER_ADMIN',
    'ROLE_LABEL_MANAGER',
  ];

  let rootScope;
  let compile;
  let element;
  let scope;

  let currentUserServiceMock;
  let organisationServiceMock;

  beforeEach(() => {
    currentUserServiceMock = jasmine.createSpyObj('currentUserService', ['get', 'getOrganisations', 'getRoles']);
    organisationServiceMock = jasmine.createSpyObj('organisationService', ['get']);

    currentUserServiceMock.get.and.returnValue({
      username: username,
      roles: roles,
    });

    currentUserServiceMock.getRoles.and.returnValue(roles);

    currentUserServiceMock.getOrganisations.and.returnValue([]);

    module($provide => {
      $provide.value('currentUserService', currentUserServiceMock);
      $provide.value('organisationService', organisationServiceMock);
    });
  });

  beforeEach(() => {
    const angularModule = new AnnoStationUnitTestModule();
    angularModule.registerDirective('pageTitle', PageTitleDirective);
    angularModule.registerFilter('readableRole', ReadableRoleFilterProvider);
    angularModule.registerFilter('singleRole', SingleRoleFilterProvider);
    // module.registerService('currentUserService', currentUserServiceMock);
    // module.registerService('organisationService', organisationServiceMock);
  });

  beforeEach(module('AnnoStation-Unit'));

  beforeEach(inject(($rootScope, $compile) => {
    rootScope = $rootScope;
    compile = $compile;
  }));

  function renderDirective(title) {
    scope = rootScope.$new();
    element = compile(`<page-title title="${title}"></page-title>`)(scope);
    scope.$apply();
  }

  it('renders the default title if no title given', () => {
    scope = rootScope.$new();
    element = compile('<page-title></page-title>')(scope);
    scope.$apply();

    const h1 = element.find('h1');
    expect(h1.text()).toEqual('AnnoStation');
  });

  it('renders the correct title', () => {
    const title = 'Foobar-Heinz';
    renderDirective(title);

    const h1 = element.find('h1');
    expect(h1.text()).toEqual(title);
  });

  it('renders the username', () => {
    renderDirective();

    const usernameElement = element.find('div.page-header__user-info__line.user-name span');
    expect(usernameElement.text()).toEqual(username);
  });

  it('renders the role', () => {
    renderDirective();

    const usernameElement = element.find('div.page-header__user-info__line.user-role');
    expect(usernameElement.text()).toEqual('SuperAdmin');
  });

  it('renders an empty organization', () => {
    renderDirective();

    const usernameElement = element.find('div.page-header__user-info__line.user-organisation');
    expect(usernameElement.text()).toEqual('');
  });
});
