import Cuboid2d from '../../Models/Cuboid2d';

/**
 * @implements Projection2d
 */
class DepthBufferProjection2d {
  /**
   * @param {Projection2d} projection2d
   */
  constructor(projection2d) {
    this._projection2d = projection2d;
  }

  /**
   * Project a cuboid into 2d space with depth (visibility) information
   *
   * @param {Cuboid3d} cuboid3d
   * @returns {Cuboid2d}
   */
  projectCuboidTo2d(cuboid3d) {
    const cuboid2dWithoutDepth = this._projection2d.projectCuboidTo2d(cuboid3d);
    const faces = this._getFacesForCuboid(cuboid2dWithoutDepth, cuboid3d);
    faces.sort(this._compareByZOrder);

    const [vertices, vertexVisibility] = this._projectFacesWithDepth(faces);
    return Cuboid2d.createFromRawVertices(vertices, vertexVisibility);
  }

  /**
   * Determine whether the cuboid should only be considered a one face pseudo 2d element
   *
   * It is checked whether the projection leaves only one face of the cuboid visible. In which case it will be
   * considered pseudo 3d.
   *
   * @name Projection2d#isPseudo3d
   * @param {Cuboid3d} cuboid
   * @returns {boolean}
   */
  isPseudo3d(cuboid) {
    const cuboid2d = this.projectCuboidTo2d(cuboid);
    const visibility = cuboid2d.vertexVisibility;
    const visibleVerticesCount = visibility.reduce(
      (current, visible) => visible ? current + 1 : current,
      0
    );

    if (visibleVerticesCount < 4) {
      throw new Error('Less than 4 vertices are visible. This should be impossible!');
    }

    return visibleVerticesCount === 4;
  }

  /**
   * @param {Cuboid2d} cuboid2d
   * @param {Cuboid3d} cuboid3d
   *
   * @private
   * @returns {Array}
   */
  _getFacesForCuboid(cuboid2d, cuboid3d) {
    const c2 = cuboid2d.vertices;
    const c3 = cuboid3d.vertices;

    const faces = [];
    // The initial order is important, as faces have same max depth and sorting is stable.
    faces.push({
      name: 'top',
      vertices2d: [c2[4], c2[0], c2[1], c2[5]],
      vertices3d: [c3[4], c3[0], c3[1], c3[5]],
      order: [4, 0, 1, 5],
    });
    faces.push({
      name: 'front',
      vertices2d: [c2[0], c2[1], c2[2], c2[3]],
      vertices3d: [c3[0], c3[1], c3[2], c3[3]],
      order: [0, 1, 2, 3],
    });
    faces.push({
      name: 'back',
      vertices2d: [c2[4], c2[5], c2[6], c2[7]],
      vertices3d: [c3[4], c3[5], c3[6], c3[7]],
      order: [4, 5, 6, 7],
    });
    faces.push({
      name: 'left',
      vertices2d: [c2[4], c2[0], c2[3], c2[7]],
      vertices3d: [c3[4], c3[0], c3[3], c3[7]],
      order: [4, 0, 3, 7],
    });
    faces.push({
      name: 'right',
      vertices2d: [c2[5], c2[1], c2[2], c2[6]],
      vertices3d: [c3[5], c3[1], c3[2], c3[6]],
      order: [5, 1, 2, 6],
    });
    faces.push({
      name: 'bottom',
      vertices2d: [c2[7], c2[6], c2[2], c2[3]],
      vertices3d: [c3[7], c3[6], c3[2], c3[3]],
      order: [7, 6, 2, 3],
    });

    return faces;
  }

  _compareByZOrder(thisFace, thatFace) {
    // Vertices are in vehicle coordinates. Therefore x is the depth
    const depthOfThisFace = thisFace.vertices3d.map(vertex => vertex.x);
    const depthOfThatFace = thatFace.vertices3d.map(vertex => vertex.x);
    const maxDepthOfThisFace = Math.max(...depthOfThisFace);
    const maxDepthOfThatFace = Math.max(...depthOfThatFace);

    if (maxDepthOfThisFace < maxDepthOfThatFace) {
      return -1;
    } else if (maxDepthOfThisFace === maxDepthOfThatFace) {
      return 0;
    } else { // eslint-disable-line no-else-return
      return 1;
    }
  }

  _projectFacesWithDepth(faces) {
    const minMaxFaces2d = {
      x: {
        min: Infinity,
        max: -Infinity,
      },
      y: {
        min: Infinity,
        max: -Infinity,
      },
    };

    faces.forEach(
      face => face.vertices2d.forEach(
        vertex => {
          minMaxFaces2d.x.min = Math.min(minMaxFaces2d.x.min, vertex.x);
          minMaxFaces2d.x.max = Math.max(minMaxFaces2d.x.max, vertex.x);
          minMaxFaces2d.y.min = Math.min(minMaxFaces2d.y.min, vertex.y);
          minMaxFaces2d.y.max = Math.max(minMaxFaces2d.y.max, vertex.y);
        }
      )
    );

    const offsetX = minMaxFaces2d.x.min * -1;
    const offsetY = minMaxFaces2d.y.min * -1;

    const depthBufferCanvas = document.createElement('canvas');
    const canvasWidth = minMaxFaces2d.x.max - minMaxFaces2d.x.min;
    const canvasHeight = minMaxFaces2d.y.max - minMaxFaces2d.y.min;

    if (canvasWidth > 8192 || canvasHeight > 8192) {
      throw new Error('Depth buffer needs to be bigger than 8192x8192 pixels. Most likely the cuboid definition or camera calibration is broken!');
    }

    depthBufferCanvas.setAttribute('width', canvasWidth);
    depthBufferCanvas.setAttribute('height', canvasHeight);

    const ctx = depthBufferCanvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const vertices = [];
    const vertexVisibility = [];

    faces.forEach(face => {
      const hiddenVertices = face.vertices2d.map(
        vertex => this._isPixelDrawn(ctx, vertex, offsetX, offsetY)
      );

      face.order.forEach((vertexIndex, index) => {
        if (vertices[vertexIndex] !== undefined) {
          return;
        }

        vertices[vertexIndex] = [face.vertices2d[index].x, face.vertices2d[index].y];
        vertexVisibility[vertexIndex] = !hiddenVertices[index];
      });

      // Draw the face to the depthBuffer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(face.vertices2d[0].x + offsetX, face.vertices2d[0].y + offsetY);
      ctx.lineTo(face.vertices2d[1].x + offsetX, face.vertices2d[1].y + offsetY);
      ctx.lineTo(face.vertices2d[2].x + offsetX, face.vertices2d[2].y + offsetY);
      ctx.lineTo(face.vertices2d[3].x + offsetX, face.vertices2d[3].y + offsetY);
      ctx.closePath();
      ctx.fill();
    });

    return [vertices, vertexVisibility];
  }

  _isPixelDrawn(ctx, vertex, offsetX = 0, offsetY = 0) {
    const imageData = ctx.getImageData(vertex.x + offsetX, vertex.y + offsetY, 1, 1);
    const pixel = imageData.data;

    return pixel[0] !== 0 && pixel[1] !== 0 && pixel[2] !== 0;
  }
}

export default DepthBufferProjection2d;
