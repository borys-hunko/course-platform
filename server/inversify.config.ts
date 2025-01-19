import { Container } from 'inversify';
import IConfigService, { CONFIG_SERVICE } from './src/config/IConfigService';
import ConfigServise from './src/config/ConfigService';

const container = new Container();

container.bind<IConfigService>(CONFIG_SERVICE).to(ConfigServise);
