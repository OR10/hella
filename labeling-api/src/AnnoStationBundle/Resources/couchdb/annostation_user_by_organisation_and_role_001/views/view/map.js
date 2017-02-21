function (doc) {
    if (doc.type !== 'AppBundle.Model.User') {
        return;
    }

    doc.organisations.forEach(function (organisation) {
        doc.roles.forEach(function (role) {
            emit([organisation, role], doc._id);
        });
    });
}
