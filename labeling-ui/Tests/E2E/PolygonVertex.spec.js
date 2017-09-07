import CanvasInstructionLogManager from '../Support/CanvasInstructionLogManager';
import {
  expectAllModalsToBeClosed,
  initApplication,
  mock,
} from '../Support/Protractor/Helpers';
import AssetHelper from '../Support/Protractor/AssetHelper';

const canvasInstructionLogManager = new CanvasInstructionLogManager(browser);

describe('Polygon vertex', () => {
  let assets;
  let sharedMocks;
  let viewer;

  beforeEach(() => {
    assets = new AssetHelper(
      `${__dirname}/../Fixtures`,
      `${__dirname}/../ProtractorMocks`,
    );
    sharedMocks = [
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
    ];

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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(
        // () => canvasInstructionLogManager.getAnnotationCanvasLogs('PolygonVertex', 'AddNewVertexToPolygon'),
        () => canvasInstructionLogManager.getAnnotationCanvasLogs(),
      )
      .then(drawingStack => {
        expect(drawingStack).toEqualRenderedDrawingStack(assets.fixtures.Canvas.PolygonVertex.AddNewVertexToPolygon);
        done();
      });
  });

  it('should add two new vertices to a polygon', done => {
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawOnePolygon.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => clickAtPositionTwo())
      .then(() => clickAtPositionThree())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
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
    mock(sharedMocks.concat([
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0,
      assets.mocks.PolygonDrawing.DrawTwoPolygons.LabeledThingInFrame.frameIndex0to4,
    ]));

    initApplication('/labeling/organisation/ORGANISATION-ID-1/projects/PROJECTID-PROJECTID/tasks/TASKID-TASKID/labeling')
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionThree())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionTwo())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionFour())
      .then(() => releaseAltKey())
      .then(() => selectSecondPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtPositionOne())
      .then(() => releaseAltKey())
      .then(() => selectFirstPolygon())
      .then(() => pressDownAltKey())
      .then(() => clickAtBottomVertexOfFirstPolygon())
      .then(() => clickAtTopVertexOfFirstPolygon())
      .then(() => releaseAltKey())
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
    mock.teardown();
  });
});


