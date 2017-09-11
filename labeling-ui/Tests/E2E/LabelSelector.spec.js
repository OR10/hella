import {
  expectAllModalsToBeClosed,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';

fdescribe('LabelSelector (right sidebar)', () => {
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

  function clickPedestrian() {
    return browser.actions()
      .mouseMove(viewer, {x: 429, y: 380})
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
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(0))
        .then(() => done());
    });

    it('should have no panes if a group is selected', done => {
      const groupButton = element(by.css('button.tool-group.tool-0'));

      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.Groups.Task,
        assets.mocks.LabelSelector.BasicBehaviour.Groups.TaskConfiguration,
        assets.mocks.LabelSelector.BasicBehaviour.Groups.TaskConfigurationFile,
      ]));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => groupButton.click())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 500}) // drag
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(0))
        .then(() => done());
    });

    it('should have panes if first a group then another shape is selected', done => {
      const groupButton = element(by.css('button.tool-group.tool-0'));

      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.BasicBehaviour.Groups.Task,
        assets.mocks.LabelSelector.BasicBehaviour.Groups.TaskConfiguration,
        assets.mocks.LabelSelector.BasicBehaviour.Groups.TaskConfigurationFile,
      ]));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => groupButton.click())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 500}) // drag
            .mouseUp()
            .perform();
        })
        .then(() => browser.sleep(200))
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
        ).toEqual(
          {
            'Sign type': false,
          }))
        .then(() => done());
    });

    it('should start with all panes closed', done => {
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Truck'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Truck'
        ).click())
        .then(() => browser.sleep(250))
        .then(() => expect(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck).toExistInPouchDb())
        .then(() => done());
    });

    it('should change entry upon click', done => {
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Truck'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Truck'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Car').click())
        .then(() => browser.sleep(250))
        .then(() => expect(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesCar).toExistInPouchDb())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(4))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle is selected', done => {
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Ignore vehicle'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Ignore vehicle'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Art des Ignore',
          'Gruppe'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Ignore vehicle'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Art des Ignore',
          'Gruppe'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Vehicle Type',
          'Truck'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Ignore vehicle').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Art des Ignore', 'Gruppe').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Truck').click())
        .then(() => expect(assets.mocks.LabelSelector.Legacy.LabeledThingInFrame.putWithClassesTruck).toExistInPouchDb())
        .then(() => done());
    });
  });

  describe('Multiple, different Shapes (TTANNO-1671)', () => {
    const pedestrianLabelTitleTexts = [
      'Time',
      'Rain level',
    ];

    const rectangleLabelTitleTexts = [
      'Sign type',
    ];

    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.MultipleShapes.Task,
        assets.mocks.LabelSelector.MultipleShapes.TaskConfiguration,
        assets.mocks.LabelSelector.MultipleShapes.RequirementsXmlFile,
        assets.mocks.LabelSelector.MultipleShapes.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.MultipleShapes.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.MultipleShapes.LabeledThingInFrame.getLabeledThingInFrame1Frame0to4,
        assets.mocks.LabelSelector.MultipleShapes.LabeledThingInFrame.getLabeledThingInFrame2Frame0to4,
      ]);

      mock(sharedMocks);
    });

    it('shows the correct panes if selected tool and selected shape are of different types', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickPedestrian())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(done);
    });

    it('correctly switches the label selector when switching the shapes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(350))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleLabelTitleTexts))
        .then(() => clickPedestrian())
        .then(() => browser.sleep(350))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(350))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleLabelTitleTexts))
        .then(() => clickPedestrian())
        .then(() => browser.sleep(350))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(done);
    });

    it('keeps the label selector values when selecting a different tool', done => {
      const toolButton0 = element(by.css('button.tool-button.tool-thing.tool-0'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickPedestrian())
        .then(() => browser.sleep(250))
        .then(() => toolButton0.click())
        .then(() => browser.sleep(250))
        .then(() => clickPedestrian()) // Switch back to pedestrian to check if values were kept
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(done);
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(1))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle one is selected', done => {
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(2))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle two is selected', done => {
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Street lights',
          'Neon lights'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Street lights',
          'Neon lights'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Street lights',
          'Xenon lights'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Street lights',
          'Neon lights'
        ).click())
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Street lights',
          'Neon lights'
        ).click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => browser.sleep(250))
        .then(() => expect(assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesDay).toExistInPouchDb())
        .then(() => done());
    });

    afterEach(() => {
      expectAllModalsToBeClosed();
      mock.teardown();
    });
  });


  describe('References', () => {
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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
      mock(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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

    it('should keep the label selector open after a frame change (TTANNO-1165)', done => {
      mock(sharedMocks.concat([
        assets.mocks.LabelSelector.Framechange.LabeledThingInFrame.frameIndex1,
        assets.mocks.LabelSelector.Framechange.LabeledThingInFrame.getLabeledThingInFrame1Frame0to4,
        assets.mocks.LabelSelector.Framechange.LabeledThingInFrame.getLabeledThingInFrame1Frame1,
        assets.mocks.LabelSelector.Framechange.LabeledThingInFrame.getLabeledThingInFrame1Frame1to5,
      ]));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
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

  describe('View-Styles display', () => {
    const listViewButton = element(by.css('label[for="view-style-list-view"]'));
    const selectedOnlyButton = element(by.css('label[for="view-style-selected-only"]'));

    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.References.RequirementsXmlFile,
        assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
      ]);
    });
    it('should shown only checked attributes', done => {
      mock(sharedMocks);
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => selectedOnlyButton.click())
        .then(() => browser.sleep(250))
        .then(() => {
          expect(labelSelectorHelper.getNumberOfPanes()).toBe(4);
          expect(labelSelectorHelper.getAllOpenStates()).toEqual({
            'Class A': true,
            'Class B': true,
            'Class D': true,
            'Lamp Color': true,
          });
          expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Class A')).toEqual({
            'Value B': true,
            'Value A': false,
          });
        })
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B'))
        .then(element => expect(element.isDisplayed()).toBe(true))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value A'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value C'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value F'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class D', 'Value G'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class D', 'Value H'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class D', 'Value I'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Lamp Color', 'White'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Lamp Color', 'Orange'))
        .then(element => expect(element.isDisplayed()).toBe(false))
        .then(() => done());
    });

    it('should show attribute list view style', done => {
      mock(sharedMocks);
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => selectedOnlyButton.click())
        .then(() => browser.sleep(250))
        .then(() => listViewButton.click())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B'))
        .then(element => expect(element.isDisplayed()).toBe(true))
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value A'))
        .then(element => expect(element.isDisplayed()).toBe(true))
        .then(() => done());
    });
  });

  describe('LabelSelector Dynamic Title', () => {
    let pedestrianName;
    let rectangleName;
    // let groupOneName;
    // let groupTwoName;
    // let groupThreeName;

    beforeEach(() => {
      pedestrianName = 'Blub';
      rectangleName = 'Traffic Sign';
      // groupOneName = 'The Blues Brothers';
      // groupTwoName = 'The Blues Brothers';
      // groupThreeName = 'Peter, Paul and Mary';
    });

    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.DynamicTitle.Task,
        assets.mocks.LabelSelector.DynamicTitle.TaskConfiguration,
        assets.mocks.LabelSelector.DynamicTitle.RequirementsXmlFile,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingGroup.GroupOne,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingGroup.GroupTwo,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingGroup.GroupThree,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingInFrame.frameIndex0,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingInFrame.frameIndex0to4,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingInFrame.getLabeledThingInFrame1Frame0to4,
        assets.mocks.LabelSelector.DynamicTitle.LabeledThingInFrame.getLabeledThingInFrame2Frame0to4,
      ]);

      mock(sharedMocks);
    });

    it('should show the name of pedestrian shape', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickPedestrian())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianName))
        .then(done);
    });

    it('should show the name of rectangle shape', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => browser.sleep(250))
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleName))
        .then(done);
    });

    // @TODO: add tests for groupnames here, once TTANNO-1792 is implemented
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    mock.teardown();
  });
});
