import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Group Creation', () => {
  let assets;
  let sharedMocks;
  let viewer;
  let groupButton;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
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

  it('does not create a group', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
  });

  it('creates a group around 1 rectangle', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates a group around 2 rectangles', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawTwoRectangles.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoRectangles')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoRectangles);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates a group around 2 point shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0,
      assets.mocks.PointDrawing.DrawTwoPoints.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingPoint,
    ]));
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
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithTwoPoints')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithTwoPoints);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates two groups with four different shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0to4,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));

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
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateTwoGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateTwoGroupsWithFourShapes);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates three groups with four different shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0to4,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));

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
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(200))
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 260, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateThreeGroupsWithFourShapes')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateThreeGroupsWithFourShapes);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).toExistInPouchDb();
        done();
      });
  });

  it('creates a group around multiselected shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0,
      assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));

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
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupFrontLights,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      .then(() => browser.sleep(200))
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const confirmButton = element(by.css('.modal-button-confirm'));
        return confirmButton.click();
      })
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupFrontLights).toExistInPouchDb();
        done();
      });
  });

  it('shows the selection again if user does not select a group type', done => {
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupBackLights,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      .then(() => browser.sleep(200))
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
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateOneGroupWithOneRectangle')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateOneGroupWithOneRectangle);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupBackLights).toExistInPouchDb();
        done();
      });
  });

  it('does not create a group if user clicks Abort when shown the group type selection modal', done => {
    mock(sharedMocks.concat([
      assets.mocks.GroupCreation.Shared.TaskConfigurationFileMultipleGroups,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroupFrontLights,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
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
      .then(() => browser.sleep(200))
      .then(() => element(by.cssContainingText('option', 'Front lights')).click())
      .then(() => {
        const cancelButton = element(by.css('.modal-button-cancel'));
        return cancelButton.click();
      })
      .then(() => browser.sleep(200))
      // .then(() => dumpAllRequestsMade(mock))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('GroupCreation', 'CreateNoGroup')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.GroupCreation.CreateNoGroup);
      })
      .then(requests => {
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing).not.toExistInPouchDb();
        expect(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup).not.toExistInPouchDb();
        done();
      });
  });
});
