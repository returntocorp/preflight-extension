const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const fs = require("fs-extra");

module.exports = function override(config, env) {
  let buildPath = "./build";

  config.output.path = path.join(__dirname, buildPath);
  config.plugins.push(new WriteFilePlugin());
  fs.removeSync(buildPath);
  fs.copySync("./public/", buildPath);

  return config;
};
