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
      filename: "package.json",
      type: "json",
    },
  ],
};
