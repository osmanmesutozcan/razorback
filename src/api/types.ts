export class Disposable {
  static from(...inDisposables: { dispose(): any }[]): Disposable {
    let disposables: ReadonlyArray<{ dispose(): any }> | undefined = inDisposables;
    return new Disposable(() => {
      if (disposables) {
        for (const disposable of disposables) {
          if (disposable && typeof disposable.dispose === 'function') {
            disposable.dispose();
          }
        }
        disposables = undefined;
      }
    });
  }

  private _callOnDispose?: () => any;

  constructor(callOnDispose: () => any) {
    this._callOnDispose = callOnDispose;
  }

  dispose(): any {
    if (typeof this._callOnDispose === 'function') {
      this._callOnDispose();
      this._callOnDispose = undefined;
    }
  }
}
