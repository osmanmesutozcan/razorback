// tslint:disable:max-line-length

declare module 'razorback' {

  /**
   * A universal resource identifier representing either a file on disk
   * or another resource, like untitled resources.
   */
  export class Uri {

    /**
     * Create an URI from a string, e.g. `http://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @see [Uri.toString](#Uri.toString)
     * @param value The string value of an Uri.
     * @return A new Uri instance.
     */
    static parse(value: string): Uri;

    /**
     * Create an URI from a file system path. The [scheme](#Uri.scheme)
     * will be `file`.
     *
     * The *difference* between `Uri#parse` and `Uri#file` is that the latter treats the argument
     * as path, not as stringified-uri. E.g. `Uri.file(path)` is *not* the same as
     * `Uri.parse('file://' + path)` because the path might contain characters that are
     * interpreted (# and ?). See the following sample:
     * ```ts
    const good = URI.file('/coding/c#/project1');
    good.scheme === 'file';
    good.path === '/coding/c#/project1';
    good.fragment === '';

    const bad = URI.parse('file://' + '/coding/c#/project1');
    bad.scheme === 'file';
    bad.path === '/coding/c'; // path is now broken
    bad.fragment === '/project1';
    ```
     *
     * @param path A file system or UNC path.
     * @return A new Uri instance.
     */
    static file(path: string): Uri;

    /**
     * Use the `file` and `parse` factory functions to create new `Uri` objects.
     */
    private constructor(scheme: string, authority: string, path: string, query: string, fragment: string);

    /**
     * Scheme is the `http` part of `http://www.msft.com/some/path?query#fragment`.
     * The part before the first colon.
     */
    readonly scheme: string;

    /**
     * Authority is the `www.msft.com` part of `http://www.msft.com/some/path?query#fragment`.
     * The part between the first double slashes and the next slash.
     */
    readonly authority: string;

    /**
     * Path is the `/some/path` part of `http://www.msft.com/some/path?query#fragment`.
     */
    readonly path: string;

    /**
     * Query is the `query` part of `http://www.msft.com/some/path?query#fragment`.
     */
    readonly query: string;

    /**
     * Fragment is the `fragment` part of `http://www.msft.com/some/path?query#fragment`.
     */
    readonly fragment: string;

    /**
     * The string representing the corresponding file system path of this Uri.
     *
     * Will handle UNC paths and normalize windows drive letters to lower-case. Also
     * uses the platform specific path separator.
     *
     * * Will *not* validate the path for invalid characters and semantics.
     * * Will *not* look at the scheme of this Uri.
     * * The resulting string shall *not* be used for display purposes but
     * for disk operations, like `readFile` et al.
     *
     * The *difference* to the [`path`](#Uri.path)-property is the use of the platform specific
     * path separator and the handling of UNC paths. The sample below outlines the difference:
     * ```ts
    const u = URI.parse('file://server/c$/folder/file.txt')
    u.authority === 'server'
    u.path === '/shares/c$/file.txt'
    u.fsPath === '\\server\c$\folder\file.txt'
    ```
     */
    readonly fsPath: string;

    /**
     * Derive a new Uri from this Uri.
     *
     * ```ts
     * let file = Uri.parse('before:some/file/path');
     * let other = file.with({ scheme: 'after' });
     * assert.ok(other.toString() === 'after:some/file/path');
     * ```
     *
     * @param change An object that describes a change to this Uri. To unset components use `null` or
     *  the empty string.
     * @return A new Uri that reflects the given change. Will return `this` Uri if the change
     *  is not changing anything.
     */
    with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri;

    /**
     * Returns a string representation of this Uri. The representation and normalization
     * of a URI depends on the scheme.
     *
     * * The resulting string can be safely used with [Uri.parse](#Uri.parse).
     * * The resulting string shall *not* be used for display purposes.
     *
     * *Note* that the implementation will encode _aggressive_ which often leads to unexpected,
     * but not incorrect, results. For instance, colons are encoded to `%3A` which might be unexpected
     * in file-uri. Also `&` and `=` will be encoded which might be unexpected for http-uris. For stability
     * reasons this cannot be changed anymore. If you suffer from too aggressive encoding you should use
     * the `skipEncoding`-argument: `uri.toString(true)`.
     *
     * @param skipEncoding Do not percentage-encode the result, defaults to `false`. Note that
     *  the `#` and `?` characters occurring in the path will always be encoded.
     * @returns A string representation of this Uri.
     */
    toString(skipEncoding?: boolean): string;

