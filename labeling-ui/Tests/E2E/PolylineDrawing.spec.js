import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectModalToBePresent,
  getMockRequestsMade,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polyline drawing', () => {
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
      assets.mocks.PolylineDrawing.Shared.Task,
      assets.mocks.PolylineDrawing.Shared.TaskConfiguration,
      assets.mocks.PolylineDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  it('should load and draw one polyline shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawOnePolyline.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'LoadAndDrawOnePolyline'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.LoadAndDrawOnePolyline);
        done();
      });
  });

  it('should load and draw two polyline shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'LoadAndDrawTwoPolylines')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.LoadAndDrawTwoPolylines);
        done();
      });
  });

  it('should select a polyline shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectOnePolyline);
        done();
      });
  });

  it('should select and deselect a polyline shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 1, y: 1})
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectAndDeselectPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectAndDeselectPolyline);
        done();
      });
  });

  it('should select one and then select an other polyline shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'SelectAnotherPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.SelectAnotherPolyline);
        done();
      });
  });

  it('should correctly move a polyline shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolylineDrawing.MoveOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 250, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // click somewhere outside to deselect element
          .click()
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'MoveOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.MoveOnePolyline);
      })
      .then(() => browser.sleep(500))
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PolylineDrawing.MoveOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should correctly resize a polyline shape and save the changed coordinates', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.DrawTwoPolylines.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1,
      assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1IntermediateStep,
      assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.getLabeledThingsInFrame0to4,
      assets.mocks.PolylineDrawing.Shared.StoreLabeledThing,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 200, y: 200}) // initial position
        .click()
        .mouseMove(viewer, {x: 200, y: 300}) // bottom drag handle
        .mouseDown()
        .mouseMove(viewer, {x: 200, y: 400}) // drag
        .mouseUp()
        .mouseMove(viewer, {x: 100, y: 200}) // left drag handle
        .mouseDown()
        .mouseMove(viewer, {x: 50, y: 200}) // drag
        .mouseUp()
        .perform(),
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'ResizeOnePolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.ResizeOnePolyline);
        return browser.sleep(1000);
      })
      // .then(() => dumpAllRequestsMade(mock))
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainRequest(assets.mocks.PolylineDrawing.ResizeOnePolyline.LabeledThingInFrame.putLabeledThingInFrame1);
        done();
      });
  });

  it('should keep the polyline shape selected over a frame change', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.OnePolylineTwoFrames.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolylineDrawing.OnePolylineTwoFrames.LabeledThingInFrame.frameIndex0to4,
      assets.mocks.PolylineDrawing.OnePolylineTwoFrames.LabeledThingInFrame.getLabeledThingInFrame0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .perform();
      })
      .then(() => browser.sleep(500))
      .then(() => {
        const nextFrameButton = element(by.css('.next-frame-button'));
        nextFrameButton.click();
      })
      .then(() => browser.sleep(500))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'KeepSelectionOverFrameChange')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.KeepSelectionOverFrameChange);
        done();
      });
  });

  it('should draw a new polyline shape', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 100}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 600, y: 100}) // initial position
        .mouseUp()
        .mouseMove(viewer, {x: 600, y: 600}) // initial position
        .click()
        .mouseMove(viewer, {x: 200, y: 600}) // initial position
        .click()
        .mouseMove(viewer, {x: 200, y: 400}) // initial position
        .click()
        .mouseMove(viewer, {x: 500, y: 400}) // initial position
        .click()
        .mouseMove(viewer, {x: 500, y: 200}) // initial position
        .click()
        .mouseMove(viewer, {x: 100, y: 200}) // initial position
        .click()
        .mouseMove(viewer, {x: 1, y: 1}) // initial position
        .click(protractor.Button.RIGHT)
        .perform(),
      )
      .then(() => browser.sleep(200))
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolyline')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolyline);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw a new Polyline shape with intermediary mouse movements', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 100}) // initial position
        .mouseDown()
        .mouseMove(viewer, {x: 600, y: 100}) // initial position
        .mouseUp()
        .mouseMove(viewer, {x: 400, y: 400}) // initial position
        .perform(),
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary1);
      })
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 600, y: 600}) // initial position
        .click()
        .mouseMove(viewer, {x: 200, y: 600}) // initial position
        .click()
        .mouseMove(viewer, {x: 400, y: 400}) // initial position
        .perform(),
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary2);
      })
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 200, y: 400}) // initial position
        .click()
        .mouseMove(viewer, {x: 500, y: 400}) // initial position
        .click()
        .mouseMove(viewer, {x: 500, y: 200}) // initial position
        .click()
        .mouseMove(viewer, {x: 400, y: 400}) // initial position
        .perform(),
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary3);
      })
      .then(() => browser.actions()
        .mouseMove(viewer, {x: 100, y: 200}) // initial position
        .click()
        .mouseMove(viewer, {x: 1, y: 1}) // initial position
        .click(protractor.Button.RIGHT)
        .perform(),
      )
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewPolylineIntermediary4')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewPolylineIntermediary4);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame1);
        done();
      });
  });

  it('should draw multiple new Polyline shapes', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame2,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame3,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame4,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing,
    ]));
    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 150, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline1')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline1);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 300, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 300, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 350, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline2')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline2);
      })
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 600, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 600, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 650, y: 150}) // initial position
          .click()
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'NewMultiplePolyline3')
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.NewMultiplePolyline3);
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame2);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame3);
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame4);
        done();
      });
  });
  afterEach(() => {
    mock.teardown();
  });
});

