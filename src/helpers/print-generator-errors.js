/* eslint-disable no-console */
const { getError, infoPill } = require('./logger');

const titleFn = (title) => getError(`${infoPill('Generate route')} ${title}`);

function display(errors) {
  const summary = `${errors.length} error${errors.length > 1 ? 's' : ''}`;

  errors.forEach((err) => {
    console.error();

    console.error(titleFn(err.route));

    console.error();

    console.error(err.error.stack || err.error);
  });

  return summary;
}

module.exports = function printGeneratorErrors(errors) {
  return display(errors);
};