    /**
     * Returns a JSON representation of this Uri.
     *
     * @return An object.
     */
    toJSON(): any;
  }

  /**
   * Represents a typed event.
   *
   * A function that represents an event to which you subscribe by calling it with
   * a listener function as argument.
   *
   * @sample `item.onDidChange(function(event) { console.log("Event happened: " + event); });`
   */
  export interface Event<T> {

    /**
     * A function that represents an event to which you subscribe by calling it with
     * a listener function as argument.
     *
     * @param listener The listener function will be called when the event happens.
     * @param thisArgs The `this`-argument which will be used when calling the event listener.
     * @param disposables An array to which a [disposable](#Disposable) will be added.
     * @return A disposable which unsubscribes the event listener.
     */
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
  }

  /**
   * A cancellation token is passed to an asynchronous or long running
   * operation to request cancellation, like cancelling a request
   * for completion items because the user continued to type.
   *
   * To get an instance of a `CancellationToken` use a
   * [CancellationTokenSource](#CancellationTokenSource).
   */
  export interface CancellationToken {

    /**
     * Is `true` when the token has been cancelled, `false` otherwise.
     */
    isCancellationRequested: boolean;

    /**
     * An [event](#Event) which fires upon cancellation.
     */
    onCancellationRequested: Event<any>;
  }

  // TODO
  // /**
  //  * A cancellation source creates and controls a [cancellation token](#CancellationToken).
  //  */
  // export class CancellationTokenSource {

  //   /**
  //    * The cancellation token of this source.
  //    */
  //   token: CancellationToken;

  //   /**
  //    * Signal cancellation on the token.
  //    */
  //   cancel(): void;

  //   /**
  //    * Dispose object and free resources.
  //    */
  //   dispose(): void;
  // }

  /**
   * A file system watcher notifies about changes to files and folders
   * on disk.
   *
   * To get an instance of a `FileSystemWatcher` use
   * [createFileSystemWatcher](#workspace.createFileSystemWatcher).
   */
  export interface FileSystemWatcher extends Disposable {

    /**
     * true if this file system watcher has been created such that
     * it ignores creation file system events.
     */
    ignoreCreateEvents: boolean;

    /**
     * true if this file system watcher has been created such that
     * it ignores change file system events.
     */
    ignoreChangeEvents: boolean;

    /**
     * true if this file system watcher has been created such that
     * it ignores delete file system events.
     */
    ignoreDeleteEvents: boolean;

    /**
     * An event which fires on file/folder creation.
     */
    onDidCreate: Event<Uri>;

    /**
     * An event which fires on file/folder change.
     */
    onDidChange: Event<Uri>;

    /**
     * An event which fires on file/folder deletion.
     */
    onDidDelete: Event<Uri>;
  }

  /**
   * Represents a reference to a command. Provides a title which
   * will be used to represent a command in the UI and, optionally,
   * an array of arguments which will be passed to the command handler
   * function when invoked.
   */
  export interface Command {
    /**
     * Title of the command, like `save`.
     */
    title: string;

    /**
     * The identifier of the actual command handler.
     * @see [commands.registerCommand](#commands.registerCommand).
     */
    command: string;

    /**
     * A tooltip for the command, when represented in the UI.
     */
    tooltip?: string;

    /**
     * Arguments that the command handler should be
     * invoked with.
     */
    arguments?: any[];
  }

  /**
   * Options to configure the behavior of the message.
   *
   * @see [showInformationMessage](#window.showInformationMessage)
   * @see [showWarningMessage](#window.showWarningMessage)
   * @see [showErrorMessage](#window.showErrorMessage)
   */
  export interface MessageOptions {

    /**
     * Indicates that this message should be modal.
     */
    modal?: boolean;
  }

  /**
   * Represents an action that is shown with an information, warning, or
   * error message.
   *
   * @see [showInformationMessage](#window.showInformationMessage)
   * @see [showWarningMessage](#window.showWarningMessage)
   * @see [showErrorMessage](#window.showErrorMessage)
   */
  export interface MessageItem {

    /**
     * A short title like 'Retry', 'Open Log' etc.
     */
    title: string;

