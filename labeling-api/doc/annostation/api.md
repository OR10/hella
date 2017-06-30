FORMAT: 1A8

# Annostation Labeling API

This document describes the HTTP protocol used by the labeling ui to interact with the backend.

## Status codes

The backend is allowed to respond with any 5xx status code if anything goes
wrong and the UI needs to handle those errors in some form. Means, the UI is
expected to be still functional on any error that occurs in the backend. So,
even if one function is broken, everything else should still be functional.

If the backend does not understand the request or the request was malicious or
broken a 400 status code should be returned.

<!-- include(dataStructures.md) -->
<!-- include(video.md) -->
<!-- include(task.md) -->
<!-- include(currentUser.md) -->
<!-- include(user.md) -->
<!-- include(project.md) -->
<!-- include(labelingGroup.md) -->
<!-- include(taskConfiguration.md) -->
<!-- include(system.md) -->
<!-- include(organisation.md) -->
<!-- include(projectImporter.md) -->
<!-- include(campaign.md) -->
