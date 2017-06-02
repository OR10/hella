class DeleteLabelGroupErrorOfInProgressProjects extends Error {
  constructor(message, projectNames) {
    super(message);
    this.name = 'DeletedFailedError';
    this.message = message;
    this.projectNames = projectNames;
  }
}

export default DeleteLabelGroupErrorOfInProgressProjects;
