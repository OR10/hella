import GroupSelectionDialogFactory from '../../../../Application/Common/Services/ModalDialogs/GroupSelectionDialogFactory';
import {inject} from 'angular-mocks';

fdescribe('GroupSelectionDialogFactory', () => {
  let angularQ;
  let rootScope;

  let SelectionDialogMock;
  let labeledThingGroupGatewayMock;
  let labelStructureServiceMock;
  let groupNameServiceMock;
  let loggerMock;


  function createFactory() {
    return new GroupSelectionDialogFactory(
      SelectionDialogMock,
      angularQ,
      labeledThingGroupGatewayMock,
      labelStructureServiceMock,
      groupNameServiceMock,
      loggerMock
    );
  }

  beforeEach(inject(($rootScope, $q) => {
    rootScope = $rootScope;
    angularQ = $q;
  }));

  beforeEach(() => {
    SelectionDialogMock = jasmine.createSpy('SelectionDialogMock constructor');
    labeledThingGroupGatewayMock = jasmine.createSpyObj('LabeledThingGroupGateway', ['getLabeledThingGroupsByIds']);
    labelStructureServiceMock = jasmine.createSpyObj('LabelStructureService', ['getLabelStructure']);
    groupNameServiceMock = jasmine.createSpyObj('GroupNameService', ['getNameById']);
    loggerMock = jasmine.createSpyObj('LoggerService', ['log', 'warn', 'groupStart', 'groupStartOpened', 'groupEnd']);
  });

  it('should be instantiable', () => {
    const factory = createFactory();
    expect(factory).toEqual(jasmine.any(GroupSelectionDialogFactory));
  });
});