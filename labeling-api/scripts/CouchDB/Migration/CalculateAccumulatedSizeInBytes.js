"use strict";

/**
 * Calculate an accumulated Size in bytes information for each video and image type
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
      const accumulatedSizeInBytes = Object.values(video.imageTypes[imageType].sizeInBytes).reduce(function(accumulator, currentSize) {
        return accumulator + currentSize;
      }, 0);

      video.imageTypes[imageType].accumulatedSizeInBytes = accumulatedSizeInBytes;
      bulkUpdates.push(video);
      console.log('Calculated accumulated size for ' + video.name + '(' + video._id + '): ' + accumulatedSizeInBytes);
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

