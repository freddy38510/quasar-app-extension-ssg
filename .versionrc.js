module.exports = {
  bumpFiles: [
    {
      filename: "demos/quasar-ssg-vite/package.json",
      updater: {
        readVersion: (contents) => {
          console.log(
            JSON.parse(contents).devDependencies["quasar-app-extension-ssg"]
          );
          return JSON.parse(contents).devDependencies[
            "quasar-app-extension-ssg"
          ];
        },
        writeVersion: (contents, version) => {
          const json = JSON.parse(contents);

          json.devDependencies["quasar-app-extension-ssg"] = version;

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
