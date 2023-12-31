import { tokenize } from './tokenize';
const MATCH_TEXT = /^([^\[]+)/;
const MATCH_ACTION = /^\s*\[\s*(\w+)/;
const MATCH_CLOSE = /^\s*(\])/;
const MATCH_NAME = /^\s*(\w+)\s*[:=]/;
const MATCH_VALUE = /^\s*([^\]\s]+)/;
const MATCH_STRING = /^\s*(["'])(.*?[^\\])\1/;
export function parse(script) {
    const tokens = tokenize(script);
    function parseText() {
        const value = tokens.next(MATCH_TEXT);
        return value
            ? { name: 'play', value, as: '' }
            : undefined;
    }
    function parseAction() {
        const name = tokens.next(MATCH_ACTION);
        if (!name) {
            return undefined;
        }
        try {
            const params = {};
            const action = {
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
    function parseValue(name) {
        const value = parseAction()
            || tokens.next(MATCH_STRING)
            || tokens.next(MATCH_VALUE);
        if (!value) {
            throw new Error(`Invalid value "${name}"`);
        }
        return value;
    }
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
    catch (err) {
        throw new Error(`${err.message} near "${tokens.near()}"`);
    }
}
