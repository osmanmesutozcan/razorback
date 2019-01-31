import { inject } from 'inversify';
import { CoreContext } from '../core';
import { CoreBindings } from '../core/types';

export class CoreLanguagesComponent {
  constructor(
    @inject(CoreBindings.CORE_INSTANCE) coreContext: CoreContext,
  ) {

  }
}