    /**
     * A hint for modal dialogs that the item should be triggered
     * when the user cancels the dialog (e.g. by pressing the ESC
     * key).
     *
     * Note: this option is ignored for non-modal messages.
     */
    isCloseAffordance?: boolean;
  }

  /**
   * A workspace folder is one of potentially many roots opened by the editor. All workspace folders
   * are equal which means there is no notion of an active or master workspace folder.
   */
  export interface WorkspaceFolder {

    /**
     * The associated uri for this workspace folder.
     *
     * *Note:* The [Uri](#Uri)-type was intentionally chosen such that future releases of the editor can support
     * workspace folders that are not stored on the local disk, e.g. `ftp://server/workspaces/foo`.
     */
    readonly uri: Uri;

    /**
     * The name of this workspace folder. Defaults to
     * the basename of its [uri-path](#Uri.path)
     */
    readonly name: string;

    /**
     * The ordinal number of this workspace folder.
     */
    readonly index: number;
  }

  /**
   * An event describing a change to the set of [workspace folders](#workspace.workspaceFolders).
   */
  export interface WorkspaceFoldersChangeEvent {
    /**
     * Added workspace folders.
     */
    readonly added: WorkspaceFolder[];

    /**
     * Removed workspace folders.
     */
    readonly removed: WorkspaceFolder[];
  }

  // TODO
  // /**
  //  * A relative pattern is a helper to construct glob patterns that are matched
  //  * relatively to a base path. The base path can either be an absolute file path
  //  * or a [workspace folder](#WorkspaceFolder).
  //  */
  // export class RelativePattern {

  //   /**
  //    * A base file path to which this pattern will be matched against relatively.
  //    */
  //   base: string;

  //   /**
  //    * A file glob pattern like `*.{ts,js}` that will be matched on file paths
  //    * relative to the base path.
  //    *
  //    * Example: Given a base of `/home/work/folder` and a file path of `/home/work/folder/index.js`,
  //    * the file glob pattern will match on `index.js`.
  //    */
  //   pattern: string;

  //   /**
  //    * Creates a new relative pattern object with a base path and pattern to match. This pattern
  //    * will be matched on file paths relative to the base path.
  //    *
  //    * @param base A base file path to which this pattern will be matched against relatively.
  //    * @param pattern A file glob pattern like `*.{ts,js}` that will be matched on file paths
  //    * relative to the base path.
  //    */
  //   constructor(base: WorkspaceFolder | string, pattern: string)
  // }

  // TODO
  // /**
  //  * A file glob pattern to match file paths against. This can either be a glob pattern string
  //  * (like `**​/*.{ts,js}` or `*.{ts,js}`) or a [relative pattern](#RelativePattern).
  //  *
  //  * Glob patterns can have the following syntax:
  //  * * `*` to match one or more characters in a path segment
  //  * * `?` to match on one character in a path segment
  //  * * `**` to match any number of path segments, including none
  //  * * `{}` to group conditions (e.g. `**​/*.{ts,js}` matches all TypeScript and JavaScript files)
  //  * * `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
  //  * * `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
  //  *
  //  * Note: a backslash (`\`) is not valid within a glob pattern. If you have an existing file
  //  * path to match against, consider to use the [relative pattern](#RelativePattern) support
  //  * that takes care of converting any backslash into slash. Otherwise, make sure to convert
  //  * any backslash to slash when creating the glob pattern.
  //  */
  // export type GlobPattern = string | RelativePattern;

  /**
   * Namespace for dealing with the current workspace. A workspace is the representation
   * of the folder that has been opened. There is no workspace when just a file but not a
   * folder has been opened.
   *
   * The workspace offers support for [listening](#workspace.createFileSystemWatcher) to fs
   * events and for [finding](#workspace.findFiles) files. Both perform well and run _outside_
   * the editor-process so that they should be always used instead of nodejs-equivalents.
   */
  export namespace workspace {

    /**
     * ~~The folder that is open in the editor. `undefined` when no folder
     * has been opened.~~
     *
     * @deprecated Use [`workspaceFolders`](#workspace.workspaceFolders) instead.
     */
    export const rootPath: string | undefined;

    /**
     * List of workspace folders or `undefined` when no folder is open.
     * *Note* that the first entry corresponds to the value of `rootPath`.
     */
    export const workspaceFolders: WorkspaceFolder[] | undefined;

