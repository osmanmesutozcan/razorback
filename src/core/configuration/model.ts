import * as json from "../../base/json";
import * as types from "../../base/types";
import * as arrays from "../../base/arrays";
import * as objects from "../../base/objects";
import { Registry } from "../registry/registry";
import {
  Extensions,
  IConfigurationRegistry,
  OVERRIDE_PROPERTY_PATTERN
} from "./registry";

export interface IConfigurationModel {
  contents: any;
  keys: string[];
  overrides: IOverrides[];
}

export interface IOverrides {
  contents: any;
  identifiers: string[];
}

export interface IConfigurationData {
  defaults: IConfigurationModel;
  user: IConfigurationModel;
  workspace: IConfigurationModel;
  folders: { [folder: string]: IConfigurationModel };
  isComplete: boolean;
}

export class ConfigurationModel implements IConfigurationModel {
  private isFrozen: boolean = false;

  constructor(
    private _contents: any = {},
    private _keys: string[] = [],
    private _overrides: IOverrides[] = []
  ) {}

  get contents(): any {
    return this.checkAndFreeze(this._contents);
  }

  get overrides(): IOverrides[] {
    return this.checkAndFreeze(this._overrides);
  }

  get keys(): string[] {
    return this.checkAndFreeze(this._keys);
  }

  getValue<V>(section: string | undefined): V {
    return section
      ? getConfigurationValue<any>(this.contents, section)
      : this.contents;
  }

  override(identifier: string): ConfigurationModel {
    const overrideContents = this.getContentsForOverrideIdentifer(identifier);

    if (
      !overrideContents ||
      typeof overrideContents !== "object" ||
      !Object.keys(overrideContents).length
    ) {
      // If there are no valid overrides, return self
      return this;
    }

    const contents = {};
    for (const key of arrays.distinct([
      ...Object.keys(this.contents),
      ...Object.keys(overrideContents)
    ])) {
      let contentsForKey = this.contents[key];
      const overrideContentsForKey = overrideContents[key];

      // If there are override contents for the key, clone and merge otherwise use base contents
      if (overrideContentsForKey) {
        // Clone and merge only if base contents and override contents are of type object otherwise just override
        if (
          typeof contentsForKey === "object" &&
          typeof overrideContentsForKey === "object"
        ) {
          contentsForKey = objects.deepClone(contentsForKey);
          this.mergeContents(contentsForKey, overrideContentsForKey);
        } else {
          contentsForKey = overrideContentsForKey;
        }
      }

      (contents as any)[key] = contentsForKey;
    }

    return new ConfigurationModel(contents);
  }

  merge(...others: ConfigurationModel[]): ConfigurationModel {
    const contents = objects.deepClone(this.contents);
    const overrides = objects.deepClone(this.overrides);
    const keys = [...this.keys];

    for (const other of others) {
      this.mergeContents(contents, other.contents);

      for (const otherOverride of other.overrides) {
        const [override] = overrides.filter(o =>
          arrays.equals(o.identifiers, otherOverride.identifiers)
        );
        if (override) {
          this.mergeContents(override.contents, otherOverride.contents);
        } else {
          overrides.push(objects.deepClone(otherOverride));
        }
      }
      for (const key of other.keys) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      }
    }
    return new ConfigurationModel(contents, keys, overrides);
  }

  freeze(): ConfigurationModel {
    this.isFrozen = true;
    return this;
  }

  private mergeContents(source: any, target: any): void {
    for (const key of Object.keys(target)) {
      if (key in source) {
        if (types.isObject(source[key]) && types.isObject(target[key])) {
          this.mergeContents(source[key], target[key]);
          continue;
        }
      }
      source[key] = objects.deepClone(target[key]);
    }
  }

  private checkAndFreeze<T>(data: T): T {
    if (this.isFrozen && !Object.isFrozen(data)) {
      return objects.deepFreeze(data);
    }
    return data;
  }

  private getContentsForOverrideIdentifer(identifier: string): any {
    for (const override of this.overrides) {
      if (override.identifiers.indexOf(identifier) !== -1) {
        return override.contents;
      }
    }
    return null;
  }

  toJSON(): IConfigurationModel {
    return {
      contents: this.contents,
      overrides: this.overrides,
      keys: this.keys
    };
  }

  // Update methods

  public setValue(key: string, value: any) {
    this.addKey(key);
    addToValueTree(this.contents, key, value, e => {
      throw new Error(e);
    });
  }

  public removeValue(key: string): void {
    if (this.removeKey(key)) {
      removeFromValueTree(this.contents, key);
    }
  }

  private addKey(key: string): void {
    let index = this.keys.length;
    for (let i = 0; i < index; i++) {
      if (key.indexOf(this.keys[i]) === 0) {
        index = i;
      }
    }
    this.keys.splice(index, 1, key);
  }

  private removeKey(key: string): boolean {
    let index = this.keys.indexOf(key);
    if (index !== -1) {
      this.keys.splice(index, 1);
      return true;
    }
    return false;
  }
}

export class ConfigurationModelParser {
  private _configurationModel: ConfigurationModel | null = null;
  private _parseErrors: any[] = [];

  constructor(protected readonly _name: string) {}

  get configurationModel(): ConfigurationModel {
    return this._configurationModel || new ConfigurationModel();
  }

  get errors(): any[] {
    return this._parseErrors;
  }

  public parse(content: string): void {
    const raw = this.parseContent(content);
    const configurationModel = this.parseRaw(raw);
    this._configurationModel = new ConfigurationModel(
      configurationModel.contents,
      configurationModel.keys,
      configurationModel.overrides
    );
  }

