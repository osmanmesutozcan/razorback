import * as rback from 'razorback';
import { URI } from '../base/uri';
import { EventEmitter } from '../base/event';

type ConfigurationInspect<T> = {
  key: string;
  defaultValue?: T;
  globalValue?: T;
  workspaceValue?: T;
  workspaceFolderValue?: T;
};

// TODO:
export class ExtHostConfiguration {

  private readonly _onDidChangeConfiguration = new EventEmitter<rback.ConfigurationChangeEvent>();

  get onDidChangeConfiguration(): rback.Event<rback.ConfigurationChangeEvent> {
    return this._onDidChangeConfiguration && this._onDidChangeConfiguration.event;
  }

  getConfiguration(
    _section?: string,
    _resource?: URI,
    _extensionId?: string,
  ): rback.WorkspaceConfiguration {

    const result: rback.WorkspaceConfiguration = {
      has(_key: string): boolean {
        return true;
      },
      get: <T>(_key: string, _defaultValue?: T) => {
        return {};
      },
      update: async (_key: string, _value: any, _arg: rback.ConfigurationTarget | boolean) => {
        return;
      },
      inspect: <T>(_key: string): ConfigurationInspect<T> | undefined => {
        return undefined;
      },
    };

    return <rback.WorkspaceConfiguration>Object.freeze(result);
  }
}
