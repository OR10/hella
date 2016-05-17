import {Vector4} from 'three-math';

class DepthBuffer {
  /**
   * @param {Video} video
   * @param {Projection2d} projection2d
   */
  constructor(video, projection2d) {
    /**
     * @type {Video}
     * @private
     */
    this._video = video;

    /**
     * @type {Projection2d}
     * @private
     */
    this._projection2d = projection2d;
  }

  /**
   * @param {Array.<Array.<number>>} cuboid
   * @returns {*}
   */
  projectCuboidWithDepth(cuboid) {
    const faces = this._getFacesForCuboid(cuboid);
    faces.sort(this._compareByZOrder);
    const vertices = this._projectFacesWithDepth(faces);
    return vertices;
  }

  _getFacesForCuboid(cuboid) {
    const c = cuboid.map(vertex => new Vector4(...vertex, 1));

    const faces = [];
    faces.push({name: 'front', vertices3d: [c[0], c[1], c[2], c[3]], order: [0, 1, 2, 3]});
    faces.push({name: 'back', vertices3d: [c[4], c[5], c[6], c[7]], order: [4, 5, 6, 7]});
    faces.push({name: 'left', vertices3d: [c[4], c[0], c[3], c[7]], order: [4, 0, 3, 7]});
    faces.push({name: 'right', vertices3d: [c[5], c[1], c[2], c[6]], order: [5, 1, 2, 6]});
    faces.push({name: 'top', vertices3d: [c[4], c[0], c[1], c[5]], order: [4, 0, 1, 5]});
    faces.push({name: 'bottom', vertices3d: [c[7], c[6], c[2], c[0]], order: [7, 6, 2, 0]});

    return faces;
  }

  _compareByZOrder(thisFace, thatFace) {
    // Vertices are in vehicle coordinates. Therefore x is the depth
    const depthOfThisFace = thisFace.vertices3d.map(v => v.x);
    const depthOfThatFace = thatFace.vertices3d.map(v => v.x);
    const maxDepthOfThisFace = Math.max(...depthOfThisFace);
    const maxDepthOfThatFace = Math.max(...depthOfThatFace);

    if (maxDepthOfThisFace < maxDepthOfThatFace) {
      return -1;
    } else if (maxDepthOfThisFace === maxDepthOfThatFace) {
      return 0;
    } else {
      return 1;
    }
  }

  _projectFacesWithDepth(faces) {
    // Project all coordinates into 2d plane
    const faces2d = faces.map(face =>
      face.vertices3d.map(v =>
        this._projection2d.project3dTo2d(v)
      )
    );

    const minMaxFaces2d = faces2d.map(vertices => [
      [
        Math.min(...vertices.map(v => v.x)),
        Math.max(...vertices.map(v => v.x)),
      ],
      [
        Math.min(...vertices.map(v => v.y)),
        Math.max(...vertices.map(v => v.y)),
      ],
    ]);

    const offsetX = minMaxFaces2d[0][0] * -1;
    const offsetY = minMaxFaces2d[1][0] * -1;

    const depthBufferCanvas = document.createElement('canvas');
    const canvasWidth = minMaxFaces2d[0][1] - minMaxFaces2d[0][0];
    const canvasHeight = minMaxFaces2d[1][1] - minMaxFaces2d[1][0];

    if (canvasWidth > 8192 || canvasHeight > 8192) {
      throw new Error('Depth buffer needs to be bigger than 8192x8192 pixels. Most likely the cuboid definition or camera calibration is broken!');
    }

    depthBufferCanvas.setAttribute('width', canvasWidth);
    depthBufferCanvas.setAttribute('height', canvasHeight);

    const ctx = depthBufferCanvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const vertices = [];

    faces2d.forEach((vertices2d, faceIndex) => {
      const hiddenVertices = vertices2d.map(
        vertex => this._isPixelDrawn(ctx, vertex, offsetX, offsetY)
      );

      faces[faceIndex].order.forEach((vertexIndex, index) => {
        if (vertices[vertexIndex] !== undefined) {
          return;
        }

        vertices[vertexIndex] = {hidden: hiddenVertices[index], vertex: vertices2d[index]};
      });

      // Draw the face to the depthBuffer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(vertices2d[0].x + offsetX, vertices2d[0].y + offsetY);
      ctx.lineTo(vertices2d[1].x + offsetX, vertices2d[1].y + offsetY);
      ctx.lineTo(vertices2d[2].x + offsetX, vertices2d[2].y + offsetY);
      ctx.lineTo(vertices2d[3].x + offsetX, vertices2d[3].y + offsetY);
      ctx.closePath();
      ctx.fill();
    });

    return vertices;
  }

  _isPixelDrawn(ctx, vertex, offsetX = 0, offsetY = 0) {
    const imageData = ctx.getImageData(vertex.x + offsetX, vertex.y + offsetY, 1, 1);
    const pixel = imageData.data;

    return pixel[0] !== 0 && pixel[1] !== 0 && pixel[2] !== 0;
  }
}

export default DepthBuffer;
