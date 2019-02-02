import { IExtensionDescription } from './types';
import { createLogger } from '../../logger';

const logger = createLogger('razorback#extension#registry');

const hasOwnProperty = Object.hasOwnProperty;

export class ExtensionDescriptionRegistry {
  private _extensionDescriptions: IExtensionDescription[] = [];
  private _extensionsMap: { [extensionId: string]: IExtensionDescription; } = {};
  private _extensionsArr: IExtensionDescription[] = [];
  private _activationMap: { [activationEvent: string]: IExtensionDescription[]; } = {};

  constructor() { }

  _initialize(extensionDescriptions: IExtensionDescription[]): void {
    this._extensionDescriptions = extensionDescriptions;

    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0, len = this._extensionDescriptions.length; i < len; i++) {
      const extensionDescription = this._extensionDescriptions[i];

      if (hasOwnProperty.call(this._extensionsMap, extensionDescription.id)) {
        // No overwriting allowed!
        logger.error(`Extension '${extensionDescription.id}' is already registered`);
        continue;
      }

      this._extensionsMap[extensionDescription.id] = extensionDescription;
      this._extensionsArr.push(extensionDescription);

      if (Array.isArray(extensionDescription.activationEvents)) {
        // tslint:disable-next-line:no-increment-decrement
        for (let j = 0, lenJ = extensionDescription.activationEvents.length; j < lenJ; j++) {
          let activationEvent = extensionDescription.activationEvents[j];

          // TODO@joao: there's no easy way to contribute this
          if (activationEvent === 'onUri') {
            activationEvent = `onUri:${extensionDescription.id}`;
          }

          this._activationMap[activationEvent] = this._activationMap[activationEvent] || [];
          this._activationMap[activationEvent].push(extensionDescription);
        }
      }
    }
  }

  public keepOnly(extensionIds: string[]): void {
    const toKeep = new Set<string>();
    extensionIds.forEach(extensionId => toKeep.add(extensionId));

    this._initialize(
      this._extensionDescriptions
        .filter(extension => toKeep.has(extension.id)),
    );
  }

  public containsActivationEvent(activationEvent: string): boolean {
    return hasOwnProperty.call(this._activationMap, activationEvent);
  }

  public getExtensionDescriptionsForActivationEvent(
    activationEvent: string,
  ): IExtensionDescription[] {
    if (!hasOwnProperty.call(this._activationMap, activationEvent)) {
      return [];
    }
    return this._activationMap[activationEvent].slice(0);
  }

  public getAllExtensionDescriptions(): IExtensionDescription[] {
    return this._extensionsArr.slice(0);
  }

  public getExtensionDescription(extensionId: string): IExtensionDescription | null {
    if (!hasOwnProperty.call(this._extensionsMap, extensionId)) {
      return null;
    }
    return this._extensionsMap[extensionId];
  }
}
