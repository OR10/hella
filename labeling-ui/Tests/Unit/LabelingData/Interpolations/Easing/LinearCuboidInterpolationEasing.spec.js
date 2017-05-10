import InterpolationEasing from 'Application/LabelingData/Interpolations/Easing/InterpolationEasing';
import LinearCuboidInterpolationEasing from 'Application/LabelingData/Interpolations/Easing/LinearCuboidInterpolationEasing';

describe('LinearCuboidInterpolationEasing Test Suite', () => {
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

    it('returns false if type is anything else', () => {
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
    it('throws an error if providing a Pseudo 3D cube', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [5, 5, 5],
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [8, 8, 8],
        ],
      };
      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.3;

      const throwWrapper = () => {
        easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);
      };

      expect(throwWrapper).toThrowError('Invalid pseudo 3d cuboid found (0). Can\'t make 3d again');
    });

    it('calculates the step for the cuboid if current and end shape are Pseudo2D cuboids', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [5, 5, 1],
          [5, 5, 1],
          [5, 6, 1],
          [5, 7, 1],
          null,
          null,
          null,
          null,
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [4, 5, 1],
          [4, 5, 1],
          [4, 6, 1],
          [4, 7, 1],
          null,
          null,
          null,
          null,
        ],
      };

      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.3;

      easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);

      const expectedStepCoordinates = [
        [4.7, 5, 1],
        [4.7, 5, 1],
        [4.7, 6, 1],
        [4.7, 7, 1],
        [4.7, 5, 1],
        [4.7, 5, 1],
        [4.7, 6, 1],
        [4.7, 7, 1],
      ];
      expect(ghost.shapes[0].vehicleCoordinates).toEqual(expectedStepCoordinates);
    });

    it('calculates the step for the cuboid if current is pseuodo2d but end shape is a 3D cuboid', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [5, 4, 1],
          [5, 5, 1],
          [5, 6, 1],
          [5, 7, 1],
          null,
          null,
          null,
          null,
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [4, 4, 1],
          [4, 5, 1],
          [4, 6, 1],
          [4, 7, 1],
          [3, 2, 8],
          [3, 2, 7],
          [3, 2, 8],
          [3, 2, 7],
        ],
      };

      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.15;

      easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);

      const expectedStepCoordinates = [
        [4.85, 4, 1],
        [4.85, 5, 1],
        [4.85, 6, 1],
        [4.85, 7, 1],
        [4.7, 3.7, 2.05],
        [4.7, 4.55, 1.9],
        [4.7, 5.4, 2.05],
        [4.7, 6.25, 1.9],
      ];
      expect(ghost.shapes[0].vehicleCoordinates).toEqual(expectedStepCoordinates);
    });

    it('calculates the step for the cuboid if current is a 3d but end shape is a Pseudo2D cuboid', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [4, 4, 1],
          [4, 5, 1],
          [4, 6, 1],
          [4, 7, 1],
          [3, 2, 8],
          [3, 2, 7],
          [3, 2, 8],
          [3, 2, 7],
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [5, 4, 1],
          [5, 5, 1],
          [5, 6, 1],
          [5, 7, 1],
          null,
          null,
          null,
          null,
        ],
      };

      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.15;

      easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);

      const expectedStepCoordinates = [
        [4.15, 4, 1],
        [4.15, 5, 1],
        [4.15, 6, 1],
        [4.15, 7, 1],
        [3.3, 2.3, 6.95],
        [3.3, 2.45, 6.1],
        [3.3, 2.6, 6.95],
        [3.3, 2.75, 6.1],
      ];
      expect(ghost.shapes[0].vehicleCoordinates).toEqual(expectedStepCoordinates);
    });

    it('calculates the step for the cuboid if current and end shape are 3D cuboids', () => {
      const ghostShape = {
        vehicleCoordinates: [
          [1, 1, 1],
          [1, 5, 1],
          [5, 1, 1],
          [5, 5, 1],
          [3, 3, 2],
          [3, 8, 2],
          [8, 3, 2],
          [8, 8, 2],
        ],
      };
      const endLtifShape = {
        vehicleCoordinates: [
          [10, 10, 1],
          [10, 7, 1],
          [7, 10, 1],
          [7, 7, 1],
          [5, 5, 2],
          [5, 3, 2],
          [3, 5, 2],
          [3, 3, 2],
        ],
      };

      const ghost = {shapes: [ghostShape]};
      const startLabeledThingInFrame = {};
      const endLabeledThingInFrame = {shapes: [endLtifShape]};
      const delta = 0.15;

      easing.step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta);

      const expectedStepCoordinates = [
        [ 2.3499999999999996, 2.3499999999999996, 1 ],
        [ 2.3499999999999996, 5.3, 1 ],
        [ 5.3, 2.3499999999999996, 1 ],
        [ 5.3, 5.3, 1 ],
        [ 3.3, 3.3, 2 ],
        [ 3.3, 7.25, 2 ],
        [ 7.25, 3.3, 2 ],
        [ 7.25, 7.25, 2 ],
      ];
      expect(ghost.shapes[0].vehicleCoordinates).toEqual(expectedStepCoordinates);
    });
  });
});
