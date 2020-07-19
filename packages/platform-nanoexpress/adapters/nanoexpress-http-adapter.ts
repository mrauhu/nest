import { AbstractHttpAdapter } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ServeStaticOptions } from '@nestjs/platform-express/interfaces/serve-static-options.interface';

import { NanoexpressRouterMethodFactory } from '../helpers';

import * as nanoexpress from 'nanoexpress-pro';
import * as cors from 'cors';
// TODO: Use serveStatic middleware from `nanoexpress/middlewares`
import * as express from 'express';

export class NanoexpressHttpAdapter extends AbstractHttpAdapter {
  protected readonly instance: nanoexpress.nanoexpressApp;
  protected httpServer: nanoexpress.nanoexpressApp;
  private readonly routerMethodFactory: NanoexpressRouterMethodFactory;
  private engine: (view: string, options?: any) => any;
  private baseViewsDir: string;

  constructor(instanceOptions?: nanoexpress.AppOptions) {
    const instance = nanoexpress(instanceOptions);
    super(instance);
    this.routerMethodFactory = new NanoexpressRouterMethodFactory();
    this.baseViewsDir = '';
  }

  // AbstractHttpAdapter
  getType(): string {
    return 'nanoexpress';
  }

  listen(port: string | number): Promise<nanoexpress.nanoexpressApp>;
  listen(
    port: string | number,
    hostname?: string,
  ): Promise<nanoexpress.nanoexpressApp> {
    return this.instance.listen(Number(port), hostname);
  }

  close(): boolean {
    return this.instance.close();
  }

  createMiddlewareFactory(
    requestMethod: RequestMethod,
  ): (path: string, callback: any) => any {
    return this.routerMethodFactory
      .get(this.instance, requestMethod)
      .bind(this.instance);
  }

  enableCors(options: CorsOptions): nanoexpress.nanoexpressApp {
    const corsMiddleware: any = cors(options);
    return this.instance.use(corsMiddleware);
  }

  getRequestHostname(request: nanoexpress.HttpRequest): string {
    const host: string = request.headers.host;
    return host.split(':', 1)[0];
  }

  getRequestMethod(request: nanoexpress.HttpRequest): string {
    return request.method;
  }

  getRequestUrl(request: nanoexpress.HttpRequest): string {
    return request.url;
  }

  initHttpServer(): void {
    this.httpServer = this.instance;
  }

  redirect(
    response: nanoexpress.HttpResponse,
    statusCode: number,
    url: string,
  ): nanoexpress.HttpResponse {
    return response.redirect(statusCode, url);
  }

  registerParserMiddleware(): void {
    // Build-in
  }

  reply(
    response: nanoexpress.HttpResponse,
    body: any,
    statusCode?: number,
  ): nanoexpress.HttpResponse {
    if (statusCode) {
      response.status(statusCode);
    }
    if (isNil(body)) {
      return <nanoexpress.HttpResponse>response.end();
    }
    return response.send(body);
  }

  setErrorHandler(
    handler: (
      err: Error,
      req: nanoexpress.HttpRequest,
      res: nanoexpress.HttpResponse,
    ) => any,
  ): nanoexpress.nanoexpressApp {
    return this.instance.setErrorHandler(handler);
  }

  setHeader(
    response: nanoexpress.HttpResponse,
    name: string,
    value: string,
  ): nanoexpress.HttpResponse {
    return response.setHeader(name, value);
  }

  setNotFoundHandler(
    handler: (
      req: nanoexpress.HttpRequest,
      res: nanoexpress.HttpResponse,
    ) => any,
  ): nanoexpress.nanoexpressApp {
    return this.instance.setNotFoundHandler(handler);
  }

  status(
    response: nanoexpress.HttpResponse,
    statusCode: number,
  ): nanoexpress.HttpResponse {
    return response.status(statusCode);
  }

  /*
  Templates
  @see https://docs.nestjs.com/techniques/mvc
 */
  useStaticAssets(path: string, options: ServeStaticOptions): this {
    if (options && options.prefix) {
      return this.use(options.prefix, express.static(path, options));
    }
    return this.use(express.static(path, options));
  }

  setViewEngine(engine: string): this {
    this.engine = loadPackage(
      engine,
      'NanoexpressHttpAdapter',
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      () => require(engine).__express,
    );
    return this;
  }

  render(response: nanoexpress.HttpResponse, view: string, options?: any): any {
    return this.engine(this.baseViewsDir + view, options);
  }

  // HttpServer interface
  setBaseViewsDir(path: string): this {
    this.baseViewsDir = path;
    return this;
  }
}
