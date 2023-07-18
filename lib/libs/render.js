import { parse } from './parse';
import * as actionCallbacks from './actions';
import { splitVocab } from './utils';

/**
 * Render CW script
 **/
export function render(script) {
  const asValues = {};

  /**
   * Execute Action
   **/
  function execAction(action) {
    const { as, name, value } = action;
    const cb = actionCallbacks[name];

    if (!cb) {
      const asValue = asValues[name];

      if (asValue === undefined) {
        throw new Error(`Unknown action [${name}]`);
      }
      return asValue;
    }
    const output = cb(typeof value === 'object'
      ? resolveParams(value)
      : value
    );

    if (as) {
      asValues[as] = output;
    }
    return output;
  }

  /**
   * Resolve Action Params
   **/
  function resolveParams(params) {
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
  return parse(script).reduce((entries, action) => {
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