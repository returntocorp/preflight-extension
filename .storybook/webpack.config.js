const path = require("path");
const TSDocgenPlugin = require("react-docgen-typescript-webpack-plugin"); // Optional
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      { loader: "cache-loader" },
      {
        loader: "thread-loader",
        options: {
          // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          workers: require("os").cpus().length - 1
        }
      },
      {
        loader: require.resolve("ts-loader"),
        options: { transpileOnly: true, happyPackMode: true }
      }
    ]
  });

  config.plugins = [
    ...(config.plugins || []),
    new MonacoWebpackPlugin(),
    new TSDocgenPlugin(), // optional
    new ForkTsCheckerWebpackPlugin({
      tslint: path.resolve(__dirname, "../tslint.json"),
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
      checkSyntacticErrors: true
    })
  ];

  config.resolve.extensions.push(".ts", ".tsx");

  config.resolve.modules = [
    ...(config.resolve.modules || []),
    path.resolve("./"),
    path.resolve(__dirname, "../src")
  ];

  config.resolve.plugins = [
    ...(config.resolve.plugins || []),
    new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, "tsconfig.json")
    })
  ];

  return config;
};
