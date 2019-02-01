import { inject } from 'inversify';
import { CoreContext } from '../core';
import { CoreBindings } from '../types';

export class CoreLanguagesComponent {
  constructor(
    @inject(CoreBindings.CORE_INSTANCE) coreContext: CoreContext,
  ) {

  }
}
