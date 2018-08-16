// This is pretty horrifying.
// From https://www.rubberduck.io/blog/browser-extensions-react/#fnref-1

const fs = require("fs-extra");

const updateBackgroundFile = buildPath => {
  const backgroundJS = `${buildPath}/background.js`;
  const assetManifest = `${buildPath}/asset-manifest.json`;
  const assetContents = JSON.parse(fs.readFileSync(assetManifest, "utf8"));

  const jsPlaceholder = 'const jsLocation = "./static/js/bundle.js";';
  const cssPlaceholder = "const cssLocation = null;";

  const jsLocation = `const jsLocation = "./${assetContents["main.js"]}";`;
  const cssLocation = `const cssLocation = "./${assetContents["main.css"]}";`;

  let backgroundContents = fs.readFileSync(backgroundJS, "utf8");
  backgroundContents = backgroundContents.replace(jsPlaceholder, jsLocation);
  backgroundContents = backgroundContents.replace(cssPlaceholder, cssLocation);

  // Write back the corrected script
  fs.writeFile(backgroundJS, backgroundContents, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("background.js updated.");
  });
};

const updateExtensionManifest = buildPath => {
  const extensionManifest = `${buildPath}/manifest.js`;
  const assetManifest = `${buildPath}/asset-manifest.json`;
  const assetContents = JSON.parse(fs.readFileSync(assetManifest, "utf8"));

  const jsPlaceholder = "./static/js/bundle.js";
  const cssPlaceholder = "./hot-reload-stub.css";

  const jsLocation = `./${assetContents["main.js"]}`;
  const cssLocation = `./${assetContents["main.css"]}`;

  let manifestContents = fs.readFileSync(extensionManifest, "utf8");
  manifestContents = manifestContents.replace(jsPlaceholder, jsLocation);
  manifestContents = manifestContents.replace(cssPlaceholder, cssLocation);

  // Write back the corrected script
  fs.writeFile(extensionManifest, manifestContents, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("manifest.json updated.");
  });
};

module.exports = {
  updateBackgroundFile,
  updateExtensionManifest
};

if (require.main === module) {
  const buildPath = "./build";
  // updateBackgroundFile(buildPath);
  updateExtensionManifest(buildPath);
}