describe('Polyline handle/point limiting', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(`${__dirname}/../Fixtures`, `${__dirname}/../ProtractorMocks`);
    sharedMocks = [
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PolylineDrawing.Shared.Task,
      assets.mocks.PolylineDrawing.Shared.TaskConfiguration,
      assets.mocks.PolylineDrawing.Shared.TaskConfigurationFile,
      assets.mocks.Shared.GetTimer,
      assets.mocks.Shared.PutTimer,
      assets.mocks.Shared.LabeledThingIncompleteCount,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0,
      assets.mocks.Shared.FrameLocations.SourceJpg.frameIndex0to4,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0,
      assets.mocks.Shared.FrameLocations.Thumbnail.frameIndex0to4,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to3,
      assets.mocks.Shared.Thumbnails.polygonLabeledThingsInFrame0to4,
      assets.mocks.Shared.EmptyLabeledThingGroupInFrame,
    ];

    viewer = element(by.css('.layer-container'));
  });

  xit('should add too few handles', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click(protractor.Button.RIGHT)
          .perform();
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'TooFewHandles'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.TooFewHandles);
        // @TODO This check does not seem to work. Validate and fix!
        expectModalToBePresent();
        done();
      });
  });
  xit('should add too many handles', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0,
      assets.mocks.PolylineDrawing.Shared.LabeledThingInFrame.Empty.frameIndex0to4,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame5,
      assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThing,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => {
        browser.actions()
          .mouseMove(viewer, {x: 100, y: 100}) // initial position
          .mouseDown()
          .mouseMove(viewer, {x: 100, y: 200}) // initial position
          .mouseUp()
          .mouseMove(viewer, {x: 100, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 100, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 600}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 500}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 400}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 200, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 300, y: 200}) // initial position
          .click()
          .mouseMove(viewer, {x: 300, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 300}) // initial position
          .click()
          .mouseMove(viewer, {x: 700, y: 100}) // initial position
          .click()
          .mouseMove(viewer, {x: 400, y: 100}) // initial position
          .click()
          .mouseMove(viewer, {x: 1, y: 1}) // initial position
          .click()
          .perform();
      })
      .then(() => getMockRequestsMade(mock))
      .then(requests => {
        expect(requests).toContainNamedParamsRequest(assets.mocks.PolylineDrawing.NewPolyline.StoreLabeledThingInFrame5);
      })
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolylineDrawing', 'TooManyHandles'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolylineDrawing.TooManyHandles);
        expectModalToBePresent();
        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
