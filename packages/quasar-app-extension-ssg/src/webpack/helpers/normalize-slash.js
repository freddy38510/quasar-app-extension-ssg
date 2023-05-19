const TRAILING_SLASH_RE = /\/$|\/\?/;

const hasTrailingSlash = function hasTrailingSlash(input = '', queryParams = false) {
  if (!queryParams) {
    return input.endsWith('/');
  }

  return TRAILING_SLASH_RE.test(input);
};

const withTrailingSlash = function withTrailingSlash(input = '', queryParams = false) {
  if (!queryParams) {
    return input.endsWith('/') ? input : (`${input}/`);
  }

  if (hasTrailingSlash(input, true)) {
    return input || '/';
  }

  const [s0, ...s] = input.split('?');

  return `${s0}/${s.length ? `?${s.join('?')}` : ''}`;
};

const withoutTrailingSlash = function withoutTrailingSlash(input = '', queryParams = false) {
  if (!queryParams) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || '/';
  }

  if (!hasTrailingSlash(input, true)) {
    return input || '/';
  }

  const [s0, ...s] = input.split('?');

  return (s0.slice(0, -1) || '/') + (s.length ? `?${s.join('?')}` : '');
};

module.exports = { withTrailingSlash, withoutTrailingSlash };
