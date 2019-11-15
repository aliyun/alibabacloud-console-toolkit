const foo = process.env.REACT_APP_SC_ATTR;
const bar = process.env.SC_ATTR;
const baz = process && (process.env.REACT_APP_SC_ATTR || process.env.SC_ATTR);
