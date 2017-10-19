import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  expectAllModalsToBeClosed,
  mediumSleep,
  shortSleep,
  longSleep,
  sendKeys,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';
import LabelSelectorHelper from '../Support/Protractor/LabelSelectorHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Group Creation', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let groupButton;
  let labelSelector;
  let labelSelectorHelper;
  let nextFrameButton;
  let previousFrameButton;

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
      assets.mocks.GroupCreation.Shared.Task,
      assets.mocks.GroupCreation.Shared.TaskConfiguration,
      assets.mocks.GroupCreation.Shared.TaskConfigurationFile,
    ];

    viewer = element(by.css('.layer-container'));
    groupButton = element(by.css('button.tool-group.tool-0'));
    labelSelector = element(by.css('label-selector'));
    labelSelectorHelper = new LabelSelectorHelper(labelSelector);

    nextFrameButton = element(by.css('.next-frame-button'));
    previousFrameButton = element(by.css('.previous-frame-button'));
  });


  it('does not create a group', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 400, y: 400}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(() => done());
  });

  it('creates a group around 1 rectangle', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => done());
  });

  it('creates a group around 2 rectangles', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoRectangles);
      })
      .then(() => done());
  });

  it('creates a group around 2 point shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => shortSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoPoints')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoPoints);
      })
      .then(() => done());
  });

  it('creates two groups with four different shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => shortSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateTwoGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateTwoGroupsWithFourShapes);
      })
      .then(() => done());
  });

  it('creates three groups with four different shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => shortSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 260, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateThreeGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateThreeGroupsWithFourShapes);
      })
      .then(() => done());
  });

  it('creates a group around multiselected shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
    ]);

    const firstShape = {
      topLeft: {x: 100, y: 100},
      bottomRight: {x: 200, y: 200},
    };

    const secondShape = {
      topLeft: {x: 300, y: 100},
      bottomRight: {x: 400, y: 200},
    };

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => sendKeys(protractor.Key.CONTROL))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => sendKeys(protractor.Key.NULL))
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateGroupMultiselectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateGroupMultiselectedShapes);
      })
      .then(() => done());
  });

  it('creates and deletes a group around multiselected shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
    ]);

    const firstShape = {
      topLeft: {x: 100, y: 100},
      bottomRight: {x: 200, y: 200},
    };

    const secondShape = {
      topLeft: {x: 300, y: 100},
      bottomRight: {x: 400, y: 200},
    };

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => sendKeys(protractor.Key.CONTROL))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => sendKeys(protractor.Key.NULL))
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => sendKeys(protractor.Key.DELETE))
      .then(() => mediumSleep())
      .then(() => element(by.cssContainingText('option', 'Delete the object itself')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateAndDeleteGroupMultiselectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateAndDeleteGroupMultiselectedShapes);
      })
      .then(() => done());
  });

  it('shows a selection if there is more than one group type defined', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
    ]));
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupFrontLights).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => done());
  });

  it('shows the selection again if user does not select a group type', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
    ]));
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
      .then(() => element(by.cssContainingText('option', 'Please make a selection')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => longSleep())
      .then(() => element(by.cssContainingText('option', 'Back lights')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupBackLights).toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => done());
  });

  it('does not create a group if user clicks Abort when shown the group type selection modal', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
    ]));
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const cancelButton = element(by.css('.modal-button-cancel'));
        return cancelButton.click();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(() => done());
  });

  it('does not create a group by select a measurement rectangle and click the group button', done => {
    bootstrapHttp(sharedMocks);

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => shortSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
      })
      .then(
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangle);
      })
      .then(() => done());
  });

  it('does not create a group around measurement rectangle', done => {
    bootstrapHttp(sharedMocks);

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => shortSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .mouseMove(viewer, {x: 450, y: 450})
          .mouseDown()
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
      })
      .then(
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangle);
      })
      .then(() => done());
  });

  it('does remove ltgifs outside of lt frame range', done => {
    bootstrapHttp(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
    ]));

    const rectangleToolButton = element(by.css('button.tool-button.tool-rectangle'));
    const nextFrameButton = element(by.css('.next-frame-button > button'));
    const previousFrameButton = element(by.css('.previous-frame-button > button'));
    const closeBracketButton = element(by.css('.close-bracket-button > button'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => rectangleToolButton.click())
      .then(() => shortSleep())
      .then(() => {
        // Create Rectangle
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => nextFrameButton.click())
      .then(() => mediumSleep())
      .then(() => {
        // Move Rectangle
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      // Create group
      .then(() => groupButton.click())
      .then(() => mediumSleep())
      .then(() => {
        // Acknowledge modal
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => mediumSleep())
      // Label Group on frameIndex 1
      .then(() => labelSelectorHelper.getTitleClickTargetFinderByTitleText(
        'Position of the extension sign'
      ).click())
      .then(() => mediumSleep())
      .then(() => labelSelectorHelper.getEntryClickTargetFinderByTitleTextAndEntryText(
        'Position of the extension sign',
        'Above'
      ).click())
      .then(() => mediumSleep())
      .then(() => previousFrameButton.click())
      .then(() => mediumSleep())
      .then(() => {
        // Select rectangle again
        return browser.actions()
          .mouseMove(viewer, {x: 200, y: 200})
          .mouseDown()
          .mouseUp()
          .perform();
      })
      .then(() => mediumSleep())
      .then(() => closeBracketButton.click())
      .then(() => mediumSleep())
      .then(() => expect(assets.mocks.GroupCreation.GroupAttributes.StoredLabeledThingGroupInFrame).not.toExistInPouchDb())
      .then(() => done());
  });

  describe('Group deletion', () => {
    it('removes all group references on LabeledThings when deleting a group (TTANNO-2165)', done => {
      bootstrapHttp(sharedMocks);
      bootstrapPouch([
        assets.documents.GroupCreation.GroupOnTwoFrames,
      ]);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 190, y: 90})
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => sendKeys(protractor.Key.DELETE))
        .then(() => shortSleep())
        .then(() => element(by.cssContainingText('option', 'Delete the object itself')).click())
        .then(() => {
          const confirmButton = element(by.css('.modal-button-confirm'));
          return confirmButton.click();
        })
        .then(() => shortSleep())
        .then(() => {
          expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
          expect(assets.documents.GroupCreation.GroupDeletion.StoreLabeledThing1).toExistInPouchDb();
          expect(assets.documents.GroupCreation.GroupDeletion.StoreLabeledThing2).toExistInPouchDb();
        })
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'DeleteGroupInTwoFramesFrame2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.DeleteGroupInTwoFramesFrame2);
        })
        .then(() => previousFrameButton.click())
        .then(() => mediumSleep())
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'DeleteGroupInTwoFramesFrame1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.DeleteGroupInTwoFramesFrame1);
        })
        .then(() => done());
    });
  });

  describe('Group Selection', () => {
    it('keeps the selection on frame change', done => {
      bootstrapHttp(sharedMocks);
      bootstrapPouch([
        assets.documents.GroupCreation.GroupOnTwoFrames,
      ]);
      initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
        .then(() => nextFrameButton.click())
        .then(() => mediumSleep())
        .then(() => {
          return browser.actions()
            .mouseMove(viewer, {x: 190, y: 90})
            .click()
            .perform();
        })
        .then(() => shortSleep())
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual('Sign with extension'))
        .then(() => expect(labelSelectorHelper.getTitleTexts()).toEqual(['Position of the extension sign']))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'GroupSelectionStaysOnFrameChangeFrame2')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.GroupSelectionStaysOnFrameChangeFrame2);
        })
        .then(() => previousFrameButton.click())
        .then(() => mediumSleep())
        .then(() => labelSelectorHelper.getLabelSelectorTitleText())
        .then(titleTexts => expect(titleTexts).toEqual('Sign with extension'))
        .then(() => expect(labelSelectorHelper.getTitleTexts()).toEqual(['Position of the extension sign']))
        .then(
          // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'GroupSelectionStaysOnFrameChangeFrame1')
          () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
        )
        .then(drawingStack => {
          expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.GroupSelectionStaysOnFrameChangeFrame1);
        })
        .then(() => done());
    });
  });

  afterEach(() => {
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
    expectAllModalsToBeClosed();
  });
});
