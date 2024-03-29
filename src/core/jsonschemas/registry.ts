import { IJSONSchema } from '../../base/jsonSchema';
import { Event, Emitter } from '../../base/event';
import { Registry } from '../registry/registry';

export const Extensions = {
  JSONContribution: 'base.contributions.json',
};

export interface ISchemaContributions {
  schemas?: { [id: string]: IJSONSchema };
}

export interface IJSONContributionRegistry {

  readonly onDidChangeSchema: Event<string>;

  /**
   * Register a schema to the registry.
   */
  registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void;

  /**
   * Notifies all listeneres that the content of the given schema has changed.
   * @param uri The id of the schema
   */
  notifySchemaChanged(uri: string): void;

  /**
   * Get all schemas
   */
  getSchemaContributions(): ISchemaContributions;
}

function normalizeId(id: string) {
  if (id.length > 0 && id.charAt(id.length - 1) === '#') {
    return id.substring(0, id.length - 1);
  }
  return id;
}

class JSONContributionRegistry implements IJSONContributionRegistry {

  private schemasById: { [id: string]: IJSONSchema };

  private readonly _onDidChangeSchema: Emitter<string> = new Emitter<string>();
  readonly onDidChangeSchema: Event<string> = this._onDidChangeSchema.event;

  constructor() {
    this.schemasById = {};
  }

  public registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void {
    this.schemasById[normalizeId(uri)] = unresolvedSchemaContent;
    this._onDidChangeSchema.fire(uri);
  }

  public notifySchemaChanged(uri: string): void {
    this._onDidChangeSchema.fire(uri);
  }

  public getSchemaContributions(): ISchemaContributions {
    return {
      schemas: this.schemasById,
    };
  }

}

const jsonContributionRegistry = new JSONContributionRegistry();
Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
