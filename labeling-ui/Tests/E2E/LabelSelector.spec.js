import mock from 'protractor-http-mock';
import {
  expectAllModalsToBeClosed,
  getMockRequestsMade,
  // dumpAllRequestsMade,
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

  function clickRectangle() {
    return browser.actions()
      .mouseMove(viewer, {x: 110, y: 110})
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
      assets.mocks.Shared.LabelStructure,
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => browser.sleep(250))
        .then(() => getMockRequestsMade(mock))
        .then(requests => expect(requests).toContainRequest(assets.mocks.LabelSelector.BasicBehaviourLabeledThingInFrame.putWithClassesTruck))
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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
        .then(() => clickRectangle())
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

  describe('Legacy LabelStructure', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.Task,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.getLabeledThingInFrame0to4,
      ]);
    });

    it('should have panes if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangle())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(4))
        .then(() => done());
    });

    it('should have correct headlines if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangle())
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

    it('should have correct contents if rectangle is selected', done => {
      mock(sharedMocks.concat([]));

      initApplication('/labeling/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling', {
        viewerWidth: 1104,
        viewerHeight: 620,
      })
        .then(() => clickRectangle())
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
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