    /**
     * The name of the workspace. `undefined` when no folder
     * has been opened.
     */
    export const name: string | undefined;

    /**
     * An event that is emitted when a workspace folder is added or removed.
     */
    // TODO:
    // export const onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;

    /**
     * Returns the [workspace folder](#WorkspaceFolder) that contains a given uri.
     * * returns `undefined` when the given uri doesn't match any workspace folder
     * * returns the *input* when the given uri is a workspace folder itself
     *
     * @param uri An uri.
     * @return A workspace folder or `undefined`
     */
    // TODO:
    // export function getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined;

    /**
     * Returns a path that is relative to the workspace folder or folders.
     *
     * When there are no [workspace folders](#workspace.workspaceFolders) or when the path
     * is not contained in them, the input is returned.
     *
     * @param pathOrUri A path or uri. When a uri is given its [fsPath](#Uri.fsPath) is used.
     * @param includeWorkspaceFolder When `true` and when the given path is contained inside a
     * workspace folder the name of the workspace is prepended. Defaults to `true` when there are
     * multiple workspace folders and `false` otherwise.
     * @return A path relative to the root or the input.
     */
    // TODO:
    // export function asRelativePath(pathOrUri: string | Uri, includeWorkspaceFolder?: boolean): string;

    /**
     * This method replaces `deleteCount` [workspace folders](#workspace.workspaceFolders) starting at index `start`
     * by an optional set of `workspaceFoldersToAdd` on the `vscode.workspace.workspaceFolders` array. This "splice"
     * behavior can be used to add, remove and change workspace folders in a single operation.
     *
     * If the first workspace folder is added, removed or changed, the currently executing extensions (including the
     * one that called this method) will be terminated and restarted so that the (deprecated) `rootPath` property is
     * updated to point to the first workspace folder.
     *
     * Use the [`onDidChangeWorkspaceFolders()`](#onDidChangeWorkspaceFolders) event to get notified when the
     * workspace folders have been updated.
     *
     * **Example:** adding a new workspace folder at the end of workspace folders
     * ```typescript
     * workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: ...});
     * ```
     *
     * **Example:** removing the first workspace folder
     * ```typescript
     * workspace.updateWorkspaceFolders(0, 1);
     * ```
     *
     * **Example:** replacing an existing workspace folder with a new one
     * ```typescript
     * workspace.updateWorkspaceFolders(0, 1, { uri: ...});
     * ```
     *
     * It is valid to remove an existing workspace folder and add it again with a different name
     * to rename that folder.
     *
     * **Note:** it is not valid to call [updateWorkspaceFolders()](#updateWorkspaceFolders) multiple times
     * without waiting for the [`onDidChangeWorkspaceFolders()`](#onDidChangeWorkspaceFolders) to fire.
     *
     * @param start the zero-based location in the list of currently opened [workspace folders](#WorkspaceFolder)
     * from which to start deleting workspace folders.
     * @param deleteCount the optional number of workspace folders to remove.
     * @param workspaceFoldersToAdd the optional variable set of workspace folders to add in place of the deleted ones.
     * Each workspace is identified with a mandatory URI and an optional name.
     * @return true if the operation was successfully started and false otherwise if arguments were used that would result
     * in invalid workspace folder state (e.g. 2 folders with the same URI).
     */
    // TODO:
    // export function updateWorkspaceFolders(start: number, deleteCount: number | undefined | null, ...workspaceFoldersToAdd: { uri: Uri, name?: string }[]): boolean;

    /**
     * Creates a file system watcher.
     *
     * A glob pattern that filters the file events on their absolute path must be provided. Optionally,
     * flags to ignore certain kinds of events can be provided. To stop listening to events the watcher must be disposed.
     *
     * *Note* that only files within the current [workspace folders](#workspace.workspaceFolders) can be watched.
     *
     * @param globPattern A [glob pattern](#GlobPattern) that is applied to the absolute paths of created, changed,
     * and deleted files. Use a [relative pattern](#RelativePattern) to limit events to a certain [workspace folder](#WorkspaceFolder).
     * @param ignoreCreateEvents Ignore when files have been created.
     * @param ignoreChangeEvents Ignore when files have been changed.
     * @param ignoreDeleteEvents Ignore when files have been deleted.
     * @return A new file system watcher instance.
     */
    // TODO:
    // export function createFileSystemWatcher(globPattern: GlobPattern, ignoreCreateEvents?: boolean, ignoreChangeEvents?: boolean, ignoreDeleteEvents?: boolean): FileSystemWatcher;

