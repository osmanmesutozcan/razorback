import { IExtensionDescription } from '../extension/types';

export interface CoreMessageOptions {
  extension: IExtensionDescription;
  modal?: boolean;
}