  protected parseContent(content: string): any {
    let raw: any = {};
    let currentProperty: string | null = null;
    let currentParent: any = [];
    const previousParents: any[] = [];
    const parseErrors: json.ParseError[] = [];

    function onValue(value: any) {
      if (Array.isArray(currentParent)) {
        (<any[]>currentParent).push(value);
      } else if (currentProperty) {
        currentParent[currentProperty] = value;
      }
    }

    const visitor: json.JSONVisitor = {
      onObjectBegin: () => {
        const object = {};
        onValue(object);
        previousParents.push(currentParent);
        currentParent = object;
        currentProperty = null;
      },
      onObjectProperty: (name: string) => {
        currentProperty = name;
      },
      onObjectEnd: () => {
        currentParent = previousParents.pop();
      },
      onArrayBegin: () => {
        const array: any[] = [];
        onValue(array);
        previousParents.push(currentParent);
        currentParent = array;
        currentProperty = null;
      },
      onArrayEnd: () => {
        currentParent = previousParents.pop();
      },
      onLiteralValue: onValue,
      onError: (error: json.ParseErrorCode, offset: number, length: number) => {
        parseErrors.push({ error, offset, length });
      }
    };
    if (content) {
      try {
        json.visit(content, visitor);
        raw = currentParent[0] || {};
      } catch (e) {
        console.error(`Error while parsing settings file ${this._name}: ${e}`);
        this._parseErrors = [e];
      }
    }

    return raw;
  }

  protected parseRaw(raw: any): IConfigurationModel {
    const contents = toValuesTree(raw, message =>
      console.error(`Conflict in settings file ${this._name}: ${message}`)
    );
    const keys = Object.keys(raw);
    const overrides: IOverrides[] = toOverrides(raw, message =>
      console.error(`Conflict in settings file ${this._name}: ${message}`)
    );
    return { contents, keys, overrides };
  }
}

function toValuesTree(
  properties: { [qualifiedKey: string]: any },
  conflictReporter: (message: string) => void
): any {
  const root = Object.create(null);

  for (let key in properties) {
    addToValueTree(root, key, properties[key], conflictReporter);
  }

  return root;
}

/**
 * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
 */
function getConfigurationValue<T>(
  config: any,
  settingPath: string,
  defaultValue?: T
): T {
  function accessSetting(config: any, path: string[]): any {
    let current = config;
    for (let i = 0; i < path.length; i++) {
      if (typeof current !== "object" || current === null) {
        return undefined;
      }
      current = current[path[i]];
    }
    return <T>current;
  }

  const path = settingPath.split(".");
  const result = accessSetting(config, path);

  return typeof result === "undefined" ? defaultValue : result;
}

function addToValueTree(
  settingsTreeRoot: any,
  key: string,
  value: any,
  conflictReporter: (message: string) => void
): void {
  const segments = key.split(".");
  const last = segments.pop()!;

  let curr = settingsTreeRoot;
  for (let i = 0; i < segments.length; i++) {
    let s = segments[i];
    let obj = curr[s];
    switch (typeof obj) {
      case "undefined":
        obj = curr[s] = Object.create(null);
        break;
      case "object":
        break;
      default:
        conflictReporter(
          `Ignoring ${key} as ${segments
            .slice(0, i + 1)
            .join(".")} is ${JSON.stringify(obj)}`
        );
        return;
    }
    curr = obj;
  }

  if (typeof curr === "object") {
    curr[last] = value; // workaround https://github.com/Microsoft/vscode/issues/13606
  } else {
    conflictReporter(
      `Ignoring ${key} as ${segments.join(".")} is ${JSON.stringify(curr)}`
    );
  }
}

export function removeFromValueTree(valueTree: any, key: string): void {
  const segments = key.split(".");
  doRemoveFromValueTree(valueTree, segments);
}

function doRemoveFromValueTree(valueTree: any, segments: string[]): void {
  const first = segments.shift()!;
  if (segments.length === 0) {
    // Reached last segment
    delete valueTree[first];
    return;
  }

  if (Object.keys(valueTree).indexOf(first) !== -1) {
    const value = valueTree[first];
    if (typeof value === "object" && !Array.isArray(value)) {
      doRemoveFromValueTree(value, segments);
      if (Object.keys(value).length === 0) {
        delete valueTree[first];
      }
    }
  }
}

function toOverrides(
  raw: any,
  conflictReporter: (message: string) => void
): IOverrides[] {
  const overrides: IOverrides[] = [];
  const configurationProperties = Registry.as<IConfigurationRegistry>(
    Extensions.Configuration
  ).getConfigurationProperties();

  for (const key of Object.keys(raw)) {
    if (OVERRIDE_PROPERTY_PATTERN.test(key)) {
      const overrideRaw: any = {};
      for (const keyInOverrideRaw in raw[key]) {
        if (
          configurationProperties[keyInOverrideRaw] &&
          configurationProperties[keyInOverrideRaw].overridable
        ) {
          overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
        }
      }
      overrides.push({
        identifiers: [overrideIdentifierFromKey(key).trim()],
        contents: toValuesTree(overrideRaw, conflictReporter)
      });
    }
  }
  return overrides;
}

function overrideIdentifierFromKey(key: string): string {
  return key.substring(1, key.length - 1);
}

function keyFromOverrideIdentifier(overrideIdentifier: string): string {
  return `[${overrideIdentifier}]`;
}
