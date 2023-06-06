/* eslint-disable no-console */

const { getError, getWarning } = require('./logger');

function display(errors, severity, titleFn) {
  const summary = `${errors.length} ${severity}${errors.length > 1 ? 's' : ''}`;
  const printLog = console[severity === 'error' ? 'error' : 'warn'];

  errors.forEach((err) => {
    printLog(titleFn(err.hint));
    printLog();

    printLog(err);
  });

  printLog();

  return summary;
}

module.exports.printGeneratorErrors = function printGeneratorErrors(errors) {
  return display(errors, 'error', (title) => getError(title));
};

module.exports.printGeneratorWarnings = function printGeneratorWarnings(warnings) {
  return display(warnings, 'warning', (title) => getWarning(title));
};
