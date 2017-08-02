import {module, inject} from 'angular-mocks';
import LoadingMaskDirective from 'Application/Common/Directives/LoadingMaskDirective';
import ApplicationModule from 'Application/Module';
import annoStationUnitTestModuleCreator from 'Tests/Support/AnnoStationUnitTestModule';
const AnnoStationUnitTestModule = annoStationUnitTestModuleCreator(ApplicationModule);

describe('LoadingMaskDirective tests', () => {
  let compile;
  let rootScope;

  beforeEach(() => {
    const angularModule = new AnnoStationUnitTestModule();
    angularModule.registerDirective('loadingMask', LoadingMaskDirective);
    module('AnnoStation-Unit');
  });

  beforeEach(inject(($compile, $rootScope) => {
    compile = $compile;
    rootScope = $rootScope;
  }));

  it('can be created', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-mask-inner').size()).toEqual(1);
  });

  it('is not visible by default', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-spinner').size()).toEqual(0);
  });

  it('is not visible if spinner is set to any value', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask spinner="irgendwas"></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-spinner').size()).toEqual(0);
  });

  it('is visible if spinner is set to true', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask spinner="true"></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-spinner').size()).toEqual(1);
  });

  it('renders the message', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask message="\'Huhu\'"></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-mask-message').text().trim()).toEqual('Huhu');
  });

  it('is visible of spinner data binding is true', () => {
    const scope = rootScope.$new();
    scope.spinning = true;
    const element = compile('<loading-mask spinner="spinning"></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-spinner').size()).toEqual(1);
  });

  it('is not visible of spinner data binding is false', () => {
    const scope = rootScope.$new();
    scope.spinning = false;
    const element = compile('<loading-mask spinner="spinning"></loading-mask>')(scope);
    scope.$apply();
    expect(element.find('.loading-spinner').size()).toEqual(0);
  });

  it('can access the controller', () => {
    const scope = rootScope.$new();
    const element = compile('<loading-mask></loading-mask>')(scope);
    scope.$apply();
    const controller = element.controller('loadingMask');

    expect(controller.spinner).toBe(false);
    expect(controller.backdrop).toBe(true);
    expect(controller.blockInteraction).toBe(true);
    expect(controller.message).toEqual('');
  });
});
