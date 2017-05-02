import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearCuboidInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearCuboidInterpolationEasing';

fdescribe('LinearCuboidInterpolationEasing Test Suite', () => {
  /**
   * @type {LinearCuboidInterpolationEasing}
   */
  let easing;

  beforeEach(() => {
    easing = new LinearCuboidInterpolationEasing();
  });

  it('can be instantiated', () => {
    expect(easing).toEqual(jasmine.any(InterpolationEasing));
  });

  describe('supportsEasing', () => {
    it('returns true if type is linear', () => {
      const actual = easing.supportsEasing('linear');
      expect(actual).toBe(true);
    });

    it('returna false if type is anything else', () => {
      const actual = easing.supportsEasing('something-not-linear');
      expect(actual).toBe(false);
    });
  });

  describe('supportsShape', () => {
    it('returns true if shape is cuboid3d', () => {
      const actual = easing.supportsShape('cuboid3d');
      expect(actual).toBe(true);
    });

    it('returns true if shape is something else', () => {
      const actual = easing.supportsShape('pedestrian');
      expect(actual).toBe(false);
    });
  });

  describe('step()', () => {
    it('throws an error if Cuboid seems to be a 2D Object', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [5, 5, 5]
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [8, 8, 8]
        ],
      };
      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.3;

      const throwWrapper = () => {
        easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);
      };

      expect(throwWrapper).toThrowError('Something went wrong with 3D Cuboid that seems to be a 2D object');
    });

    it('calculates the step for the cuboid', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [2, 3, 4, 5],
          [2, 3, 4, 5],
          [2, 3, 4, 5],
          [2, 3, 4, 5],
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [0, 1, 2, 3]
        ],
      };

      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.3;

      easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);

      const expectedCoordinates = {};
      expect(ghost.shapes[0].vehicleCoordinates).toEqual(expectedCoordinates);
    });
  });
});