import * as rback from 'razorback';
import { CoreContext } from '../core/core';
import { ExtensionsComponent } from '../core/extension/component';
import { CoreBindings } from './protocol';

export class ExtHostExtensions {

  constructor(private readonly _coreContext: CoreContext) { }

  getExtension(extensionId: string): rback.Extension<any> | undefined {
    const extensionsComponent = this._coreContext
      .get<ExtensionsComponent>(CoreBindings.CoreExtensionsComponent);

    return extensionsComponent.getExtension(extensionId);
  }

  get all(): rback.Extension<any>[] {
    const extensionsComponent = this._coreContext
      .get<ExtensionsComponent>(CoreBindings.CoreExtensionsComponent);

    return extensionsComponent.getAllExtensions();
  }
}