    /**
     * Find files across all [workspace folders](#workspace.workspaceFolders) in the workspace.
     *
     * @sample `findFiles('**​/*.js', '**​/node_modules/**', 10)`
     * @param include A [glob pattern](#GlobPattern) that defines the files to search for. The glob pattern
     * will be matched against the file paths of resulting matches relative to their workspace. Use a [relative pattern](#RelativePattern)
     * to restrict the search results to a [workspace folder](#WorkspaceFolder).
     * @param exclude  A [glob pattern](#GlobPattern) that defines files and folders to exclude. The glob pattern
     * will be matched against the file paths of resulting matches relative to their workspace. When `undefined` only default excludes will
     * apply, when `null` no excludes will apply.
     * @param maxResults An upper-bound for the result.
     * @param token A token that can be used to signal cancellation to the underlying search engine.
     * @return A thenable that resolves to an array of resource identifiers. Will return no results if no
     * [workspace folders](#workspace.workspaceFolders) are opened.
     */
    // TODO:
    // export function findFiles(include: GlobPattern, exclude?: GlobPattern | null, maxResults?: number, token?: CancellationToken): Thenable<Uri[]>;

    /**
     * Save all dirty files.
     *
     * @param includeUntitled Also save files that have been created during this session.
     * @return A thenable that resolves when the files have been saved.
     */
    // TODO:
    // export function saveAll(includeUntitled?: boolean): Thenable<boolean>;

    /**
     * Make changes to one or many resources or create, delete, and rename resources as defined by the given
     * [workspace edit](#WorkspaceEdit).
     *
     * All changes of a workspace edit are applied in the same order in which they have been added. If
     * multiple textual inserts are made at the same position, these strings appear in the resulting text
     * in the order the 'inserts' were made. Invalid sequences like 'delete file a' -> 'insert text in file a'
     * cause failure of the operation.
     *
     * When applying a workspace edit that consists only of text edits an 'all-or-nothing'-strategy is used.
     * A workspace edit with resource creations or deletions aborts the operation, e.g. consective edits will
     * not be attempted, when a single edit fails.
     *
     * @param edit A workspace edit.
     * @return A thenable that resolves when the edit could be applied.
     */
    // TODO:
    // export function applyEdit(edit: WorkspaceEdit): Thenable<boolean>;

    /**
     * All text documents currently known to the system.
     */
    // TODO:
    // export const textDocuments: TextDocument[];

    /**
     * Opens a document. Will return early if this document is already open. Otherwise
     * the document is loaded and the [didOpen](#workspace.onDidOpenTextDocument)-event fires.
     *
     * The document is denoted by an [uri](#Uri). Depending on the [scheme](#Uri.scheme) the
     * following rules apply:
     * * `file`-scheme: Open a file on disk, will be rejected if the file does not exist or cannot be loaded.
     * * `untitled`-scheme: A new file that should be saved on disk, e.g. `untitled:c:\frodo\new.js`. The language
     * will be derived from the file name.
     * * For all other schemes the registered text document content [providers](#TextDocumentContentProvider) are consulted.
     *
     * *Note* that the lifecycle of the returned document is owned by the editor and not by the extension. That means an
     * [`onDidClose`](#workspace.onDidCloseTextDocument)-event can occur at any time after opening it.
     *
     * @param uri Identifies the resource to open.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    // TODO:
    // export function openTextDocument(uri: Uri): Thenable<TextDocument>;

    /**
     * A short-hand for `openTextDocument(Uri.file(fileName))`.
     *
     * @see [openTextDocument](#openTextDocument)
     * @param fileName A name of a file on disk.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    // TODO:
    // export function openTextDocument(fileName: string): Thenable<TextDocument>;

    /**
     * Opens an untitled text document. The editor will prompt the user for a file
     * path when the document is to be saved. The `options` parameter allows to
     * specify the *language* and/or the *content* of the document.
     *
     * @param options Options to control how the document will be created.
     * @return A promise that resolves to a [document](#TextDocument).
     */
    // TODO:
    // export function openTextDocument(options?: { language?: string; content?: string; }): Thenable<TextDocument>;

