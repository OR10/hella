import Vector4 from 'three-math';

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

    if (maxDepthOfThisFace > maxDepthOfThatFace) {
      return -1;
    } else if (maxDepthOfThisFace === maxDepthOfThatFace) {
      return 0;
    } else {
      return 1;
    }
  }

  _projectFacesWithDepth(faces) {
    const depthBufferCanvas = document.createElement('canvas');
    depthBufferCanvas.setAttribute('width', this._video.metaData.width);
    depthBufferCanvas.setAttribute('height', this._video.metaData.height);
    const ctx = depthBufferCanvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this._video.metaData.width, this._video.metaData.height);

    const vertices = [];

    faces.forEach(face => {
      const vertices2d = face.vertices3d.map(v => this._projection2d.project3dTo2d(v));
      const hiddenVertices = vertices2d.map(
        vertex => this._isPixelDrawn(ctx, vertex)
      );

      face.order.forEach((vIndex, index) => {
        if (vertices[vIndex] !== undefined) {
          return;
        }

        vertices[vIndex] = {hidden: hiddenVertices[index], vertex: vertices2d[index]};
      });

      // Draw the face to the depthBuffer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(vertices2d[0].x, vertices2d[0].y);
      ctx.lineTo(vertices2d[1].x, vertices2d[1].y);
      ctx.lineTo(vertices2d[2].x, vertices2d[2].y);
      ctx.lineTo(vertices2d[3].x, vertices2d[3].y);
      ctx.closePath();
      ctx.fill();
    });

    return vertices;
  }

  _isPixelDrawn(ctx, vertex) {
    const imageData = ctx.getImageData(vertex.x, vertex.y, 1, 1);
    const pixel = imageData.data;

    return pixel[0] !== 0 && pixel[1] !== 0 && pixel[2] !== 0;
  }
}