import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  bootstrapHttp,
  bootstrapPouch,
  mediumSleep,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polygon vertex', () => {
  let assets;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
      `${__dirname}/../PouchDbDocuments`
    );
    bootstrapHttp([
      assets.mocks.Shared.TaskDb,
      assets.mocks.Shared.UserProfile,
      assets.mocks.Shared.UserPermissions,
      assets.mocks.Shared.UserOrganisations,
      assets.mocks.Shared.Video,
      assets.mocks.PolygonDrawing.Shared.Task,
      assets.mocks.PolygonDrawing.Shared.TaskConfiguration,
      assets.mocks.PolygonDrawing.Shared.TaskConfigurationFile,
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
    ]);

    viewer = element(by.css('.layer-container'));
  });

  function selectFirstPolygon() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 200}) // initial position
      .click()
      .perform();
  }

  function selectSecondPolygon() {
    return browser.actions()
      .mouseMove(viewer, {x: 600, y: 200}) // initial position
      .click()
      .perform();
  }

  function pressDownAltKey() {
    return browser.actions()
      .keyDown(protractor.Key.ALT)
      .perform();
  }

  function releaseAltKey() {
    return browser.actions()
      .keyUp(protractor.Key.ALT)
      .sendKeys(protractor.Key.NULL)
      .perform();
  }

  function clickAtPositionOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 300, y: 50}) // initial position
      .click()
      .perform();
  }

  function mouseDownAtPositionOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 300, y: 50}) // initial position
      .mouseDown()
      .perform();
  }

  function mouseUpAtPositionOne() {
    return browser.actions()
      .mouseMove(viewer, {x: 300, y: 50}) // initial position
      .mouseUp()
      .perform();
  }

  function clickAtPositionTwo() {
    return browser.actions()
      .mouseMove(viewer, {x: 900, y: 590}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionThree() {
    return browser.actions()
      .mouseMove(viewer, {x: 10, y: 10}) // initial position
      .click()
      .perform();
  }

  function clickAtPositionFour() {
    return browser.actions()
      .mouseMove(viewer, {x: 10, y: 550}) // initial position
      .click()
      .perform();
  }

  function clickAtBottomVertexOfFirstPolygon() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 300}) // initial position
      .click()
      .perform();
  }

  function clickAtTopVertexOfFirstPolygon() {
    return browser.actions()
      .mouseMove(viewer, {x: 200, y: 100}) // initial position
      .click()
      .perform();
  }

  it('should add a new vertex to a polygon', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVertexToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVertexToPolygon);
        done();
      });
  });

  it('should not be able to remove any of the 3 base vertices of a polygon (TTANNO-2158)', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtTopVertexOfFirstPolygon())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'MinHandlesThree'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.MinHandlesThree);
        done();
      });
  });

  it('should add a new vertex to a polygon on mouseup not mousedown (TTANNO-2137)', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => mouseDownAtPositionOne())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'MouseDownOnNewVertexOfPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.MouseDownOnNewVertexOfPolygon);
      })
      .then(() => mouseUpAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVertexToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVertexToPolygon);
        done();
      });
  });

  it('should add and remove new vertex to/from a polygon on mouseup not mousedown (TTANNO-2137)', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => mouseDownAtPositionOne())
      .then(() => mediumSleep())
      .then(() => mouseUpAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => mouseDownAtPositionOne())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVertexToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVertexToPolygon);
      })
      .then(() => mouseUpAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'MouseDownOnNewVertexOfPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.MouseDownOnNewVertexOfPolygon);
        done();
      });
  });

  it('should add two new vertices to a polygon', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => mediumSleep())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddTwoNewVerticesToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddTwoNewVerticesToPolygon);
        done();
      });
  });

  it('should add three new vertices to a polygon', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => mediumSleep())
      .then(() => clickAtPositionTwo())
      .then(() => mediumSleep())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddThreeNewVerticesToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddThreeNewVerticesToPolygon);
        done();
      });
  });

  it('should add three new vertices to a polygon and delete one', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => mediumSleep())
      .then(() => clickAtPositionTwo())
      .then(() => mediumSleep())
      .then(() => clickAtPositionThree())
      .then(() => mediumSleep())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddThreeNewVerticesToPolygonAndDeleteOne'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddThreeNewVerticesToPolygonAndDeleteOne);
        done();
      });
  });

  it('should add three new vertices to a polygon and delete two', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => mediumSleep())
      .then(() => clickAtPositionTwo())
      .then(() => mediumSleep())
      .then(() => clickAtPositionThree())
      .then(() => mediumSleep())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => mediumSleep())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddThreeNewVerticesToPolygonAndDeleteTwo'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddThreeNewVerticesToPolygonAndDeleteTwo);
        done();
      });
  });

  it('should add new vertices to two polygons', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectSecondPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVerticesToTwoPolygons1'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVerticesToTwoPolygons1);
        done();
      });
  });

  it('should add multiple new vertices to two polygons', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectSecondPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectSecondPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVerticesToTwoPolygons2'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVerticesToTwoPolygons2);
        done();
      });
  });

  it('should add multiple new vertices to two polygons and remove vertex', done => {
    bootstrapPouch([
      assets.documents.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
    ]);

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectSecondPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectSecondPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(() => selectFirstPolygon())
      .then(() => mediumSleep())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => mediumSleep())
      .then(() => clickAtTopVertexOfFirstPolygon())
      .then(() => releaseAltKey())
      .then(() => mediumSleep())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVerticesToTwoPolygons3'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVerticesToTwoPolygons3);
        done();
      });
  });

  afterEach(() => {
    expectAllModalsToBeClosed();
    bootstrapHttp.teardown();
    bootstrapPouch.teardown();
  });
});


