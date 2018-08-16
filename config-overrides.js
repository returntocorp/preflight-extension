const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const fs = require("fs-extra");

module.exports = function override(config, env) {
  let buildPath = "./build";

  // Add entry for content-script
  const defaultEntryArray = config.entry;
  const defaultEntryHotReload = defaultEntryArray.slice(
    0,
    defaultEntryArray.length - 1
  );
  const resolvedContentPath = defaultEntryArray[
    defaultEntryArray.length - 1
  ].replace("index.tsx", "content.tsx");
  config.entry = {
    main: defaultEntryArray,
    content: [...defaultEntryHotReload, resolvedContentPath]
  };
  console.log(config.entry);

  config.output.path = path.join(__dirname, buildPath);
  config.output.filename = "static/js/[name].bundle.js";
  config.plugins.push(new WriteFilePlugin());
  fs.removeSync(buildPath);
  fs.copySync("./public/", buildPath);

  return config;
};
