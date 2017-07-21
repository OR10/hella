import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {getMockRequestsMade, initApplication, mock} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Group Creation', () => {
  let assets;
  let sharedMocks;
  let viewer;

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
  });

  it('does not create a group', done => {
    mock(sharedMocks.concat([
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0,
      assets.mocks.RectangleDrawing.DrawOneRectangle.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup,
      assets.mocks.GroupCreation.NewGroup.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).not.toContainNamedParamsRequest(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing);
        expect(requests).not.toContainNamedParamsRequest(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.NewGroup.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingPoint);
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
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
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint);
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
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
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 660, y: 500}) // drag
          .mouseUp()
          .perform();
      })
      .then(() => {
        return browser.actions()
          .mouseMove(viewer, {x: 263, y: 50}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 670, y: 290}) // drag
          .mouseUp()
          .perform();
      })
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
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame1.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.GroupCreation.MultipleGroups.LabeledThingInFrame2.StoreLabeledThingPoint);
        expect(requests).toContainNamedParamsRequestOnce(assets.mocks.GroupCreation.NewGroup.StoreLabeledThingGroup);
        done();
      });
  });
});
