import { tokenize } from './tokenize';

const MATCH_TEXT    = /^([^\[]+)/;
const MATCH_ACTION  = /^\s*\[\s*(\w+)/;
const MATCH_CLOSE   = /^\s*(\])/;
const MATCH_NAME    = /^\s*(\w+)\s*[:=]/;
const MATCH_VALUE   = /^\s*([^\]\s]+)/;
const MATCH_STRING  = /^\s*(["'])(.*?[^\\])\1/;

/**
 * CW Script Parser
 **/
export function parse(script) {
  const tokens = tokenize(script);

  /**
   * Parse Text
   **/
  function parseText() {
    const value = tokens.next(MATCH_TEXT);

    return value
      ? { name: 'play', value }
      : '';
  }

  /**
   * Parse Action
   **/
  function parseAction() {
    const name = tokens.next(MATCH_ACTION);

    if (!name) {
      return '';
    }
    try {
      const params = {};
      const action = { name, value: params };

      while (tokens.more()) {
        if (tokens.next(MATCH_CLOSE)) {
          return action;
        }
        const name = parseName(params);
        const value = parseValue(name);

        (name === 'as')
          ? action.as = value
          : params[name] = value;
      }
      throw new Error(`Missing "]"`);
    }
    catch (err) {
      throw new Error(`[${name}] ${err.message}`);
    }
  }

  /**
   * Parse Param Name
   **/
  function parseName(params) {
    const name = tokens.next(MATCH_NAME);
      
    if (!name) {
      throw new Error(`Malformed param`);
    }
    if (params[name]) {
      throw new Error(`Duplicate param "${name}"`);
    }
    return name;
  }

  /**
   * Parse Param Value
   **/
  function parseValue(name) {
    const value = parseAction()
      || tokens.next(MATCH_STRING)
      || tokens.next(MATCH_VALUE);

    if (!value) {
      throw new Error(`Invalid value "${name}"`);
    }
    return value;
  }

  /**
   * Main Parse Loop
   **/
  try {
    let actions = [];
    let action;

    while (tokens.more()) {
      if ((action = parseText())) {
        actions.push(action);
      }
      if ((action = parseAction())) {
        actions.push(action);
      }
    }
    return actions;
  }
  catch(err) {
    throw new Error(
      `${err.message} near "${tokens.near()}"`
    );
  }
}