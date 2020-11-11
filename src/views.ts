import { join, normalize, resolve } from 'path';

export interface ViewLocalProps {
  [key: string]: string | number | unknown;
}

export interface ViewsConfig {
  /**
   * Absolute path to the base views templates directory.
   */
  basedir: string;

  /**
   * View locals to assign on render.
   */
  locals: ViewLocalProps;
}

export interface ViewLocals extends ViewLocalProps {
  nonce: string;
}

export interface ViewLoader {
  /**
   * Renders a view to HTML.
   *
   * @param {string} path The path to the template relative to `basedir`.
   * @param {object} locals The locals to use.
   *
   * @returns {string} The rendered HTML.
   */
  render(path: string, locals?: ViewLocalProps): string;

  /**
   * Retrieves the template's function.
   *
   * @param {string} path The path to the template relative to `basedir`.
   *
   * @returns {Function} The termplate function.
   */
  get(path: string): CallableFunction;
}

/**
 * Retrieves a view template by path.
 *
 * @param {string} basedir The template basedir.
 * @param {string} path The view's template relative path.
 *
 * @returns {Function} The required template function.
 */
function get(basedir: string, path: string): CallableFunction {
  const file = join(basedir, path);
  const resolved = resolve(normalize(file));

  // This isn't "safe" but it's needed to load the views dynamically.
  return require(resolved); // eslint-disable-line security/detect-non-literal-require
}

/**
 * Renders a view template.
 *
 * @param {string} basedir The template basedir.
 * @param {string} path The view's path to render relative to the `config.basedir`.
 * @param {object} locals The locals object.
 *
 * @returns {string} The rendered HTML string.
 */
function render(basedir: string, path: string, locals?: ViewLocalProps): string {
  const fn = get(basedir, path);

  return fn(locals);
}

/**
 * Creates a new instance of Views.
 *
 * @param {object} config The configuration object.
 * @param {string} config.basedir The base directory.
 *
 * @returns {object} The component instance.
 */
export function createViewLoader({ basedir }: ViewsConfig): ViewLoader {
  return Object.freeze<ViewLoader>({
    render: render.bind(null, basedir),
    get: get.bind(null, basedir)
  });
}

/**
 * Creates the view locals object.
 *
 * @param {object} args The objects to merge into the locals.
 *
 * @returns {object} The merged locals values.
 */
export function createViewLocals(...args: ViewLocalProps[]): ViewLocals {
  return {
    ...args.reduce((acc, curr) => Object.assign(acc, curr)),
    nonce: null
  };
}
