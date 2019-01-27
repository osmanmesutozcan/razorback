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
