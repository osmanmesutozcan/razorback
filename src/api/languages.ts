import * as rback from 'razorback';
import { CoreContext } from '../core/core';
import { CoreLanguagesComponent } from '../core/languages/component';
import { CoreDocumentsComponent } from '../core/documents/component';
import { CoreBindings } from './protocol';
import { noop } from './noop';

export class ExtHostLanguages {

  private readonly _languagesService: CoreLanguagesComponent;
  private readonly _documentsService: CoreDocumentsComponent;

  constructor(coreContext: CoreContext) {
    this._languagesService = coreContext.get(CoreBindings.CoreLanguagesComponent);
    this._documentsService = coreContext.get(CoreBindings.CoreDocumentsComponent);
  }

  async getLanguages(): Promise<string[]> {
    noop('ExtHostLanguages#getLanguages');
    return ['typescript'];
  }

  async changeLanguage(
    document: rback.TextDocument,
    _languageId: string,
  ): Promise<rback.TextDocument> {

    noop('ExtHostLanguages#changeLanguage');
    return document;
  }

  setLanguageConfiguration(
    _languageId: string,
    _configuration: rback.LanguageConfiguration,
  ): rback.Disposable {

    return noop('ExtHostLanguages#setLanguageConfiguration', { disposable: true })!;
  }
}
