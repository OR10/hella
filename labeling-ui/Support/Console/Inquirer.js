import inquirer from 'inquirer';

const wrappedInquirer = {};

Object.keys(inquirer).forEach(key => wrappedInquirer[key] = inquirer[key]);

wrappedInquirer.prompt = function prompt(questions) {
  return new Promise(
    resolve => inquirer.prompt(
      questions,
      answers => resolve(answers)
    )
  );
};

export default wrappedInquirer;

