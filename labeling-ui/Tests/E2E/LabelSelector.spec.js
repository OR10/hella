import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch, shortSleep, mediumSleep,
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
    return Promise.resolve()
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 110, y: 110})
          .click()
          .perform()
      )
      .then(() => shortSleep());
  }

  function clickRectangleTwo() {
    return Promise.resolve()
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 350, y: 350})
          .click()
          .perform()
      )
      .then(() => shortSleep());
  }

  function clickPedestrian() {
    return Promise.resolve()
      .then(
        () => browser.actions()
          .mouseMove(viewer, {x: 429, y: 380})
          .click()
          .perform()
      )
      .then(() => shortSleep());
  }

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
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
      ]);

      bootstrapPouch([
        assets.documents.LabelSelector.BasicBehaviour.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should have no panes if nothing is selected', done => {
      bootstrapHttp(sharedMocks);

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

      bootstrapHttp(sharedMocks.concat([
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
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 500}) // drag
            .mouseUp()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(0))
        .then(() => done());
    });

    it('should have panes if first a group then another shape is selected', done => {
      const groupButton = element(by.css('button.tool-group.tool-0'));

      bootstrapHttp(sharedMocks.concat([
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
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .mouseDown()
            .mouseMove(viewer, {x: 500, y: 500}) // drag
            .mouseUp()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => clickRectangleOne())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Sign type': false,
            }
          )
        )
        .then(() => done());
    });

    it('should start with all panes closed', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Vehicle Type': false,
              'Direction': false,
              'Occlusion': false,
              'Truncation': false,
            }
          )
        )
        .then(() => done());
    });

    it('pane should open on click', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Vehicle Type': false,
              'Direction': true,
              'Occlusion': false,
              'Truncation': false,
            }
          )
        )
        .then(() => done());
    });

    it('open pane should close on click', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Vehicle Type': false,
              'Direction': false,
              'Occlusion': false,
              'Truncation': false,
            }
          )
        )
        .then(() => done());
    });

    it('should only have one pane open at a time in single-select mode', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToSingleSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => shortSleep())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Vehicle Type': false,
              'Direction': false,
              'Occlusion': true,
              'Truncation': false,
            }
          )
        )
        .then(() => done());
    });

    it('should allow multiple open panes in multi-select mode', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => shortSleep())
        .then(
          () => expect(
            labelSelectorHelper.getAllOpenStates()
          ).toEqual(
            {
              'Vehicle Type': false,
              'Direction': true,
              'Occlusion': true,
              'Truncation': false,
            }
          )
        )
        .then(() => done());
    });

    it('should close clicked open open panes in multi-select mode', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Truncation').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Direction').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Occlusion').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Truncation').click())
        .then(() => shortSleep())
        .then(() => expect(
          labelSelectorHelper.getAllOpenStates()
          ).toEqual(
          {
            'Vehicle Type': false,
            'Direction': true,
            'Occlusion': true,
            'Truncation': false,
          }
          )
        )
        .then(() => done());
    });

    it('should set entry upon click', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Vehicle Type')).toEqual(
            {
              'Car': false,
              'Truck': true,
              '2 wheeler vehicle': false,
              'Bus': false,
              'Misc vehicle': false,
              'Ignore vehicle': false,
            }
          )
        )
        .then(() => done());
    });

    it('should send LTIF storage request once entry is set', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
        .then(() => expect(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesTruck).toExistInPouchDb())
        .then(() => done());
    });

    it('should change entry upon click', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Car').click())
        .then(() => mediumSleep())
        .then(
          () => expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Vehicle Type')).toEqual(
            {
              'Car': true,
              'Truck': false,
              '2 wheeler vehicle': false,
              'Bus': false,
              'Misc vehicle': false,
              'Ignore vehicle': false,
            }
          )
        )
        .then(() => done());
    });

    it('should send LTIF storage request once entry is changed', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Vehicle Type', 'Car').click())
        .then(() => mediumSleep())
        .then(() => expect(assets.mocks.LabelSelector.BasicBehaviour.LabeledThingInFrame.putWithClassesCar).toExistInPouchDb())
        .then(() => done());
    });
  });

  describe('Legacy and SimpleXml LabelStructure', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.Legacy.Task,
        assets.mocks.LabelSelector.Legacy.LabelStructure,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.Legacy.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should have correct number of panes if rectangle is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(4))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(
          () => expect(
            labelSelectorHelper.getTitleTexts()
          ).toEqual(
            [
              'Vehicle Type',
              'Direction',
              'Occlusion',
              'Truncation',
            ]
          )
        )
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should display dependency once proper attribute is set', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Ignore vehicle'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should display nested dependency once proper attributes are set', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Ignore vehicle'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Art des Ignore',
            'Gruppe'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should remove whole dependency tree once high level attribute is changed', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Ignore vehicle'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Art des Ignore',
            'Gruppe'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should remove not longer valid classes from ltif request once high level attribute is changed', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Vehicle Type').click())
        .then(() => shortSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Ignore vehicle'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Art des Ignore',
            'Gruppe'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Vehicle Type',
            'Truck'
          ).click()
        )
        .then(() => mediumSleep())
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
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.MultipleShapes.Task,
        assets.mocks.LabelSelector.MultipleShapes.TaskConfiguration,
        assets.mocks.LabelSelector.MultipleShapes.RequirementsXmlFile,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.MultipleShapes.LabeledThingInFrame.frameIndex0,
      ]);
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
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleLabelTitleTexts))
        .then(() => clickPedestrian())
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleLabelTitleTexts))
        .then(() => clickPedestrian())
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
        .then(() => toolButton0.click())
        .then(() => shortSleep())
        .then(() => clickPedestrian()) // Switch back to pedestrian to check if values were kept
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianLabelTitleTexts))
        .then(done);
    });
  });

  describe('RequirementsXml LabelStructure', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.RequirementsXml.RequirementsXmlFile,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should have correct number of panes if rectangle one is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(1))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle one is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(
          () => expect(
            labelSelectorHelper.getTitleTexts()
          ).toEqual(
            [
              'Sign type',
            ]
          )
        )
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle one is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(
          () => expect(
            labelSelectorHelper.getAllEntryTexts()
          ).toEqual(
            {
              'Sign type': [
                'U-Turn',
                'Speed sign',
              ],
            }
          )
        )
        .then(() => done());
    });

    it('should have correct number of panes if rectangle two is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => expect(labelSelectorHelper.getNumberOfPanes()).toBe(2))
        .then(() => done());
    });

    it('should have correct pane titles if rectangle two is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(
          () => expect(
            labelSelectorHelper.getTitleTexts()
          ).toEqual([
            'Time',
            'Rain level',
          ])
        )
        .then(() => done());
    });

    it('should have correct entries in panes if rectangle two is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should switch to correct entries if rectangle is changed', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => clickRectangleTwo())
        .then(() => clickRectangleOne())
        .then(() => clickRectangleTwo())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should display dependencies once entry is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should display nested dependencies once entry is selected', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Street lights',
            'Neon lights'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should remove nested dependencies once entry is changed again', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Street lights',
            'Neon lights'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Street lights',
            'Xenon lights'
          ).click()
        )
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should remove whole dependency tree once entry with nested dependencies is changed again', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Street lights',
            'Neon lights'
          ).click()
        )
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should store only classes from visible dependency tree after entry changes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleTwo())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Time').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Night').click())
        .then(() => mediumSleep())
        .then(
          () => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
            'Street lights',
            'Neon lights'
          ).click()
        )
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Time', 'Day').click())
        .then(() => mediumSleep())
        .then(() => expect(assets.mocks.LabelSelector.RequirementsXml.LabeledThingInFrame.putRectangleTwoWithClassesDay).toExistInPouchDb())
        .then(() => done());
    });
  });

  describe('References', () => {
    beforeEach(() => {
      sharedMocks = sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.References.RequirementsXmlFile,
      ]);

      bootstrapPouch([
        assets.documents.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should resolve a reference from the private block', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value A').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should resolve a reference from another thing', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should resolve a reference from the same thing', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value F').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should keep a deterministic order if two of the same classes are referenced', done => {
      bootstrapHttp(sharedMocks);

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class B', 'Value C').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class C', 'Value E').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });

    it('should keep the label selector open after a frame change (TTANNO-1165)', done => {
      bootstrapHttp(sharedMocks);

      bootstrapPouch([
        assets.documents.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
        assets.documents.LabelSelector.Framechange.LabeledThingInFrame.frameIndex1,
      ]);

      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(
          () => expect(
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
            }
          )
        )
        .then(() => done());
    });
  });

  describe('View-Styles display', () => {
    const listViewButton = element(by.css('label[for="view-style-list-view"]'));
    const selectedOnlyButton = element(by.css('label[for="view-style-selected-only"]'));

    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.RequirementsXml.Task,
        assets.mocks.LabelSelector.RequirementsXml.TaskConfiguration,
        assets.mocks.LabelSelector.References.RequirementsXmlFile,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.RequirementsXml.LabeledThingInFrame.frameIndex0,
      ]);
    });

    it('should show only checked attributes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(() => selectedOnlyButton.click())
        .then(() => shortSleep())
        .then(() => {
          expect(labelSelectorHelper.getNumberOfPanes()).toBe(4);
          expect(labelSelectorHelper.getAllOpenStates()).toEqual(
            {
              'Class A': true,
              'Class B': true,
              'Class D': true,
              'Lamp Color': true,
            }
          );
          expect(labelSelectorHelper.getEntrySelectionStatesByTitleText('Class A')).toEqual(
            {
              'Value B': true,
              'Value A': false,
            }
          );
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
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => clickRectangleOne())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Class A', 'Value B').click())
        .then(() => mediumSleep())
        .then(() => selectedOnlyButton.click())
        .then(() => shortSleep())
        .then(() => listViewButton.click())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Class A').click())
        .then(() => shortSleep())
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
    let rectangleGroupOneName;
    let pedestrianGroupTwoName;

    function clickRectangleGroupOne() {
      return Promise.resolve()
        .then(
          () => browser.actions()
            .mouseMove(viewer, {x: 98, y: 98})
            .click()
            .perform()
        )
        .then(() => mediumSleep());
    }

    function clickPedestrianGroupTwo() {
      return Promise.resolve()
        .then(
          () => browser.actions()
            .mouseMove(viewer, {x: 400, y: 313})
            .click()
            .perform()
        )
        .then(() => mediumSleep());
    }

    beforeEach(() => {
      pedestrianName = 'Blub';
      rectangleName = 'Traffic Sign';
      rectangleGroupOneName = 'The Blues Brothers';
      pedestrianGroupTwoName = 'Peter, Paul and Mary';
    });

    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.DynamicTitle.Task,
        assets.mocks.LabelSelector.DynamicTitle.TaskConfiguration,
        assets.mocks.LabelSelector.DynamicTitle.RequirementsXmlFile,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.DynamicTitle.LabeledThingGroup.GroupOne,
        assets.documents.LabelSelector.DynamicTitle.LabeledThingGroup.GroupTwo,
        assets.documents.LabelSelector.DynamicTitle.LabeledThingGroup.GroupThree,
        assets.documents.LabelSelector.DynamicTitle.LabeledThingInFrame.frameIndex0,
      ]);
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
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleName))
        .then(done);
    });

    it('should show the name of the rectangle group', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickRectangleGroupOne())
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual(rectangleGroupOneName))
        .then(done);
    });

    it('should show the name of the pedestrian group', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickPedestrianGroupTwo())
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual(pedestrianGroupTwoName))
        .then(done);
    });
  });

  describe('Group Attributes', () => {
    function clickGroupWithAttributes() {
      return Promise.resolve()
        .then(
          () => browser.actions()
            .mouseMove(viewer, {x: 98, y: 98})
            .click()
            .perform()
        )
        .then(() => mediumSleep());
    }

    function clickGroupWithoutAttributes() {
      return Promise.resolve()
        .then(
          () => browser.actions()
            .mouseMove(viewer, {x: 400, y: 313})
            .click()
            .perform()
        )
        .then(() => mediumSleep());
    }

    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.LabelSelector.GroupAttributes.Task,
        assets.mocks.LabelSelector.GroupAttributes.TaskConfiguration,
        assets.mocks.LabelSelector.GroupAttributes.RequirementsXmlFile,
      ]));

      bootstrapPouch([
        assets.documents.LabelSelector.GroupAttributes.LabeledThingGroup.GroupOne,
        assets.documents.LabelSelector.GroupAttributes.LabeledThingGroup.GroupTwo,
        assets.documents.LabelSelector.GroupAttributes.LabeledThingGroup.GroupThree,
        assets.documents.LabelSelector.GroupAttributes.LabeledThing.ThingOneAndTwo,
        assets.documents.LabelSelector.GroupAttributes.LabeledThingInFrame.frameIndex0,
        assets.documents.LabelSelector.GroupAttributes.LabeledThingInFrame.frameIndex1,
      ]);
    });

    it('should show empty attribute selector for group without attributes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithoutAttributes())
        .then(() => labelSelectorHelper.getNumberOfPanes())
        .then(numberOfPanes => expect(numberOfPanes).toEqual(0))
        .then(done);
    });

    it('should show attribute selector with correct number of panes for group with attributes', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.getNumberOfPanes())
        .then(numberOfPanes => expect(numberOfPanes).toEqual(5))
        .then(done);
    });

    it('should show attribute selector with correct pane titles', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(
          titles => expect(titles).toEqual([
            'Distance',
            'Target',
            'Tank Fill Level',
            'Cigarette Fill Level',
            'Darkness',
          ])
        )
        .then(done);
    });

    it('should show attribute selector with correct attribute content', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.getAllEntryTexts())
        .then(
          entries => expect(entries).toEqual({
            'Distance': [
              '106 Kilometers',
              '423 Kilometers',
            ],
            'Target': [
              'Chicago',
              'Miami',
            ],
            'Tank Fill Level': [
              'Full',
              'Empty',
            ],
            'Cigarette Fill Level': [
              'Full',
              'Half a Pack',
            ],
            'Darkness': [
              'yes',
              'no',
            ],
          })
        )
        .then(done);
    });

    it('should store selected attributes with a corresponding ltgif', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Target', 'Chicago').click())
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.documents.LabelSelector.GroupAttributes.LabeledThingGroupInFrame.ChicagoOnFrameIndex0).toExistInPouchDb();
        })
        .then(done);
    });

    it('should ghost attributes to the next frame', done => {
      let nextFrameButton;

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => {
          nextFrameButton = element(by.css('.next-frame-button'));
        })
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Target', 'Chicago').click())
        .then(() => mediumSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntrySelectionStatesByTitleText('Target'))
        .then(selectionStates => expect(selectionStates).toEqual({
          'Chicago': true,
          'Miami': false,
        }))
        .then(done);
    });

    it('should realize ghosts if attributes are set on the next frame', done => {
      let nextFrameButton;

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => {
          nextFrameButton = element(by.css('.next-frame-button'));
        })
        .then(() => clickGroupWithAttributes())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Target', 'Chicago').click())
        .then(() => mediumSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Darkness', 'yes').click())
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.documents.LabelSelector.GroupAttributes.LabeledThingGroupInFrame.ChicagoOnFrameIndex0).toExistInPouchDb();
          expect(assets.documents.LabelSelector.GroupAttributes.LabeledThingGroupInFrame.ChicagoAndDarknessOnFrameIndex1).toExistInPouchDb();
        })
        .then(done);
    });

    it('should not propagate ghost attributes backwards', done => {
      let nextFrameButton;
      let previousFrameButton;

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => {
          nextFrameButton = element(by.css('.next-frame-button'));
          previousFrameButton = element(by.css('.previous-frame-button'));
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Target', 'Chicago').click())
        .then(() => mediumSleep())
        .then(() => previousFrameButton.click())
        .then(() => mediumSleep())
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntrySelectionStatesByTitleText('Target'))
        .then(selectionStates => expect(selectionStates).toEqual({
          'Chicago': false,
          'Miami': false,
        }))
        .then(done);
    });

    it('should handle nested attributes properly', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.switchToSingleSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(
          titles => expect(titles).toEqual([
            'Distance',
            'Target',
            'Tank Fill Level',
            'Cigarette Fill Level',
            'Darkness',
          ])
        )
        .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText('Darkness').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Darkness', 'yes').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getTitleTexts())
        .then(
          titles => expect(titles).toEqual([
            'Distance',
            'Target',
            'Tank Fill Level',
            'Cigarette Fill Level',
            'Darkness',
            'Wearing Sunglasses',
          ])
        )
        .then(done);
    });

    it('should mark fully labeled ltgifs as complete', done => {
      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling',
        {
          viewerWidth: 1104,
          viewerHeight: 620,
        }
      )
        .then(() => clickGroupWithAttributes())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.switchToMultiSelectMode())
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Distance',
          '106 Kilometers'
        ).click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Target', 'Chicago').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Tank Fill Level',
          'Full'
        ).click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Cigarette Fill Level',
          'Half a Pack'
        ).click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText('Darkness', 'yes').click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
          'Wearing Sunglasses',
          'yes'
        ).click())
        .then(() => mediumSleep())
        .then(() => {
          expect(assets.documents.LabelSelector.GroupAttributes.LabeledThingGroupInFrame.CompletedOnFrameIndex0).toExistInPouchDb();
        })
        .then(done);
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
