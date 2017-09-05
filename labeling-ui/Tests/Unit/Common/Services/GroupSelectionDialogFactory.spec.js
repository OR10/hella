import GroupSelectionDialogFactory from '../../../../Application/Common/Services/ModalDialogs/GroupSelectionDialogFactory';
import {inject} from 'angular-mocks';

import taskModelFixture from '../../../Fixtures/Models/Frontend/Task';
import labeledThingGroupFixture from '../../../Fixtures/Models/Frontend/LabeledThingGroup';
import labeledThingGroupFixture2 from '../../../Fixtures/Models/Frontend/LabeledThingGroup2';
import LabelStructureGroup from '../../../../Application/Task/Model/LabelStructureGroup';

describe('GroupSelectionDialogFactory', () => {
  let angularQ;
  let rootScope;

  let SelectionDialogMock;
  let labeledThingGroupGatewayMock;
  let labelStructureServiceMock;
  let groupNameServiceMock;
  let loggerMock;

  let labelStructureMock;

  let groupIds;
  let groupOne;
  let groupTwo;
  let groupThree;
  let groups;
  let groupStructureMap;

  let task;


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

  beforeEach(() => {
    labelStructureMock = jasmine.createSpyObj('LabelStructure', ['getGroups']);
    labelStructureServiceMock.getLabelStructure
      .and.returnValue(angularQ.resolve(labelStructureMock));
  });

  beforeEach(() => {
    groupIds = [
      'group-1',
      'group-2',
      'group-3',
    ];

    groupOne = labeledThingGroupFixture.clone();
    groupOne.id = 'group-1';
    groupTwo = labeledThingGroupFixture.clone();
    groupTwo.id = 'group-2';
    groupThree = labeledThingGroupFixture2.clone();
    groupThree.id = 'group-3';

    groups = [
      groupOne,
      groupTwo,
      groupThree,
    ];

    labeledThingGroupGatewayMock.getLabeledThingGroupsByIds
      .and.returnValue(angularQ.resolve(groups));

    groupStructureMap = new Map();
    groupStructureMap.set(
      'extension-sign-group',
      new LabelStructureGroup(
        'extension-sign-group',
        'Extension Sign',
        'rectangle'
      )
    );
    groupStructureMap.set(
      'extension-sign-group-2',
      new LabelStructureGroup(
        'extension-sign-group-2',
        'Extension Sign 2',
        'rectangle'
      )
    );

    labelStructureMock.getGroups
      .and.returnValue(groupStructureMap);

    groupNameServiceMock.getNameById.and.callFake(id => `unique-${id}`);
  });

  beforeEach(() => {
    task = taskModelFixture.clone();
  });

  it('should be instantiable', () => {
    const factory = createFactory();
    expect(factory).toEqual(jasmine.any(GroupSelectionDialogFactory));
  });

  it('should return promise', () => {
    const factory = createFactory();
    const returnValue = factory.createAsync({}, [], {});
    expect(returnValue.then).toEqual(jasmine.any(Function));
  });

  it('should fetch given groups by id', () => {
    const factory = createFactory();
    factory.createAsync(task, groupIds, {});

    expect(labeledThingGroupGatewayMock.getLabeledThingGroupsByIds)
      .toHaveBeenCalledWith(task, groupIds);
  });

  it('should request labelStructure for given task', () => {
    const factory = createFactory();
    factory.createAsync(task, [], {});

    expect(labelStructureServiceMock.getLabelStructure)
      .toHaveBeenCalledWith(task);
  });

  it('should create a SelectionDialog with a list of groupNumber and name mappings', () => {
    const expectedDialogData = [
      {id: 'group-1', name: 'unique-group-1: Extension Sign'},
      {id: 'group-2', name: 'unique-group-2: Extension Sign'},
      {id: 'group-3', name: 'unique-group-3: Extension Sign 2'},
    ];

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, {});

    rootScope.$apply();
    const dialogContent = SelectionDialogMock.calls.mostRecent().args[0];
    expect(dialogContent.data).toEqual(expectedDialogData);
  });

  it('should call the given confirm callback on dialog completion', () => {
    const confirmCallback = jasmine.createSpy('confirm callback');

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, {}, confirmCallback);
    rootScope.$apply();

    const dialogConfirmCallback = SelectionDialogMock.calls.mostRecent().args[1];
    dialogConfirmCallback();

    expect(confirmCallback).toHaveBeenCalled();
  });

  it('should call the given confirm callback with undefined if nothing was selected', () => {
    const confirmCallback = jasmine.createSpy('confirm callback');

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, {}, confirmCallback);
    rootScope.$apply();

    const dialogConfirmCallback = SelectionDialogMock.calls.mostRecent().args[1];
    dialogConfirmCallback(undefined);

    expect(confirmCallback).toHaveBeenCalledWith(undefined);
  });

  it('should call the given confirm callback with corresponding group model', () => {
    const confirmCallback = jasmine.createSpy('confirm callback');

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, {}, confirmCallback);
    rootScope.$apply();

    const dialogConfirmCallback = SelectionDialogMock.calls.mostRecent().args[1];
    dialogConfirmCallback('group-2');

    expect(confirmCallback).toHaveBeenCalledWith(groupTwo);
  });

  it('should pass through the cancel callback', () => {
    const cancelCallback = jasmine.createSpy('cancel callback');

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, {}, undefined, cancelCallback);

    rootScope.$apply();
    expect(SelectionDialogMock).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.anything(),
      cancelCallback,
    );
  });

  it('should pass through dialog content', () => {
    const content = {
      title: 'Some title',
      headline: 'Headline!',
      message: 'Message!',
      defaultSelection: 'Eine Scheibe Brot zum Wasser?',
      confirmButtonText: 'Confirm It!',
      cancelButtonText: 'Oh no!',
    };

    const factory = createFactory();
    factory.createAsync(task, groupIds, undefined, content);

    rootScope.$apply();
    const dialogContent = SelectionDialogMock.calls.mostRecent().args[0];
    Object.keys(content).forEach(
      key => expect(dialogContent[key]).toEqual(content[key])
    );
  });

  it('should reject if labeledThingGroups could not be retrieved', () => {
    const error = new Error('Woop! There goes the universe...');

    labeledThingGroupGatewayMock.getLabeledThingGroupsByIds
      .and.returnValue(angularQ.reject(error));

    const factory = createFactory();
    const returnValue = factory.createAsync(task, groupIds, {});
    const rejectPromise = jasmine.createSpy('promise rejected');
    returnValue.catch(rejectPromise);

    rootScope.$apply();

    expect(rejectPromise).toHaveBeenCalledWith(error);
  });

  it('should reject if labeledStructure could not be retrieved', () => {
    const error = new Error('Woop! There goes the universe...');

    labelStructureServiceMock.getLabelStructure
      .and.returnValue(angularQ.reject(error));

    const factory = createFactory();
    const returnValue = factory.createAsync(task, groupIds, {});
    const rejectPromise = jasmine.createSpy('promise rejected');
    returnValue.catch(rejectPromise);

    rootScope.$apply();

    expect(rejectPromise).toHaveBeenCalledWith(error);
  });

  it('should filter selection to specific group type', () => {
    const expectedDialogData = [
      {id: 'group-3', name: 'unique-group-3: Extension Sign 2'},
    ];

    const factory = createFactory();
    factory.createAsync(task, groupIds, 'extension-sign-group-2', {});

    rootScope.$apply();
    const dialogContent = SelectionDialogMock.calls.mostRecent().args[0];
    expect(dialogContent.data).toEqual(expectedDialogData);
  });
});
