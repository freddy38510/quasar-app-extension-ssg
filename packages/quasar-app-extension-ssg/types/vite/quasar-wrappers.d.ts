import type * as beastcss from 'beastcss';
import type { Options as GlobbyOptions } from 'globby';
import type { QuasarConf } from '@quasar/app-vite/types/configuration/conf';
import type {
  BaseQuasarContext,
  QuasarContext,
} from '@quasar/app-vite/types/configuration/context';

interface QuasarSsgConfiguration {
  /**
   * Specify the amount of page generation that runs in one thread.
   *
   * @default 10
   */
  concurrency?: number;

  /**
   * Interval in milliseconds between two batches of concurrent page generation
   * to avoid flooding a potential API with calls to the API from the web application.
   *
   * @default 0
   */
  interval?: number;

  /**
   * A list of routes to generate the corresponding pages.
   *
   * @default []
   */
  routes?:
  | string[]
  | (() => Promise<string[]>)
  | ((
    callback: (err: NodeJS.ErrnoException, routes: string[]) => void
  ) => void);

  /**
   * Include the application's router static routes to generate the corresponding pages.
   *
   * @default true
   */
  includeStaticRoutes?: boolean;

  /**
   * Folder where the extension should generate the distributables.
   * Relative path to project root directory.
   *
   * @default '<project-folder>/dist/ssg'
   */
  distDir?: string;

  /**
   * The Vite compilation output folder from where the extension can prerender pages.
   *
   * @default '<project-folder>/node_modules/.cache/quasar-app-extension-ssg'
   * @default '<project-folder>/.ssg-compilation' // if cache is disabled
   */
  compilationDir?: string;

  /**
   * Caches the compilation output folder and skips recompilation when no tracked file has changed.
   */
  cache?: false | { ignore?: string[] | ((defaultIgnore: string[]) => string[]); globbyOptions?: Omit<GlobbyOptions, 'cwd' | 'absolute' | 'ignore'> };

  /**
   * The name of the SPA/PWA fallback file intended to be served when
   * an index.html file does not exist for a given route.
   *
   * @default '404.html'
   */
  fallback?: string;

  /**
   * Crawls html links as each page is generated to find dynamic and static routes
   * to add to the page generation queue.
   *
   * @default true
   */
  crawler?: boolean;

  /**
   * An array of routes or regular expressions matching them
   * to prevent corresponding pages from being generated.
   *
   * @default []
   */
  exclude?: string[] | RegExp[];

  /**
   * A function to control what files should have resource hints generated.
   *
   * By default, no assets will be preloaded.
   */
  shouldPreload?: (arg: {
    file: string,
    type: 'script' | 'style' | 'image' | 'font' | '',
    extension: string,
    isLazilyHydrated: boolean
  }) => boolean;

  /**
   * A function to control what files should have resource hints generated.
   *
   * By default no assets will be prefetched.
   */
  shouldPrefetch?: (arg: {
    file: string,
    type: 'script' | 'style' | 'image' | 'font' | '',
    extension: string,
    isLazilyHydrated: boolean
  }) => boolean;

  /**
   * Uses Beastcss to inline critical CSS and async load the rest for each generated page.
   *
   * Disabled in development environment.
   */
  inlineCriticalCss?: boolean | beastcss.Options;

  /**
   * Set the font-display css descriptor of Roboto font imported from @quasar/extras package.
   *
   * @default 'optional'
   */
  robotoFontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

  /**
   * Auto import svg icons from `@quasar/extras` package.
   *
   * @default true
   */
  autoImportSvgIcons?: boolean;

  /**
   * Hook executed after pre-rendering a page just before writing it to the filesystem.
   *
   * This hook can be used to update html string and/or the generated page output path.
   */
  onPageGenerated?: (arg: { html: string, route: string, path: string }) =>
  { html: string, path: string } | Promise<{ html: string, path: string }>

  /**
   * Hook executed after all pages has been generated.
   */
  afterGenerate?: (files: string[], distDir: string) => void | Promise<void>;
}

interface SsgQuasarContext
  extends Omit<BaseQuasarContext, 'name' | 'modeName'> {
  mode: { ssg: true; ssr: true; pwa?: true };
  modeName: 'ssg';
}

type ConfigureCallback = (context: QuasarContext | SsgQuasarContext) =>
| QuasarConf
| {
  /** SSG specific [config](https://github.com/freddy38510/quasar-app-extension-ssg#configuration). */
  ssg?: QuasarSsgConfiguration;
};

declare module 'quasar/wrappers' {
  function configure(callback: ConfigureCallback): ConfigureCallback;
}
