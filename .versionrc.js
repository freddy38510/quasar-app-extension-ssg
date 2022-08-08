const demos = {
  filename: 'demos/quasar-ssg-vite/package.json',
  updater: {
    writeVersion: function (contents, version) {
      const json = JSON.parse(contents);

      json.devDependencies.['quasar-app-extension-ssg'] = version;

      return JSON.stringify(json, null, 2);
    }
  }
}

module.exports = {
  bumpFiles: [demos],
}
