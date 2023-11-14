import { parse, TParseAction } from './parse';
import * as actionCallbacks from './actions';
import { splitVocab } from './utils';

/**
 * Actions return one of the following
 **/
export type TActionResult = string | string[] | Record<string, any>;

/**
 * Render returns this type
 **/
export type TRenderResult = string | Record<string, any>;

/**
 * Render CW script
 **/
export function render(script: string): TRenderResult[] {
  const asValues: Record<string, any> = {};

  /**
   * Execute Parsed Action
   **/
  function execAction(action: TParseAction): TActionResult {
    const { as, name, value } = action;
    const cb = actionCallbacks[name];

    // If no action, treat name "as" a back-reference
    if (!cb) {
      const asValue = asValues[name];

      if (asValue === undefined) {
        throw new Error(`Unknown action [${name}]`);
      }
      return asValue;
    }

    // If action, execute callback and resolve params
    const output = cb(typeof value === 'object'
      ? resolveParams(value)
      : value
    );

    // Save resolved action output "as" a back-reference
    if (as) {
      asValues[as] = output;
    }
    return output;
  }

  /**
   * Resolve Recursive Action Params
   **/
  function resolveParams(params: Record<string, any>): Record<string, any> {
    return Object.entries(params).reduce((out, [name, value]) => {
      out[name] = (typeof value === 'object')
        ? execAction(value)
        : value;
      return out;
    }, {});
  }

  /**
   * Main Renderer
   **/
  return parse(script).reduce<TRenderResult[]>((entries, action) => {
    let value = execAction(action);

    if (Array.isArray(value)) {
      value = value.join(' ');
    }
    if (typeof value === 'string') {
      splitVocab(value).forEach(value =>
        entries.push(value)
      );
    }
    else {
      entries.push(value);
    }
    return entries;
  }, []);
}