import { Emitter, Event as _Event } from 'vscode-languageserver-protocol';

// Wrap vscode lsp types.

export interface Event<T> extends _Event<T> { }
export declare namespace Event {
    const None: Event<any>;
}

export class EventEmitter<T> extends Emitter<T> { }
