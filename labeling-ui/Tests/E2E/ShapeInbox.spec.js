import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
  shortSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('ShapeInbox', () => {
  let assets;
  let viewer;
  let shapeInboxBadge;
  let shapeInboxButton;
  let shapeInboxSelectedList;
  let shapeInboxSavedList;
  let sharedMocks;

  const firstShape = {
    topLeft: {x: 100, y: 100},
    bottomRight: {x: 200, y: 200},
  };

  const secondShape = {
    topLeft: {x: 250, y: 250},
    bottomRight: {x: 350, y: 450},
  };

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
    sharedMocks = [
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Task,
      assets.mocks.Shared.Video,
      assets.mocks.Shared.LabelStructure,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.rectangleLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    bootstrapHttp(sharedMocks);

    bootstrapPouch([
      assets.documents.ShapeInbox.DrawTwoRectangles,
    ]);

    viewer = element(by.css('.layer-container'));
    shapeInboxBadge = element(by.css('.task-bar .badge'));
    shapeInboxButton = element(by.css('.task-bar .icon.fa-inbox'));
    shapeInboxSelectedList = element(by.css('#popup-inbox-selected .popup-inbox-list'));
    shapeInboxSavedList = element(by.css('#popup-inbox-saved .popup-inbox-list'));
  });


  describe('Badge', () => {
    it('does not show a badge if no shape is selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('shows a badge if one shape is selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
        .then(() => done());
    });

    it('shows a badge if two shapes are selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('2'))
        .then(() => done());
    });

    it('shows a badge if first two shapes are selected and then one is deselected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual('1'))
        .then(() => done());
    });

    it('does not show a badge if first two shapes are selected and then deselected by clicking into the viewer', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });
  });

  describe('Popup', () => {
    const ctrlClickSecondShape = () => {
      return browser.actions()
        .sendKeys(protractor.Key.CONTROL)
        .mouseMove(viewer, secondShape.topLeft) // initial position
        .click()
        .sendKeys(protractor.Key.NULL)
        .perform();
    };

    it('opens a popup window with the text "No shapes selected" if no shapes are selected', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a popup with the names of the two selected shapes when clicking the inbox icon', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('opens a popup with the names of the two selected shapes when clicking the badge', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('changes the popup text while open and selection changes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => ctrlClickSecondShape())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('changes the popup text while closed and selection changes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))

        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => ctrlClickSecondShape())
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, {x: 1, y: 1}) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });
  });

  describe('Adding and removing shapes', () => {
    let firstPlusButton;
    let secondPlusButton;
    let firstMinusButton;
    let secondMinusButton;

    beforeEach(() => {
      const plusButtons = shapeInboxSelectedList.all(by.css('.selected-shape .icon.fa-plus-circle'));
      const minusButtons = shapeInboxSavedList.all(by.css('.selected-shape .icon.fa-minus-circle'));

      firstPlusButton = plusButtons.get(0);
      secondPlusButton = plusButtons.get(1);

      firstMinusButton = minusButtons.get(0);
      secondMinusButton = minusButtons.get(1);
    });

    it('moves one shape from selected shapes to saved shapes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => secondPlusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #2'))
        .then(() => done());
    });

    it('moves two shapes from selected shapes to saved shapes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => secondPlusButton.click())
        .then(() => mediumSleep())
        .then(() => firstPlusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #2\nrectangle #1'))
        .then(() => done());
    });

    it('moves one shape from saved shapes to selected shapes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => secondPlusButton.click())
        .then(() => mediumSleep())
        .then(() => firstMinusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('moves two shapes from saved shapes to selected shapes', done => {
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => secondPlusButton.click())
        .then(() => mediumSleep())
        .then(() => firstPlusButton.click())
        .then(() => mediumSleep())
        .then(() => secondMinusButton.click())
        .then(() => mediumSleep())
        .then(() => firstMinusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('adds all the shapes with one click', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });

    it('removes all the shapes with one click', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
      const headerMinusButton = element(by.css('#popup-inbox-saved .shape-list-header .icon'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => mediumSleep())
        .then(() => headerMinusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });

    it('keeps the saved shapes over a framechange with the popup open', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => mediumSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });

    it('keeps the saved shapes over a framechange with the popup closed', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => {
          return browser.actions()
            .sendKeys(protractor.Key.CONTROL)
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .sendKeys(protractor.Key.NULL)
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('rectangle #1\nrectangle #2'))
        .then(() => done());
    });
  });

  describe('Meta Labeling', () => {
    beforeEach(() => {
      bootstrapHttp(sharedMocks.concat([
        assets.mocks.MetaLabeling.Shared.Task,
        assets.mocks.MetaLabeling.Shared.TaskConfiguration,
        assets.mocks.MetaLabeling.Shared.RequirementsXmlFile,
      ]));
    });

    it('does not show a badge if meta labeling is selected', done => {
      const metaLabelingButton = element(by.css('.tool-frame-shape'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => metaLabelingButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxBadge.getText())
        .then(shapeInboxCount => expect(shapeInboxCount).toEqual(''))
        .then(() => done());
    });

    it('opens a popup window with the text "No shapes selected" if meta labeling is selected', done => {
      const metaLabelingButton = element(by.css('.tool-frame-shape'));

      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => metaLabelingButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => shapeInboxSelectedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes selected'))
        .then(() => shapeInboxSavedList.getText())
        .then(shapeInboxText => expect(shapeInboxText).toEqual('No shapes saved'))
        .then(() => done());
    });
  });

  describe('Shape Reselection', () => {
    it('show reselection button for shapes added to inbox', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          expect(
            element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share'))
              .isPresent()
          )
            .toBeTruthy();
        })
        .then(() => done());
    });

    it('show reselection button for multiple shapes added to inbox', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft)
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).count())
        .then(elementCount => expect(elementCount).toEqual(2))
        .then(() => done());
    });

    it('reselect shape on another frame', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 2, y: 2})
            .click()
            .perform();
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => element(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'SimpleReselect')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.SimpleReselect);
        })
        .then(() => done());
    });

    it('switch shapes by reselection', done => {
      const headerPlusButton = element(by.css('#popup-inbox-selected .shape-list-header .icon'));
      const nextFrameButton = element(by.css('.next-frame-button'));

      initApplication(
        '/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling'
      )
        .then(() => shapeInboxButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, firstShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, secondShape.topLeft) // initial position
            .click()
            .perform();
        })
        .then(() => mediumSleep())
        .then(() => headerPlusButton.click())
        .then(() => shortSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 2, y: 2})
            .click()
            .perform();
        })
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).get(0).click())
        .then(() => mediumSleep())
        .then(() => element.all(by.css('#popup-inbox-saved .popup-inbox-list p .fa-share')).get(0).click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('ShapeInbox', 'ReselectDifferentShapes')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs()
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.ShapeInbox.ReselectDifferentShapes);
        })
        .then(() => done());
    });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});
