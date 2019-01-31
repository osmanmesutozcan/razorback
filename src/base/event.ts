import { Emitter, Event as _Event } from 'vscode-languageserver-protocol';

// Wrap vscode lsp types.

export interface Event<T> extends _Event<T> { }
export namespace Event {
    const _disposable = { dispose() {} };
    export const None: Event<any> = function () { return _disposable; };
}

export class EventEmitter<T> extends Emitter<T> { }
