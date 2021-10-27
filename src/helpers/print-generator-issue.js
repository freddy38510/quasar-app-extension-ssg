/* eslint-disable no-console */
const { getError, getWarning } = require('./logger');

function display(errors, severity, titleFn) {
  const summary = `${errors.length} ${severity}${errors.length > 1 ? 's' : ''}`;
  const printLog = console[severity === 'error' ? 'error' : 'warn'];

  errors.forEach((err) => {
    printLog();

    printLog(titleFn(err.route ? `Generate page for route ${err.route}` : 'Initialize routes'));

    printLog();

    printLog(err.error ? err.error.message : err.message);
  });

  return summary;
}

module.exports.printGeneratorErrors = function printGeneratorErrors(errors) {
  return display(errors, 'error', (title) => getError(`${title}`));
};

module.exports.printGeneratorWarnings = function printGeneratorWarnings(warnings) {
  return display(warnings, 'warning', (title) => getWarning(`${title}`));
};
