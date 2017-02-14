function(doc) {
    if (doc.type === 'AppBundle.Model.Project') {
      if (doc.deleted === true) {
        return;
      }
        if (typeof doc.status === 'object') {
            var statusHistory = [];
            doc.status.forEach(function (history) {
                statusHistory.push(history);
            });

            statusHistory.sort(function (a, b) {
                return b.timestamp - a.timestamp;
            });

            if (statusHistory[0].status !== 'deleted') {
              emit([statusHistory[0].status]);
            }
        }else{
            emit([doc.status]);
        }
    }
}
