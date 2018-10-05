const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const fs = require("fs-extra");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function override(config, env) {
  let buildPath = "./build";

  // Add entry for content-script
  const defaultEntryArray = config.entry;
  const defaultEntryPrefix = defaultEntryArray.slice(0, 1);
  const indexPath = defaultEntryArray[defaultEntryArray.length - 1];
  const contentPath = indexPath.replace("index.tsx", "content.tsx");
  const popupPath = indexPath.replace("index.tsx", "popup.tsx");

  config.entry = {
    main: [...defaultEntryPrefix, indexPath],
    content: [...defaultEntryPrefix, contentPath],
    popup: [...defaultEntryPrefix, popupPath]
  };

  console.log(config.entry);

  config.devServer = {
    ...config.devServer,
    hot: false,
    inline: false
  };

  config.output.path = path.join(__dirname, buildPath);
  config.output.filename = "static/js/[name].bundle.js";
  config.plugins.push(new WriteFilePlugin());

  config.plugins = [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "public/popup.html"),
      filename: "popup.html",
      minify: config.plugins[0].minify
    }),
    ...(config.plugins || [])
  ];

  fs.removeSync(buildPath);
  fs.copySync("./public/", buildPath);

  return config;
};