    /**
     * Register a text document content provider.
     *
     * Only one provider can be registered per scheme.
     *
     * @param scheme The uri-scheme to register for.
     * @param provider A content provider.
     * @return A [disposable](#Disposable) that unregisters this provider when being disposed.
     */
    // TODO:
    // export function registerTextDocumentContentProvider(scheme: string, provider: TextDocumentContentProvider): Disposable;

    /**
     * An event that is emitted when a [text document](#TextDocument) is opened or when the language id
     * of a text document [has been changed](#languages.setTextDocumentLanguage).
     *
     * To add an event listener when a visible text document is opened, use the [TextEditor](#TextEditor) events in the
     * [window](#window) namespace. Note that:
     *
     * - The event is emitted before the [document](#TextDocument) is updated in the
     * [active text editor](#window.activeTextEditor)
     * - When a [text document](#TextDocument) is already open (e.g.: open in another [visible text editor](#window.visibleTextEditors)) this event is not emitted
     *
     */
    // TODO:
    // export const onDidOpenTextDocument: Event<TextDocument>;

    /**
     * An event that is emitted when a [text document](#TextDocument) is disposed or when the language id
     * of a text document [has been changed](#languages.setTextDocumentLanguage).
     *
     * To add an event listener when a visible text document is closed, use the [TextEditor](#TextEditor) events in the
     * [window](#window) namespace. Note that this event is not emitted when a [TextEditor](#TextEditor) is closed
     * but the document remains open in another [visible text editor](#window.visibleTextEditors).
     */
    // TODO:
    // export const onDidCloseTextDocument: Event<TextDocument>;

    /**
     * An event that is emitted when a [text document](#TextDocument) is changed. This usually happens
     * when the [contents](#TextDocument.getText) changes but also when other things like the
     * [dirty](#TextDocument.isDirty)-state changes.
     */
    // TODO:
    // export const onDidChangeTextDocument: Event<TextDocumentChangeEvent>;

    /**
     * An event that is emitted when a [text document](#TextDocument) will be saved to disk.
     *
     * *Note 1:* Subscribers can delay saving by registering asynchronous work. For the sake of data integrity the editor
     * might save without firing this event. For instance when shutting down with dirty files.
     *
     * *Note 2:* Subscribers are called sequentially and they can [delay](#TextDocumentWillSaveEvent.waitUntil) saving
     * by registering asynchronous work. Protection against misbehaving listeners is implemented as such:
     *  * there is an overall time budget that all listeners share and if that is exhausted no further listener is called
     *  * listeners that take a long time or produce errors frequently will not be called anymore
     *
     * The current thresholds are 1.5 seconds as overall time budget and a listener can misbehave 3 times before being ignored.
     */
    // TODO:
    // export const onWillSaveTextDocument: Event<TextDocumentWillSaveEvent>;

    /**
     * An event that is emitted when a [text document](#TextDocument) is saved to disk.
     */
    // TODO:
    // export const onDidSaveTextDocument: Event<TextDocument>;

    /**
     * Get a workspace configuration object.
     *
     * When a section-identifier is provided only that part of the configuration
     * is returned. Dots in the section-identifier are interpreted as child-access,
     * like `{ myExt: { setting: { doIt: true }}}` and `getConfiguration('myExt.setting').get('doIt') === true`.
     *
     * When a resource is provided, configuration scoped to that resource is returned.
     *
     * @param section A dot-separated identifier.
     * @param resource A resource for which the configuration is asked for
     * @return The full configuration or a subset.
     */
    // TODO:
    // export function getConfiguration(section?: string, resource?: Uri | null): WorkspaceConfiguration;

    /**
     * An event that is emitted when the [configuration](#WorkspaceConfiguration) changed.
     */
    // TODO:
    // export const onDidChangeConfiguration: Event<ConfigurationChangeEvent>;

    /**
     * ~~Register a task provider.~~
     *
     * @deprecated Use the corresponding function on the `tasks` namespace instead
     *
     * @param type The task kind type this provider is registered for.
     * @param provider A task provider.
     * @return A [disposable](#Disposable) that unregisters this provider when being disposed.
     */
    // TODO:
    // export function registerTaskProvider(type: string, provider: TaskProvider): Disposable;

