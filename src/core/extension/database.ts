import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { inject, injectable } from 'inversify';

import { CoreBindings } from '../';
import { ExtensionNotFoundError } from './error';
import { DatabaseSchema, IExtensionModel } from './types';

const readFile = util.promisify(fs.readFile);

/**
 * Persisted extension metadata database;
 */
@injectable()
export class ExtensionDatabase {
  private db: lowdb.LowdbSync<DatabaseSchema>;

  constructor(
    @inject(CoreBindings.EXTENSION_DIRECTORY) private root: string,
  ) {
    const adapter = new FileSync<DatabaseSchema>(path.resolve(root, 'db.json'));
    this.db = lowdb(adapter);

    this.db
      .defaults({ extensions: [] })
      .write();
  }

  /**
   * List all extensions.
   */
  list(): IExtensionModel[] {
    const updateRoot = (ext: IExtensionModel) => ({
      ...ext,
      root: this.getExtensionRootDirectory(ext.name),
    });

    return this.db
      .get('extensions')
      .map(updateRoot)
      .value();
  }

  /**
   * Load an extensions PackageJSON.
   */
  async getPackageJSON(extension: IExtensionModel): Promise<any> {
    const file = path.resolve(
      extension.root,
      'package.json',
    );

    const content = await readFile(file, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Get root directory of an extension
   */
  private getExtensionRootDirectory(name: string): string {
    const extension = this.db
      .get('extensions')
      .find({ name })
      .value();

    if (!extension) {
      throw new ExtensionNotFoundError(`Cannot find extension '${name}'`);
    }

    return path.resolve(
      this.root,
      'extensions',
      'node_modules',
      <string>(extension.name),
    );
  }
}
