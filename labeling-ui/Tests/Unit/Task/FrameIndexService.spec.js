import {module, inject} from 'angular-mocks';

import FrameIndexService from 'Application/Task/Services/FrameIndexService';

describe('FrameIndexService', () => {
  let service = null;

  beforeEach(() => {
    inject($injector => {
      service = $injector.instantiate(FrameIndexService);
    });
  });

  it('should be instantiable', () => {
    expect(service instanceof FrameIndexService).toBe(true);
  });

  describe('without Task', () => {
    using([
      ['getFrameNumber'],
      ['getFrameIndex'],
      ['getNearestFrameIndex'],
      ['getFrameNumberLimits'],
      ['getFrameIndexLimits'],
    ], methodName => {
      it('should throw error upon invocation', () => {
        expect(() => service[methodName]()).toThrow();
      });
    });
  });

  describe('with Task', () => {
    let task;

    beforeEach(() => {
      task = {
        frameNumberMapping: [
          1001,
          1023,
          1045,
          1067,
          1089,
        ],
      };

      service.setTask(task);
    });

    using([
      [0, 1001],
      [1, 1023],
      [2, 1045],
      [3, 1067],
      [4, 1089],
    ], (frameIndex, frameNumber) => {
      it('should map from frameIndex to frameNumber', () => {
        expect(service.getFrameNumber(frameIndex)).toBe(frameNumber);
      });

      it('should map from frameNumber to frameIndex', () => {
        expect(service.getFrameIndex(frameNumber)).toBe(frameIndex);
      });

      it('should locate the nearest frameIndex below the given one', () => {
        expect(service.getNearestFrameIndex(frameNumber + 10)).toBe(frameIndex);
      });

      it('should locate the nearest frameIndex above the given one', () => {
        expect(service.getNearestFrameIndex(frameNumber - 10)).toBe(frameIndex);
      });
    });

    it('should provide correct frameNumber limits', () => {
      expect(service.getFrameNumberLimits()).toEqual({
        lowerLimit: 1001,
        upperLimit: 1089,
      });
    });

    it('should provide correct frameIndex limits', () => {
      expect(service.getFrameIndexLimits()).toEqual({
        lowerLimit: 0,
        upperLimit: 4,
      });
    });

    it('should return undefined for out of bounds frameIndex values', () => {
      expect(service.getFrameNumber(42)).toBeUndefined();
    });

    it('should return undefined for out of bounds frameNumber values', () => {
      expect(service.getFrameIndex(42)).toBeUndefined();
    });
  });
});