    /**
     * Register a filesystem provider for a given scheme, e.g. `ftp`.
     *
     * There can only be one provider per scheme and an error is being thrown when a scheme
     * has been claimed by another provider or when it is reserved.
     *
     * @param scheme The uri-[scheme](#Uri.scheme) the provider registers for.
     * @param provider The filesystem provider.
     * @param options Immutable metadata about the provider.
     * @return A [disposable](#Disposable) that unregisters this provider when being disposed.
     */
    // TODO:
    // export function registerFileSystemProvider(scheme: string, provider: FileSystemProvider, options?: { isCaseSensitive?: boolean, isReadonly?: boolean }): Disposable;
  }

  /**
   * Namespace for dealing with commands. In short, a command is a function with a
   * unique identifier. The function is sometimes also called _command handler_.
   *
   * Commands can be added to the editor using the [registerCommand](#commands.registerCommand)
   * and [registerTextEditorCommand](#commands.registerTextEditorCommand) functions. Commands
   * can be executed [manually](#commands.executeCommand) or from a UI gesture. Those are:
   *
   * * palette - Use the `commands`-section in `package.json` to make a command show in
   * the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).
   * * keybinding - Use the `keybindings`-section in `package.json` to enable
   * [keybindings](https://code.visualstudio.com/docs/getstarted/keybindings#_customizing-shortcuts)
   * for your extension.
   *
   * Commands from other extensions and from the editor itself are accessible to an extension. However,
   * when invoking an editor command not all argument types are supported.
   *
   * This is a sample that registers a command handler and adds an entry for that command to the palette. First
   * register a command handler with the identifier `extension.sayHello`.
   * ```javascript
   * commands.registerCommand('extension.sayHello', () => {
   * 	window.showInformationMessage('Hello World!');
   * });
   * ```
   * Second, bind the command identifier to a title under which it will show in the palette (`package.json`).
   * ```json
   * {
   *   "contributes": {
   *     "commands": [{
   *       "command": "extension.sayHello",
   *       "title": "Hello World"
   *     }]
   *   }
   * }
   * ```
   */
  export namespace commands {

    /**
     * Registers a command that can be invoked via a keyboard shortcut,
     * a menu item, an action, or directly.
     *
     * Registering a command with an existing command identifier twice
     * will cause an error.
     *
     * @param command A unique identifier for the command.
     * @param callback A command handler function.
     * @param thisArg The `this` context used when invoking the handler function.
     * @return Disposable which unregisters this command on disposal.
     */
    export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;

    /**
     * Registers a text editor command that can be invoked via a keyboard shortcut,
     * a menu item, an action, or directly.
     *
     * Text editor commands are different from ordinary [commands](#commands.registerCommand) as
     * they only execute when there is an active editor when the command is called. Also, the
     * command handler of an editor command has access to the active editor and to an
     * [edit](#TextEditorEdit)-builder.
     *
     * @param command A unique identifier for the command.
     * @param callback A command handler function with access to an [editor](#TextEditor) and an [edit](#TextEditorEdit).
     * @param thisArg The `this` context used when invoking the handler function.
     * @return Disposable which unregisters this command on disposal.
     */
    // TODO:
    // export function registerTextEditorCommand(command: string, callback: (textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void, thisArg?: any): Disposable;

    /**
     * Executes the command denoted by the given command identifier.
     *
     * * *Note 1:* When executing an editor command not all types are allowed to
     * be passed as arguments. Allowed are the primitive types `string`, `boolean`,
     * `number`, `undefined`, and `null`, as well as [`Position`](#Position), [`Range`](#Range), [`Uri`](#Uri) and [`Location`](#Location).
     * * *Note 2:* There are no restrictions when executing commands that have been contributed
     * by extensions.
     *
     * @param command Identifier of the command to execute.
     * @param rest Parameters passed to the command function.
     * @return A thenable that resolves to the returned value of the given command. `undefined` when
     * the command handler function doesn't return anything.
     */
    export function executeCommand<T>(command: string, ...rest: any[]): Thenable<T | undefined>;

    /**
     * Retrieve the list of all available commands. Commands starting an underscore are
     * treated as internal commands.
     *
     * @param filterInternal Set `true` to not see internal commands (starting with an underscore)
     * @return Thenable that resolves to a list of command ids.
     */
    export function getCommands(filterInternal?: boolean): Thenable<string[]>;
  }

