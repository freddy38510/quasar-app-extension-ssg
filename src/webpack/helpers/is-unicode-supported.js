module.exports = function isUnicodeSupported() {
  if (process.platform !== 'win32') {
    return true;
  }

  return (
    Boolean(process.env.CI) || Boolean(process.env.WT_SESSION) || process.env.TERM_PROGRAM === 'vscode' || process.env.TERM === 'xterm-256color' || process.env.TERM === 'alacritty'
  );
};
