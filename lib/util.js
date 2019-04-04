exports.mapToObj = function mapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
};

exports.objToMap = function objToMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
};


/**
 * The method parses a string as JSON, optionally transforming the value produced by parsing.
 * Unlike JSON.parse(), this returns Map instead of basic Object.
 */
exports.parseJsonToPlainObjects = function(text) {
  return JSON.parse(
    text, (key, value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.setPrototypeOf(value, null);
      }
      return value;
    }
  );
};
