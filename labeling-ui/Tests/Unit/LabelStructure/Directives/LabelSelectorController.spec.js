import {inject} from 'angular-mocks';
import LabelSelectorController from 'Application/LabelStructure/Directives/LabelSelectorController';

fdescribe('LabelSelectorController tests', () => {
  /**
   * @type {$rootScope}
   */
  let rootScope;
  let scope;

  beforeEach(inject(($rootScope) => {
    rootScope = $rootScope;
    scope = $rootScope.$new();
  }));

  it('can be created', () => {
    const controller = new LabelSelectorController(
      scope,
      rootScope,
      null, // $location
      null, // linearLabelStructureVisitor
      null, // annotationLabelStructureVisitor
      null, // labeledFrameGateway
      null, // labeledThingGateway
      null, // labeledThingInFrameGateway
      null, // entityIdService
      null, // modalService
      null, // applicationState
      null // taskGateway
    );
    expect(controller).toEqual(jasmine.any(LabelSelectorController));
  });
});