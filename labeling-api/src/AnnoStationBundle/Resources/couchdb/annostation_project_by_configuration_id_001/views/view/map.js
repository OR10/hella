function (doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        Object.keys(doc.taskInstructions).forEach(function (taskInstruction) {
            doc.taskInstructions[taskInstruction].forEach(function (taskConfiguration) {
                emit(taskConfiguration.taskConfigurationId);
            });
        });
    }
}
