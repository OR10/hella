import fs from 'fs';

let savedMocks = [];

export function saveMock(fileName, fileContents) {
  const mockAlreadySaved = (savedMocks.findIndex(mock => mock === fileName) !== -1);
  if (!mockAlreadySaved) {
    const jsonFileContents = JSON.stringify(fileContents, null, 2);
    fs.writeFileSync(fileName, jsonFileContents);
    console.log(`Wrote file ${document.fileName}`);
  } else {
    console.log(`File ${document.fileName} already written`);
  }
}