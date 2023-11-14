import { tokenize } from './tokenize';

const MATCH_TEXT    = /^([^\[]+)/;
const MATCH_ACTION  = /^\s*\[\s*(\w+)/;
const MATCH_CLOSE   = /^\s*(\])/;
const MATCH_NAME    = /^\s*(\w+)\s*[:=]/;
const MATCH_VALUE   = /^\s*([^\]\s]+)/;
const MATCH_STRING  = /^\s*(["'])(.*?[^\\])\1/;

/**
 * Parsed Value
 **/
export type TParseValue = (string | Record<string, any>);

/**
 * Parsed Result
 **/
export interface TParseAction {
  name: string;           // play, set, audio, <action>
  value: TParseValue;     // string or object (perhaps nested)
  as: string;             // reference value later on as this name
}

/**
 * CW Script Parser
 * 
 * Parse takes a string as input and converts it into an array of 
 * result objects that have a name, value (and optionally as). The
 * parsed results will be consumed by render().
 **/
export function parse(script: string): TParseAction[] {
  const tokens = tokenize(script);

  /**
   * Parse Text
   **/
  function parseText(): TParseAction | undefined {
    const value = tokens.next(MATCH_TEXT);

    return value
      ? { name: 'play', value, as: '' }
      : undefined;
  }

  /**
   * Parse Action
   **/
  function parseAction(): TParseAction | undefined {
    const name = tokens.next(MATCH_ACTION);

    if (!name) {
      return undefined;
    }
    try {
      const params = {};
      const action: TParseAction = {
        name,
        value: params,
        as: ''
      };

      while (tokens.more()) {
        if (tokens.next(MATCH_CLOSE)) {
          return action;
        }
        const name = parseName(params);
        const value = parseValue(name);

        if (name === 'as') {
          if (typeof value !== 'string') {
            throw new Error(`Value must be a string as=${value}`);
          }
          action.as = value;
        }
        else {
          params[name] = value;
        }
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
  function parseName(params: Record<string, any>): string {
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
  function parseValue(name: string) {
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
    let actions: TParseAction[] = [];
    let action: TParseAction;

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