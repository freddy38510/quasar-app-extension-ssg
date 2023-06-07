const { join } = require('path');
const spawn = require('cross-spawn');

function run(cwd) {
  const runner = spawn.sync(
    'bash',
    ['./update.sh'],
    {
      stdio: 'inherit', cwd,
    },
  );

  if (runner.status || runner.error) {
    console.log();
    console.error(`⚠️  Command failed with exit code: ${runner.status || runner.error}`);
    process.exit(1);
  }
}

const webfonts = ['roboto-font'];

const baseFolder = join(__dirname, '../');

webfonts.forEach((webfont) => {
  console.log(`\n\nUpdating "${webfont}" webfont`);
  console.log();

  run(join(baseFolder, webfont));
});
