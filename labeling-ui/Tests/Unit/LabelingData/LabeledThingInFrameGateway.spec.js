import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabeledThingInFrameGateway from 'Application/LabelingData/Gateways/LabeledThingInFrameGateway';

describe('LabeledThingInFrameGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(LabeledThingInFrameGateway);
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(gateway instanceof LabeledThingInFrameGateway).toEqual(true);
  });

  it('should receive the list of labeled thing in frame objects', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const expectedResult = [
      {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]},
      {id: 'cde', rev: 'def', shapes: [{type: 'circle'}]},
    ];

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, {result: expectedResult});

    gateway.listLabeledThingInFrame(task, frameNumber)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  it('should get a labeled thing in frame', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const labeledThingInFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedResult = {result: labeledThingInFrame};

    $httpBackend
      .expect('GET', expectedUrl)
      .respond(200, expectedResult);

    gateway.getLabeledThingInFrame(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(labeledThingInFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should create a labeled thing in frame', done => {
    const task = {id: 'someTaskId234'};
    const frameNumber = 2;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;
    const labeledThingInFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedResult = {result: labeledThingInFrame};

    $httpBackend
      .expect('POST', expectedUrl)
      .respond(200, expectedResult);

    gateway.createLabeledThingInFrame(task, frameNumber, labeledThingInFrame)
      .then(result => {
        expect(result).toEqual(labeledThingInFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should update a labeled thing in frame', done => {
    const labeledThinIngFrame = {id: 'abc', rev: 'bcd', shapes: [{type: 'rectangle'}]};
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThinIngFrame.id}`;
    const expectedResult = {result: labeledThinIngFrame};

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond(200, expectedResult);

    gateway.updateLabeledThingInFrame(labeledThinIngFrame)
      .then(result => {
        expect(result).toEqual(labeledThinIngFrame);
        done();
      });

    $httpBackend.flush();
  });

  it('should delete a labeled thing in frame', done => {
    const labeledThingInFrameId = '2';
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;
    const expectedResult = true;

    $httpBackend
      .expect('DELETE', expectedUrl)
      .respond(200, expectedResult);

    gateway.deleteLabeledThingInFrame(labeledThingInFrameId)
      .then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });

    $httpBackend.flush();
  });

  using([
    [{id: 'task1'}],
    [{id: 'task2'}],
    [{id: 'task3'}],
    [{id: 'task4'}],
  ], (task) => {
    const frameNumber = 1;
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;

    it('should request the task id as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      gateway.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    [1],
    [2],
    [3],
    [4],
  ], (frameNumber) => {
    const task = {id: 'abc'};
    const expectedUrl = `/backend/api/task/${task.id}/labeledThingInFrame/${frameNumber}`;

    it('should request the frame number as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      gateway.listLabeledThingInFrame(task, frameNumber)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    ['1'],
    ['2'],
    ['3'],
    ['4'],
  ], (labeledThingInFrameId) => {
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrameId}`;

    it('should request the labeled thing in frame id as specified', done => {
      $httpBackend
        .expect('GET', expectedUrl)
        .respond(200, {result: []});

      gateway.getLabeledThingInFrame(labeledThingInFrameId)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    [['a'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['a', 'b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a', 'b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a', 'b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['a', 'b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a', 'b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [[], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
  ], (classes, labeledThingInFrame, expectedLabeldThingInFrame) => {
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;

    it('should add classes to a labeled thing in frame and persist them', done => {
      $httpBackend
        .expect('PUT', expectedUrl, expectedLabeldThingInFrame)
        .respond(200, {result: expectedLabeldThingInFrame});

      gateway.addClassesToLabeledThingInFrame(labeledThingInFrame, classes)
        .then(done);

      $httpBackend.flush();
    });
  });

  using([
    [['a'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['a', 'b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a', 'b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
    [['a', 'a', 'b', 'c'], {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': [],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }, {
      'id': '1',
      'rev': '1',
      'frameNumber': 1,
      'classes': ['a', 'b', 'c'],
      'shapes': [{'type': 'rectangle', 'id': 5, 'topLeft': {'x': 75, 'y': 133}, 'bottomRight': {'x': 115, 'y': 195}}],
      'labeledThingId': '7bf2e2dbdb4c3d453225c5c351035417',
    }],
  ], (classes, labeledThingInFrame, expectedLabeldThingInFrame) => {
    const expectedUrl = `/backend/api/labeledThingInFrame/${labeledThingInFrame.id}`;

    it('should set classes to a labeled thing in frame and persist them', done => {
      $httpBackend
        .expect('PUT', expectedUrl, expectedLabeldThingInFrame)
        .respond(200, {result: expectedLabeldThingInFrame});

      gateway.setClassesToLabeledThingInFrame(labeledThingInFrame, classes)
        .then(done);

      $httpBackend.flush();
    });
  });
});
