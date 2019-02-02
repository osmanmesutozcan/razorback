import { inject } from 'inversify';
import { Emitter, Event } from '../../base/event';
import { CoreBindings } from '../types';
import { CoreContext } from '../core';
import { ExtensionsComponent } from '../extension/component';
import { CoreBindings as CoreProtocolBindings } from '../../api/protocol';
import { IActivateExtensionEvent } from './types';

/*
 * Activate extensions based on configured events.
 */
export class CoreExtensionActivationComponent {
  readonly _onLanguageEvent = new Emitter<IActivateExtensionEvent>();
  readonly onLanguageEvent: Event<IActivateExtensionEvent> = this._onLanguageEvent.event;

   private _extensionsComponent: ExtensionsComponent;

  constructor(
    @inject(CoreBindings.CORE_INSTANCE) coreContext: CoreContext,
  ) {

    this._extensionsComponent = coreContext
      .get<ExtensionsComponent>(CoreProtocolBindings.CoreExtensionsComponent);
  }
}
