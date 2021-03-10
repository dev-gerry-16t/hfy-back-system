const expressions = require("angular-expressions");
const assign = require("lodash/assign");

const replaceConditionsDocx = (tag) => {
  if (tag === ".") {
    return {
      get: (s) => {
        return s;
      },
    };
  }
  const expr = expressions.compile(
    tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"')
  );
  return {
    get: (scope, context) => {
      let obj = {};
      const scopeList = context.scopeList;
      const num = context.num;
      for (let i = 0, len = num + 1; i < len; i++) {
        obj = assign(obj, scopeList[i]);
      }
      return expr(scope, obj);
    },
  };
};

module.exports = replaceConditionsDocx;
