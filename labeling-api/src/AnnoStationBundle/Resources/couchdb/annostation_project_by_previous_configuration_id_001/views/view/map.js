function (doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        Object.keys(doc.taskInstructions).forEach(function (taskInstruction) {
            doc.taskInstructions[taskInstruction].forEach(function (taskConfiguration) {
                if (taskConfiguration.previousConfigurationId !== null) {
                    emit(taskConfiguration.previousConfigurationId, taskConfiguration.taskConfigurationId);
                }
            });
        });
    }
}
