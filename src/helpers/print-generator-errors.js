/* eslint-disable no-console */
const { getError, infoPill } = require('./logger');

const titleFn = (title) => getError(`${infoPill('Generate route')} ${title}`);

function display(errors, debug) {
  const summary = `${errors.length} error${errors.length > 1 ? 's' : ''}`;

  errors.forEach((err) => {
    console.error();

    console.error(titleFn(err.route));
    console.error();
    console.error(debug ? err.error.stack || err.error : ` ${err.error.message}`);
  });

  console.error();

  return summary;
}

module.exports = function printGeneratorErrors(errors, debug) {
  return display(errors, debug);
};
