import { URI } from "../../base/uri";

export namespace ExtensionInternalBindings {
  export const DATABASE = "razorback.extension.database";
}

export interface DatabaseSchema {
  extensions: IExtensionModel[];
}

export type ExtensionKind = "ui" | "workspace";

/**
 * Single extension entry in database.
 */
export interface IExtensionModel {
  id: string;
  name: string;
  root: string;
  state: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IExtensionDefinition extends IExtensionModel {
  /**
   * Extension entrypoint.
   */
  main: string;
}

export interface IExtensionContext {
  // stuff
}

export const nullExtensionDescription = Object.freeze(<IExtensionDescription>{
  id: "nullExtensionDescription",
  identifier: "nullExtensionDescription",
  isUnderDevelopment: false,
  name: "Null Extension Description",
  version: "0.0.0",
  publisher: "vscode",
  enableProposedApi: false,
  engines: { vscode: "" },
  extensionLocation: URI.parse("void:location"),
  isBuiltin: false
});

export interface IExtensionDescription extends IExtensionManifest {
  // Generalized from 'ExtensionIdentifier' type.
  // Will keep a placeholder value for now.
  readonly id: string;
  readonly identifier: any;
  readonly uuid?: string;
  readonly isBuiltin: boolean;
  readonly isUnderDevelopment: boolean;
  readonly extensionLocation: URI;
  enableProposedApi?: boolean;
}

export interface IExtension<T> {
  activate: (context: IExtensionContext) => Promise<T>;
  deactivate: () => Promise<boolean>;
}

export interface ICommand {
  command: string;
  title: string;
  category?: string;
}

export interface IConfigurationProperty {
  description: string;
  type: string | string[];
  default?: any;
}

export interface IConfiguration {
  properties: { [key: string]: IConfigurationProperty };
}

export interface IDebugger {
  label?: string;
  type: string;
  runtime?: string;
}

export interface IGrammar {
  language: string;
}

export interface IJSONValidation {
  fileMatch: string;
  url: string;
}

export interface IKeyBinding {
  command: string;
  key: string;
  when?: string;
  mac?: string;
  linux?: string;
  win?: string;
}

export interface ILanguage {
  id: string;
  extensions: string[];
  aliases: string[];
}

export interface IMenu {
  command: string;
  alt?: string;
  when?: string;
  group?: string;
}

export interface ISnippet {
  language: string;
}

export interface ITheme {
  label: string;
}

export interface IViewContainer {
  id: string;
  title: string;
}

export interface IView {
  id: string;
  name: string;
}

export interface IColor {
  id: string;
  description: string;
  defaults: { light: string; dark: string; highContrast: string };
}

// Some of these contributions are not possible to
// implement or is not needed for core features to work.
export interface IExtensionContributions {
  commands?: ICommand[];
  configuration?: IConfiguration | IConfiguration[];
  debuggers?: IDebugger[];
  grammars?: IGrammar[];
  jsonValidation?: IJSONValidation[];
  keybindings?: IKeyBinding[];
  languages?: ILanguage[];
  menus?: { [context: string]: IMenu[] };
  snippets?: ISnippet[];
  themes?: ITheme[];
  iconThemes?: ITheme[];
  viewsContainers?: { [location: string]: IViewContainer[] };
  views?: { [location: string]: IView[] };
  colors?: IColor[];
  // localizations?: ILocalization[];
}

export interface IExtensionManifest {
  // This is mapped to razorback version internally.
  // This must be defined as vscode for compat reasons.
  readonly engines: { vscode: string };
  readonly name: string;
  readonly displayName?: string;
  readonly publisher: string;
  readonly version: string;
  readonly description?: string;
  readonly main?: string;
  readonly icon?: string;
  readonly categories?: string[];
  readonly keywords?: string[];
  readonly activationEvents?: string[];
  readonly extensionDependencies?: string[];
  readonly extensionPack?: string[];
  readonly extensionKind?: ExtensionKind;
  readonly contributes?: IExtensionContributions;
  readonly repository?: { url: string };
  readonly bugs?: { url: string };
  readonly enableProposedApi?: boolean;
}
