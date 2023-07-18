/**
 * Tokenize
 **/
export function tokenize(script) {
  let remains = (script || '')
    .replace(/[\s\n\r]+/gm, ' ')
    .toLowerCase()
    .trim();
 
  /**
   * Are there still more tokens?
   **/
  function more() {
    return remains.length;
  }

   /**
   * Return stub of remains fragment
   **/
   function near(message) {
    return remains.substring(0, 20);
  }

  /**
   * Attempt to match next token
   **/
  function next(regex) {
    if (more()) {
      const parts = remains.match(regex);

      if (parts) {
        const len = parts[0].length;
        const token = parts[parts.length - 1];

        remains = remains.substring(len);

        return token;
      }
    }
    return '';
  }

  /**
   * Return object
   **/
  return { more, next, near };
}