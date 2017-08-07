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
const bulkUpdates = [];

db.view('annostation_video_001', 'by_id', {
  include_docs: true
}, function(error, body) {
  if (error) {
    console.error('ERROR: ' + error);
    return;
  }

  const rows = body.rows;

  rows.forEach(function(row) {
    const video = row.doc;

    Object.keys(video.imageTypes).forEach(function(imageType) {
      if (video.imageTypes[imageType].accumulatedSizeInBytes === undefined) {
        console.log('Found video without accumulation (' + video._id + '). Accumulating...');
        const accumulatedSizeInBytes = Object.values(video.imageTypes[imageType].sizeInBytes).reduce(function(accumulator, currentSize) {
          return accumulator + currentSize;
        }, 0);

        video.imageTypes[imageType].accumulatedSizeInBytes = accumulatedSizeInBytes;
      }
      delete video.imageTypes[imageType].sizeInBytes;

      bulkUpdates.push(video);
      console.log('Removed sizeInBytes for ' + video.name + '(' + video._id + ')');
    });
  });

  console.log('Executing bulk updates ' + bulkUpdates.length);
  db.bulk({docs: bulkUpdates}, function(err, results) {
    if (err) {
      console.log(bulkUpdates);
      console.error(err);
      return;
    }

    console.log('Bulk update finished');
    results.forEach(function(result) {
      if (result.error) {
        console.error('ERROR: Update failed for document ' + result.id + ': ' + result.error + ' / ' + result.reason);
      }
    });
  });
});

