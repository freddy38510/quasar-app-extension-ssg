const yarnLockRE =
  /"quasar-app-extension-ssg@file:\.\.\/\.\.":\n\s\sversion\s"([0-9]+\.[0-9]+\.[0-9]+)"/s;

module.exports = {
  bumpFiles: [
    {
      filename: "demos/quasar-ssg-vite/.quasar-ssg-version.json",
      updater: {
        readVersion: (contents) => {
          return JSON.parse(contents).version;
        },
        writeVersion: (contents, version) => {
          const json = JSON.parse(contents);

          json.version = version;

          return JSON.stringify(json, null, 2);
        },
      },
    },
    {
      filename: "demos/quasar-ssg-vite/yarn.lock",
      updater: {
        readVersion: (contents) => {
          return contents.match(yarnLockRE)[1];
        },
        writeVersion: (contents, version) => {
          return contents.replace(yarnLockRE, (match, p1) => match.replace(p1, version));
        },
      },
    },
    {
      filename: "package.json",
      type: "json",
    },
  ],
};
