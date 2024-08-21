import * as path from "path";
import * as fs from "fs";
import { Resolver, ResolveRequest } from "webpack";

// Define the plugin options
export type FileOverridePluginOptions = {
  /** Any uniquely-identifiable portion of the path to your source folder/directory (not a relative or absolute path; i.e. instead of "../../path" just write "/path"). eg. "node_modules/ui-kit/src/components" */
  sourcePath: string;
  /** The path to your override folder/directory (relative to your webpack config). eg. "./src/components" */
  overridePath: string;
  /** Array of file extensions to check (optional). Default: ["tsx", "ts", "js", "jsx"] */
  fileExtensions?: string[];
  /** Enable console logging of files that get overridden. Default: false */
  log?: boolean;
};

export class FileOverridePlugin {
  private sourcePath: string;
  private overridePath: string;
  private fileExtensions: string[];
  private log: boolean;

  constructor(options: FileOverridePluginOptions) {
    this.sourcePath = options.sourcePath;
    this.overridePath = options.overridePath;
    this.fileExtensions = options.fileExtensions || ["tsx", "ts", "js", "jsx"];
    this.log = options.log ?? false;
  }

  private doesFileExist(filePath: string): boolean {
    for (const ext of this.fileExtensions) {
      // Check existance of the file with the extension
      const completeFilePath = `${filePath}.${ext}`;
      if (fs.existsSync(completeFilePath)) {
        const stats = fs.statSync(completeFilePath);
        if (stats.isFile()) return true;
      }

      // Check if filePath is a directory with index file inside (e.g., Dialog/index.tsx)
      const indexFilePath = path.join(filePath, `index.${ext}`);
      if (fs.existsSync(indexFilePath)) {
        const stats = fs.statSync(indexFilePath);
        if (stats.isFile()) return true;
      }
    }

    // If no file was found, return false
    return false;
  }

  apply(resolver: Resolver) {
    resolver.hooks.resolve.tapAsync(
      "FileOverridePlugin",
      (
        request: ResolveRequest,
        context: any,
        callback: (err?: Error, result?: any) => void
      ) => {
        // Bypass the resolver if already processed
        if ((request as any)._fileOverrideResolveProcessed) return callback();

        // Mark the request to prevent infinite recursion
        (request as any)._fileOverrideResolveProcessed = true;

        // Get the filepath of the current request/import
        const importPath = request.request;
        const isRelativeImport = importPath.startsWith(".");

        // Get the issuer (the file that is doing the importing)
        const issuerDir = path.dirname(request.context.issuer || "");

        // Ensure the import/request originated from within the source folder (TODO: consider whether this should be an optional enforcement)
        if (!issuerDir.includes(this.sourcePath)) return callback();

        // Resolve the absolute path of the requested file
        const absoluteSourcePath = isRelativeImport
          ? path.resolve(issuerDir, importPath)
          : importPath;

        // Ensure the requested file is from the source folder
        if (!absoluteSourcePath.includes(this.sourcePath)) return callback();

        // Get the file's path relative to the source folder
        const relativeSourcePath = absoluteSourcePath.replace(
          new RegExp(`^.*${this.sourcePath}/`),
          ""
        );

        // Check for an override in the override folder
        const overrideFilePath = path.resolve(
          process.cwd(),
          this.overridePath,
          relativeSourcePath
        );

        if (!this.doesFileExist(overrideFilePath)) return callback();

        if (this.log) {
          console.log(
            `[FileOverridePlugin] Overriding "${absoluteSourcePath}" with "${overrideFilePath}"`
          );
        }

        // modify the request object with the overriden file path:
        request.request = overrideFilePath;
        return resolver.doResolve(
          resolver.hooks.resolve,
          request,
          context,
          {},
          callback
        );
      }
    );
  }
}
