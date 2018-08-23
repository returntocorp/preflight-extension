// This is pretty horrifying.
// From https://www.rubberduck.io/blog/browser-extensions-react/#fnref-1

const fs = require("fs-extra");

const updateExtensionManifest = buildPath => {
  const extensionManifest = `${buildPath}/manifest.json`;
  const assetManifest = `${buildPath}/asset-manifest.json`;
  const assetContents = JSON.parse(fs.readFileSync(assetManifest, "utf8"));

  const jsPlaceholder = "./static/js/content.bundle.js";
  const cssPlaceholder = "./hot-reload-stub.css";

  const jsLocation = `./${assetContents["content.js"]}`;
  const cssLocation = `./${assetContents["content.css"]}`;

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
  updateExtensionManifest
};

if (require.main === module) {
  const buildPath = "./build";
  updateExtensionManifest(buildPath);
}
