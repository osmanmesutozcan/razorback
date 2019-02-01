// tslint:disable:import-name

import * as rback from 'razorback';
import Severity from '../base/severity';
import { IExtensionDescription } from '../core/extension/types';
import { CoreMessageComponent } from '../core/message/component';
import { CoreMessageOptions } from '../core/message/types';
import { CoreContext } from '../core/core';
import { CoreBindings } from './protocol';

function isMessageItem(item: any): item is rback.MessageItem {
  return item && item.title;
}

export class ExtHostMessageService {

  private readonly _messageService: CoreMessageComponent;

  constructor(coreContext: CoreContext) {
    this._messageService = coreContext.get(CoreBindings.CoreMessageComponent);
  }

  /**
   * Show message based on severity level.
   */
  async showMessage(
    extension: IExtensionDescription,
    severity: Severity,
    message: string,
    optionsOrFirstItem: rback.MessageOptions | string,
    rest: string[],
  ): Promise<string | undefined>;

  async showMessage(
    extension: IExtensionDescription,
    severity: Severity,
    message: string,
    optionsOrFirstItem: rback.MessageOptions | rback.MessageItem,
    rest: rback.MessageItem[],
  ): Promise<rback.MessageItem | undefined>;

  async showMessage(
    extension: IExtensionDescription,
    severity: Severity,
    message: string,
    optionsOrFirstItem: rback.MessageOptions | string | rback.MessageItem,
    rest: (string | rback.MessageItem
    )[]): Promise<string | rback.MessageItem | undefined> {

    const options: CoreMessageOptions = { extension };
    let items: (string | rback.MessageItem)[];

    if (typeof optionsOrFirstItem === 'string' || isMessageItem(optionsOrFirstItem)) {
      items = [optionsOrFirstItem, ...rest];
    } else {
      options.modal = optionsOrFirstItem && optionsOrFirstItem.modal;
      items = rest;
    }

    const commands: { title: string; handle: number; }[] = [];

    // tslint:disable-next-line:no-increment-decrement
    for (let handle = 0; handle < items.length; handle++) {
      const command = items[handle];
      if (typeof command === 'string') {
        commands.push({ handle, title: command });
      } else if (typeof command === 'object') {
        const { title } = command;
        commands.push({ title, handle });
      } else {
        console.warn('Invalid message item:', command);
      }
    }

    const handle = await this._showMessage(severity, message, options, commands);
    if (typeof handle === 'number') {
      return items[handle];
    }

    return undefined;
  }

  /**
   * Execute show message command and return a handle
   * based on the user provided action.
   *
   * TODO: Actually return an handle
   */
  private async _showMessage(
    severity: Severity,
    message: string,
    _options: CoreMessageOptions,
    _commands: { title: string, handle: number }[],
  ): Promise<number | undefined> {
    switch (severity) {
      case Severity.Info: {
        return this._messageService.multilinesMessage(message);
      }
      case Severity.Warning: {
        return this._messageService.warningMessage(message);
      }
      case Severity.Error: {
        return this._messageService.warningMessage(message);
      }

      case Severity.Ignore:
      default:
        return;
    }
  }
}
