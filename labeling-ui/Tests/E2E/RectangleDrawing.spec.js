import mock from 'protractor-http-mock';
import ViewerDataExporter from '../Support/ViewerDataExporter';

const taskDataMock = require('../ProtractorMocks/Task/Data.json');
const frameLocationsMock = require('../ProtractorMocks/Task/FrameLocations.json');
const labeledThingsMock = require('../ProtractorMocks/Task/LabeledThingInFrame/TwoRectangles.json');
const movedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/MovedRectangle.json');
const resizedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedRectangle.json');
const resizedAndMovedRectangleMock = require('../ProtractorMocks/Task/LabeledThingInFrame/ResizedAndMovedRectangle.json');

const initialViewerData = require('../Fixtures/ViewerData/RectangleDrawing/initialState.json');
const movedRectangleViewerData = require('../Fixtures/ViewerData/RectangleDrawing/movedRectangle.json');
const resizedRectangleViewerData = require('../Fixtures/ViewerData/RectangleDrawing/resizedRectangle.json');
const compoundEditViewerData = require('../Fixtures/ViewerData/RectangleDrawing/compoundEdit.json');

const viewerDataExporter = new ViewerDataExporter(browser);

xdescribe('Rectangle drawing', () => {
  beforeEach(() => {
    mock([taskDataMock, frameLocationsMock, labeledThingsMock, movedRectangleMock, resizedRectangleMock, resizedAndMovedRectangleMock]);
  });

  it('should draw the background and initial shapes as provided by the backend', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    expect(mock.requestsMade()).toEqual([
      {
        url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
        method: 'GET',
      },
      {
        url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
        method: 'GET',
      },
      {
        url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
        method: 'GET',
      },
    ]);

    viewerDataExporter.exportData()
      .then((data) => {
        expect(data).toEqualViewerStage(initialViewerData);
        done();
      });
  });

  it('should correctly move a rectangle on canvas and save the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 60, y: 60}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 70, y: 70}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataExporter.exportData()
      .then((data) => {
        expect(data).toEqualViewerStage(movedRectangleViewerData);

        expect(mock.requestsMade()).toEqual([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              frameNumber: 1,
              shapes: [
                {
                  type: 'rectangle',
                  bottomRight: {y: 190, x: 140},
                  topLeft: {y: 60, x: 60},
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ]);

        done();
      });
  });

  it('should correctly resize a rectangle on canvas and save the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 40, y: 40}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataExporter.exportData()
      .then((data) => {
        expect(data).toEqualViewerStage(resizedRectangleViewerData);

        expect(mock.requestsMade()).toEqual([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              frameNumber: 1,
              shapes: [
                {
                  type: 'rectangle',
                  bottomRight: {y: 180, x: 130},
                  topLeft: {y: 40, x: 40},
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ]);

        done();
      });
  });

  it('should correctly apply a compound transformation a rectangle on canvas and update the changed coordinates', (done) => {
    browser.get('/labeling/task/0115bd97fa0c1d86f8d1f65ff4095ed8');

    const viewer = element(by.css('.layer-container'));

    // Resize
    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // initial position
      .mouseDown()
      .mouseMove(viewer, {x: 40, y: 40}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    // Explicitly wait for backend to sync since we don't have proper queueing, yet
    browser.waitForAngular();

    // Move
    browser.actions()
      .mouseMove(viewer, {x: 50, y: 50}) // move within the object position
      .mouseDown()
      .mouseMove(viewer, {x: 60, y: 60}) // drag
      .mouseUp()
      .mouseMove(viewer, {x: 0, y: 0}) // click somewhere outside to deselect element
      .click()
      .perform();

    viewerDataExporter.exportData()
      .then((data) => {
        expect(data).toEqualViewerStage(compoundEditViewerData);

        expect(mock.requestsMade()).toEqual([
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/frameLocations/source?limit=2&offset=0',
            method: 'GET',
          },
          {
            url: '/api/task/0115bd97fa0c1d86f8d1f65ff4095ed8/labeledThingInFrame/1',
            method: 'GET',
          },
          {
            data: {
              classes: [],
              id: '0115bd97fa0c1d86f8d1f65ff409f0b8',
              labeledThingId: '0115bd97fa0c1d86f8d1f65ff409faa6',
              rev: '14-547b5f8221abb7327b156d7c1591b14e',
              frameNumber: 1,
              shapes: [
                {
                  type: 'rectangle',
                  bottomRight: {y: 180, x: 130},
                  topLeft: {y: 40, x: 40},
                },
              ],
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
          {
            data: {
              'id': '0115bd97fa0c1d86f8d1f65ff409f0b8',
              'rev': '15-c3bc44889b793d878c57d5edb81e381f',
              'frameNumber': 1,
              'classes': [],
              'shapes': [
                {
                  'type': 'rectangle',
                  'topLeft': {
                    'x': 50,
                    'y': 50,
                  },
                  'bottomRight': {
                    'x': 140,
                    'y': 190,
                  },
                },
              ],
              'labeledThingId': '0115bd97fa0c1d86f8d1f65ff409faa6',
            },
            url: '/api/labeledThingInFrame/0115bd97fa0c1d86f8d1f65ff409f0b8',
            method: 'PUT',
          },
        ]);

        done();
      });
  });

  afterEach(() => {
    mock.teardown();
  });
});
