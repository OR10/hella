import mock from 'protractor-http-mock';
import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  initApplication,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';

describe('LabelSelector (right sidebar)', () => {
  let assets;
  let sharedMocks;
  let labelSelector;
  let viewer;

  /**
   * @type {LabelSelectorHelper}
   */
  let labelSelectorHelper;

  function clickRectangleOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 110, y: 110})
      .click()
      .perform();
  }

  function clickRectangleTwo() {
    return browser.actions()
      .mouseMove(viewer, {x: 350, y: 350})
      .click()
      .perform();
  }

  // function deselectAllShapes() {
  //   return browser.actions()
  //     .mouseMove(viewer, {x: 1, y: 1})
  //     .click()
  //     .perform();
  // }

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
    ];

    viewer = element(by.css('.layer-container'));
    labelSelector = element(by.css('label-selector'));

    labelSelectorHelper = new LabelSelectorHelper(labelSelector);
  });

  describe('Basic Behaviour', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.Task,
        assets.mocks.LabelSelector.BasicBehaviour.LabelStructure,
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.getLabeledThingInFrame0to4,
      ]);
    });

    it('should have no panes if nothing is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(0))
        .then(() => done());
    });

    it('should start with all panes closed', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': false,
            'Occlusion': false,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('pane should open on click', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': true,
            'Occlusion': false,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('open pane should close on click', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': false,
            'Occlusion': false,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('should only have one pane open at a time in single-select mode', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToSingleSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': false,
            'Occlusion': true,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('should allow multiple open panes in multi-select mode', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': true,
            'Occlusion': true,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('should close clicked open open panes in multi-select mode', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Truncation').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Truncation').click())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': true,
            'Occlusion': true,
            'Truncation': false,
          }))
        .then(() => done());
    });

    it('should set entry upon click', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Vehicle Type')).toEqual(
          {
            'Car': false,
            'Truck': true,
            '2 wheeler vehicle': false,
            'Bus': false,
            'Misc vehicle': false,
            'Ignore vehicle': false,
          }
        ))
        .then(() => done());
    });

    it('should send LTIF storage request once entry is set', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => browser.sleep(250))
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck))
        .then(() => done());
    });

    it('should send LTIF storage request once entry is set', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => browser.sleep(250))
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck))
        .then(() => done());
    });

    it('should change entry upon click', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck,
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesCar,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Car').click())
        .then(() => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Vehicle Type')).toEqual(
          {
            'Car': true,
            'Truck': false,
            '2 wheeler vehicle': false,
            'Bus': false,
            'Misc vehicle': false,
            'Ignore vehicle': false,
          }
        ))
        .then(() => done());
    });

    it('should send LTIF storage request once entry is changed', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck,
        assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesCar,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Car').click())
        .then(() => browser.sleep(250))
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesCar))
        .then(() => done());
    });
  });

  describe('Legacy and SimpleXml LabelStructure', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.Task,
        assets.mocks.LabelSelector.Legacy.LabelStructure,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.getLabeledThingInFrame0to4,
      ]);
    });

    it('should have correct number of panes if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(4))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getTitleTexts()
        ).toEqual([
          'Vehicle Type',
          'Direction',
          'Occlusion',
          'Truncation',
        ]))
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Vehicle Type': [
              'Car',
              'Truck',
              '2 wheeler vehicle',
              'Bus',
              'Misc vehicle',
              'Ignore vehicle',
            ],
            'Direction': [
              'Right',
              'Left',
              'Front',
              'Back',
            ],
            'Occlusion': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
            'Truncation': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
          }))
        .then(() => done());
    });

    it('should display dependency once proper attribute is set', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicle,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Ignore vehicle').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Vehicle Type': [
              'Car',
              'Truck',
              '2 wheeler vehicle',
              'Bus',
              'Misc vehicle',
              'Ignore vehicle',
            ],
            'Art des Ignore': [
              'Gruppe',
              'Einzelperson',
            ],
            'Direction': [
              'Right',
              'Left',
              'Front',
              'Back',
            ],
            'Occlusion': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
            'Truncation': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
          }))
        .then(() => done());
    });

    it('should display nested dependency once proper attributes are set', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicle,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicleAndIgnoreGroup,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Ignore vehicle').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Art des Ignore', 'Gruppe').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Vehicle Type': [
              'Car',
              'Truck',
              '2 wheeler vehicle',
              'Bus',
              'Misc vehicle',
              'Ignore vehicle',
            ],
            'Art des Ignore': [
              'Gruppe',
              'Einzelperson',
            ],
            'Gruppengröße': [
              'große Gruppe',
              'kleine Gruppe',
            ],
            'Direction': [
              'Right',
              'Left',
              'Front',
              'Back',
            ],
            'Occlusion': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
            'Truncation': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
          }))
        .then(() => done());
    });

    it('should remove whole dependency tree once high level attribute is changed', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicle,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicleAndIgnoreGroup,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesTruck,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Ignore vehicle').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Art des Ignore', 'Gruppe').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Vehicle Type': [
              'Car',
              'Truck',
              '2 wheeler vehicle',
              'Bus',
              'Misc vehicle',
              'Ignore vehicle',
            ],
            'Direction': [
              'Right',
              'Left',
              'Front',
              'Back',
            ],
            'Occlusion': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
            'Truncation': [
              '< 20%',
              '20% - 80%',
              '> 80%',
            ],
          }))
        .then(() => done());
    });

    it('should remove not longer valid classes from ltif request once high level attribute is changed', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicle,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesIgnoreVehicleAndIgnoreGroup,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesTruck,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Ignore vehicle').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Art des Ignore', 'Gruppe').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesTruck))
        .then(() => done());
    });
  });

  describe('RequirementsXml LabelStructure', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.RequirementsXml.RequirementsXmlFile,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.getLabeledThingInFrame1Frame0to4,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.getLabeledThingInFrame2Frame0to4,
      ]);
    });

    it('should have correct number of panes if rectangle one is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(1))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle one is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getTitleTexts()
        ).toEqual([
          'Sign type',
        ]))
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle one is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Sign type': [
              'U-Turn',
              'Speed sign',
            ],
          }))
        .then(() => done());
    });

    it('should have correct number of panes if rectangle two is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(2))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle two is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getTitleTexts()
        ).toEqual([
          'Time',
          'Rain level',
        ]))
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle two is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should switch to correct entries if rectangle is changed', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should display dependencies once entry is selected', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNight,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Street lights': [
              'Neon lights',
              'Halogen lights',
              'Xenon lights',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should display nested dependencies once entry is selected', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNight,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNightAndNeon,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Street lights', 'Neon lights').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Street lights': [
              'Neon lights',
              'Halogen lights',
              'Xenon lights',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should remove nested dependencies once entry is changed again', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNight,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNightAndNeon,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNightAndXenon,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Street lights', 'Neon lights').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Street lights', 'Xenon lights').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Street lights': [
              'Neon lights',
              'Halogen lights',
              'Xenon lights',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should remove whole dependency tree once entry with nested dependencies is changed again', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNight,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNightAndNeon,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesDay,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Street lights', 'Neon lights').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Time': [
              'Day',
              'Night',
            ],
            'Rain level': [
              'Low',
              'Medium',
              'High',
            ],
          }))
        .then(() => done());
    });

    it('should store only classes from visible dependency tree after entry changes', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNight,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesNightAndNeon,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesDay,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Street lights', 'Neon lights').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => browser.sleep(250))
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesDay))
        .then(() => done());
    });

    afterEach(() => {
      expectAllModalsToBeClosed();
      mock.teardown();
    });
  });


  describe('Basic Behaviour', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.References.RequirementsXmlFile,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.getLabeledThingInFrame1Frame0to4,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.getLabeledThingInFrame2Frame0to4,
      ]);
    });

    it('should resolve a reference from the private block', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueA,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value A').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class Private A': [
              'Value Private A',
              'Value Private B',
              'Value Private C',
            ],
          }))
        .then(() => done());
    });

    it('should resolve a reference from another thing', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueB,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class B': [
              'Value C',
              'Value F',
            ],
            'Class D': [
              'Value G',
              'Value H',
              'Value I',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
          }))
        .then(() => done());
    });

    it('should resolve a reference from the same thing', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueB,
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueBF,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value F').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class B': [
              'Value C',
              'Value F',
            ],
            'Class E': [
              'Value J',
              'Value K',
            ],
            'Class D': [
              'Value G',
              'Value H',
              'Value I',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
          }))
        .then(() => done());
    });

    it('should keep a deterministic order if two of the same classes are referenced', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueB,
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueBC,
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueBCE,
      ]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value C').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class C', 'Value E').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class B': [
              'Value C',
              'Value F',
            ],
            'Class C': [
              'Value D',
              'Value E',
            ],
            'Class D': [
              'Value G',
              'Value H',
              'Value I',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
          }))
        .then(() => done());
    });

    xit('should keep the label selector open after a frame change (TTANNO-1165)', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.References.LabeledThingInFrame.putRectangleOneWithClassesValueB,
        assets.mocks.LabelSelector.Framechange.LabeledThingInFrame.getLabeledThingInFrame1Frame1,
      ]));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class B': [
              'Value C',
              'Value F',
            ],
            'Class D': [
              'Value G',
              'Value H',
              'Value I',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
          }))
        .then(() => nextFrameButton.click())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllEntryTexts()
        ).toEqual(
          {
            'Class A': [
              'Value A',
              'Value B',
            ],
            'Class B': [
              'Value C',
              'Value F',
            ],
            'Class D': [
              'Value G',
              'Value H',
              'Value I',
            ],
            'Lamp Color': [
              'White',
              'Orange',
            ],
          }))
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
