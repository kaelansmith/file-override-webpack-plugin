import { Resolver } from "webpack";
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
export declare class FileOverridePlugin {
    private sourcePath;
    private overridePath;
    private fileExtensions;
    private log;
    constructor(options: FileOverridePluginOptions);
    private doesFileExist;
    apply(resolver: Resolver): void;
}
