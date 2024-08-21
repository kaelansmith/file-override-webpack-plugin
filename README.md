# File Override Webpack Plugin

`FileOverridePlugin` is a Webpack plugin that allows you to override any files that are imported from a particular folder with files from another folder of your choosing. Simply place a file with the same name in your chosen override directory.

For example, let's say you're a web dev freelancer/agency with a monorepo that contains multiple websites for each of your clients, and you extract a bunch of commonly used React components into a standalone UI kit package for reusability. In this shared UI kit, you have a primitive `Button` component. If you wanted to customize/override this `Button` for a particular client project, you could import it and create your own "wrapper" component which applies some custom styling etc.. BUT, the `Button` from the UI kit is also imported into other larger components in your UI kit, such as a `CallToAction` component -- how do you ensure that `CallToAction` uses your project-specific `Button` instead of the shared `Button`? The short answer is: use this plugin.

Extending the above example, `FileOverridePlugin` allows you to say "when importing anything from `./ui-kit/**`, first check if there's a matching file in `./project-x/**`, and if so we import from that file instead (if not, import as usual). It works with nested files too (eg. to override `./ui-kit/primitives/button.tsx`, create a file at `./project-x/primitives/button.tsx`).

## Installation

```bash
npm install --save-dev file-override-webpack-plugin
```

## Usage

To use the `FileOverridePlugin`, add it to your Webpack configuration file (webpack.config.js or similar):

```javascript
import FileOverridePlugin from "file-override-webpack-plugin";

const webpackConfig = {
  // Other Webpack configurations...
  resolve: {
    plugins: [
      new FileOverridePlugin({
        sourcePath: "node_modules/ui-kit/src/components",
        overridePath: "./src/components",
        fileExtensions: ["tsx", "ts", "js", "jsx"],
        log: true,
      }),
    ],
  },
};
```

### Next.js Example

```javascript
const nextConfig = {
  // Other Next.js configurations...
  webpack: (config, context) => {
    config.resolve.plugins.push(
      new FileOverridePlugin({
        sourcePath: "node_modules/ui-kit/src/components",
        overridePath: "./src/components",
      })
    );

    return config;
  },
};
```

## Configuration Options

| Option           | Type       | Description                                                                                                                                                                   | Default                      |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `sourcePath`     | `string`   | This actually isn't a relative or absolute path, it's any unique portion of the path to your source folder to match against. Example: `"node_modules/ui-kit/src/components"`. | **Required**                 |
| `overridePath`   | `string`   | The path to your override folder or directory, relative to your Webpack configuration. Example: `"./src/components"`.                                                         | **Required**                 |
| `fileExtensions` | `string[]` | Array of file extensions to check for when resolving file paths. The plugin will look for files with these extensions in the override directory.                              | `['tsx', 'ts', 'js', 'jsx']` |
| `log`            | `boolean`  | Enable or disable logging to the console to see which files are being overridden during the build.                                                                            | `false`                      |

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.