  export namespace window {

    /**
     * Show an information message to users. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an information message to users. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an information message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an information message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show a warning message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show a warning message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show a warning message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show a warning message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an error message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an error message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an error message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an error message.
     *
     * @see [showInformationMessage](#window.showInformationMessage)
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
  }

  /**
   * A memento represents a storage utility. It can store and retrieve
   * values.
   */
  export interface Memento {

    /**
     * Return a value.
     *
     * @param key A string.
     * @return The stored value or `undefined`.
     */
    get<T>(key: string): T | undefined;

    /**
     * Return a value.
     *
     * @param key A string.
     * @param defaultValue A value that should be returned when there is no
     * value (`undefined`) with the given key.
     * @return The stored value or the defaultValue.
     */
    get<T>(key: string, defaultValue: T): T;

    /**
     * Store a value. The value must be JSON-stringifyable.
     *
     * @param key A string.
     * @param value A value. MUST not contain cyclic references.
     */
    update(key: string, value: any): Thenable<void>;
  }

  /**
   * An extension context is a collection of utilities private to an
   * extension.
   *
   * An instance of an `ExtensionContext` is provided as the first
   * parameter to the `activate`-call of an extension.
   */
  export interface ExtensionContext {

    /**
     * An array to which disposables can be added. When this
     * extension is deactivated the disposables will be disposed.
     */
    subscriptions: { dispose(): any }[];

    /**
     * A memento object that stores state in the context
     * of the currently opened [workspace](#workspace.workspaceFolders).
     */
    workspaceState: Memento;

    /**
     * A memento object that stores state independent
     * of the current opened [workspace](#workspace.workspaceFolders).
     */
    globalState: Memento;

    /**
     * The absolute file path of the directory containing the extension.
     */
    extensionPath: string;

    /**
     * Get the absolute path of a resource contained in the extension.
     *
     * @param relativePath A relative path to a resource contained in the extension.
     * @return The absolute path of the resource.
     */
    asAbsolutePath(relativePath: string): string;

    /**
     * An absolute file path of a workspace specific directory in which the extension
     * can store private state. The directory might not exist on disk and creation is
     * up to the extension. However, the parent directory is guaranteed to be existent.
     *
     * Use [`workspaceState`](#ExtensionContext.workspaceState) or
     * [`globalState`](#ExtensionContext.globalState) to store key value data.
     */
    storagePath: string | undefined;

    /**
     * An absolute file path in which the extension can store gloabal state.
     * The directory might not exist on disk and creation is
     * up to the extension. However, the parent directory is guaranteed to be existent.
     *
     * Use [`globalState`](#ExtensionContext.globalState) to store key value data.
     */
    globalStoragePath: string;

    /**
     * An absolute file path of a directory in which the extension can create log files.
     * The directory might not exist on disk and creation is up to the extension. However,
     * the parent directory is guaranteed to be existent.
     */
    logPath: string;
  }

  /**
   * Represents a type which can release resources, such
   * as event listening or a timer.
   */
  export class Disposable {

    /**
     * Combine many disposable-likes into one. Use this method
     * when having objects with a dispose function which are not
     * instances of Disposable.
     *
     * @param disposableLikes Objects that have at least a `dispose`-function member.
     * @return Returns a new disposable which, upon dispose, will
     * dispose all provided disposables.
     */
    static from(...disposableLikes: { dispose: () => any }[]): Disposable;

    /**
     * Creates a new Disposable calling the provided function
     * on dispose.
     * @param callOnDispose Function that disposes something.
     */
    constructor(callOnDispose: Function);

    /**
     * Dispose this object.
     */
    dispose(): any;
  }

  /**
   * Thenable is a common denominator between ES6 promises, Q, jquery.Deferred, WinJS.Promise,
   * and others. This API makes no assumption about what promise library is being used which
   * enables reusing existing code without migrating to a specific promise implementation.
   */
  export interface Thenable<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(
      onfulfilled?: (value: T) => TResult | Thenable<TResult>,
      onrejected?: (reason: any,
      ) => TResult | Thenable<TResult>): Thenable<TResult>;

    then<TResult>(
      onfulfilled?: (value: T) => TResult | Thenable<TResult>,
      onrejected?: (reason: any) => void,
    ): Thenable<TResult>;
  }
}
