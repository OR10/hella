"use strict";

/**
 * Remove non accumulated size in bytes of all videos
 */

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 2) {
  console.log('Usage: ' + process.argv[0] + ' [adminUrl]');
  process.exit(1);
}

const adminUrl = process.argv[2];

const nano = require('nano')(adminUrl);
const db = nano.use('labeling_api');
let bulkUpdates = [];

db.view('annostation_video_001', 'by_id', {}, (error, body) => {
  if (error) {
    console.error('ERROR: ' + error);
    return;
  }

  const rows = body.rows;
  console.log(`Found ${rows.length} videos for sizeInBytes deletion...`);

  const videoQueue = rows.map(row => row.id);
  let processedVideos = 0;
  const numberOfVideos = videoQueue.length;

  function doNextVideo() {
    const videoId = videoQueue.shift();

    db.get(videoId, (error, video) => {
      if (error) {
        console.error('ERROR: ' + error);
        return;
      }

      if (typeof video.imageTypes !== 'object' || video.imageTypes === null) {
        console.error(`ERROR: Video with invalid imageTypes found: ${video._id}`);
      } else {
        Object.keys(video.imageTypes).forEach(imageType => {
          if (video.imageTypes[imageType].accumulatedSizeInBytes === undefined) {
            console.log('Found video without accumulation (' + video._id + '). Accumulating...');
            if (typeof video.imageTypes[imageType].sizeInBytes !== 'object' || video.imageTypes[imageType].sizeInBytes === null) {
              console.error(`ERROR: Video with invalid sizeInBytes found: ${video._id}`);
              return;
            }

            const accumulatedSizeInBytes = Object.values(video.imageTypes[imageType].sizeInBytes)
              .reduce(
                (accumulator, currentSizeAsString) => accumulator + parseInt(currentSizeAsString, 10),
                0
              );

            video.imageTypes[imageType].accumulatedSizeInBytes = accumulatedSizeInBytes;
            console.log(`[${processedVideos}/${numberOfVideos}] Calculated accumulated size for ${video.name} (${video._id}) and type ${imageType}: ${accumulatedSizeInBytes}`);
          }
          delete video.imageTypes[imageType].sizeInBytes;
        });
      }

      bulkUpdates.push(video);
      console.log(`[${processedVideos}/${numberOfVideos}] Removed sizeInBytes for ${video.name} (${video._id})`);
      processedVideos += 1;

      if (videoQueue.length > 0 && bulkUpdates.length < 1000) {
        setTimeout(() => doNextVideo(), 1);
      } else {
        setTimeout(() => doBulkUpdates(), 1);
      }
    });
  }

  function doBulkUpdates() {
    console.log('Executing bulk updates ' + bulkUpdates.length);
    db.bulk({docs: bulkUpdates}, (err, results) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('Bulk update finished');
      results.forEach((result) => {
        if (result.error) {
          console.error('ERROR: Update failed for document ' + result.id + ': ' + result.error + ' / ' + result.reason);
        }
      });

      bulkUpdates = [];
      if (videoQueue.length > 0) {
        setTimeout(() => doNextVideo(), 1);
      }
    });
  }

  setTimeout(() => doNextVideo(), 1);
});

