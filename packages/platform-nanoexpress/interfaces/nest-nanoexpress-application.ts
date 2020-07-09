import { INestApplication } from '@nestjs/common';
import { ServeStaticOptions } from '@nestjs/platform-express/interfaces/serve-static-options.interface';

import * as nanoexpress from 'nanoexpress-pro';

export interface NestNanoexpressApplication extends INestApplication {
  listen(port: number | string): Promise<nanoexpress.nanoexpressApp>;
  listen(
    port: number | string,
    hostname: string,
  ): Promise<nanoexpress.nanoexpressApp>;

  /**
   * Sets one
   * TODO: or multiple base directories for templates (views).
   *
   * @example
   * app.setBaseViewsDir('views')
   *
   * @returns {this}
   */
  setBaseViewsDir(path: string): this;

  /**
   * Sets a base directory for public assets.
   * @example
   * app.useStaticAssets('public')
   *
   * @returns {this}
   */
  useStaticAssets(path: string, options?: ServeStaticOptions): this;

  /**
   * Sets a view engine for templates (views).
   * @example
   * app.setViewEngine('pug')
   *
   * @returns {this}
   */
  setViewEngine(engine: string): this;
}
