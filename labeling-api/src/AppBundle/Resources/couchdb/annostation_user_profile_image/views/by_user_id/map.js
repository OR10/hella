function(doc) {
    if (doc.type === 'AppBundle.Model.UserProfileImage') {
        emit(doc.userId);
    }
}
