let projects = [];

const projectCount = 100;

for (let i = 0; i < projectCount; i++) {
  const taskCount = Math.floor((Math.random() * 200) + 100);
  const taskFinishedCount = Math.floor(Math.random() * taskCount);

  projects.push({
    id: "PROJECT-ID-" + (i + 1),
    name: "Test project entry No. " + (i + 1),
    creation_timestamp: Math.floor((Date.now() / 1000) - (Math.random() * 5184000)),
    status: ['in_progress', 'todo', 'done'][Math.floor(Math.random() * 3)],
    taskCount,
    taskFinishedCount,
  });
}

console.log(JSON.stringify(projects));