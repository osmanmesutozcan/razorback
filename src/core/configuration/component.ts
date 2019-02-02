import * as fs from 'fs';
import * as paths from '../../base/paths';
import { ConfigurationModelParser } from './model';
import { createLogger } from '../../logger';

const logger = createLogger('razorback#configuration');

export class CoreConfigurationComponent {
  private readonly _configurationModelParser = new ConfigurationModelParser('default_config');

  async boot(): Promise<void> {
    const defaultConfigPath = paths.join(__dirname, '../../../razorback.json');
    const defaultConfigRaw = fs.readFileSync(defaultConfigPath, 'utf8');

    this._configurationModelParser.parse(defaultConfigRaw);
    logger.debug(this._configurationModelParser.configurationModel);
  }
}
