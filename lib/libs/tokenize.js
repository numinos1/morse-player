export function tokenize(script) {
    let remains = (script || '')
        .replace(/[\s\n\r]+/gm, ' ')
        .toLowerCase()
        .trim();
    function more() {
        return remains.length;
    }
    function near(message) {
        return remains.substring(0, 20);
    }
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
    return { more, next, near };
}
