import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {initApplication, bootstrapHttp, bootstrapPouch} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Group Creation', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let groupButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`, `${__dirname}/../PouchDbDocuments`);
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
  });

  afterEach(() => {
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
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
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
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
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates a group around 2 rectangles', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
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
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoRectangles);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates a group around 2 point shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
    ]);
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoPoints')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoPoints);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates two groups with four different shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateTwoGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateTwoGroupsWithFourShapes);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates three groups with four different shapes', done => {
    bootstrapHttp(sharedMocks);
    bootstrapPouch([
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.documents.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 260, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateThreeGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateThreeGroupsWithFourShapes);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
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
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(() => groupButton.click())
      .then(() => browser.sleep(300))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateGroupMultiselectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateGroupMultiselectedShapes);
      })
      .then(() => {
        done();
      });
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
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.CONTROL)
          .mouseMove(viewer, firstShape.topLeft)
          .click()
          .mouseMove(viewer, secondShape.topLeft)
          .click()
          .sendKeys(protractor.Key.NULL)
          .perform();
      })
      .then(() => groupButton.click())
      .then(() => browser.sleep(300))
      .then(() => {
        return browser.actions()
          .sendKeys(protractor.Key.DELETE)
          .perform();
      })
      .then(() => browser.sleep(1000))
      .then(() => element(by.cssContainingText('option', 'Delete the object itself')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateAndDeleteGroupMultiselectedShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateAndDeleteGroupMultiselectedShapes);
      })
      .then(() => {
        done();
      });
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
      .then(() => browser.sleep(250))
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupFrontLights).toExistInPouchDb();
        done();
      });
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
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => element(by.cssContainingText('option', 'Please make a selection')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(1000))
      .then(() => element(by.cssContainingText('option', 'Back lights')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupBackLights).toExistInPouchDb();
        done();
      });
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
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const cancelButton = element(by.css('.modal-button-cancel'));
        return cancelButton.click();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
  });

  it('does not create a group by select a measurement rectangle and click the group button', done => {
    bootstrapHttp(sharedMocks);

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 100, y: 100})
          .mouseDown()
          .mouseMove(viewer, {x: 400, y: 400})
          .mouseUp()
          .perform();
      })
      .then(() => groupButton.click())
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangle);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
  });

  it('does not create a group around measurement rectangle', done => {
    bootstrapHttp(sharedMocks);

    const toolButton = element(by.css('button.tool-button.tool-additional-tools.tool-0'));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => toolButton.click())
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
      .then(() => groupButton.click())
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 500, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(250))
      // .then(() => dumpAllRequestsMade(bootstrapHttp))
      .then(
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.MeasurementRectangle.DrawOneMeasurementRectangle);
      })
      .then(() => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
  });
});
