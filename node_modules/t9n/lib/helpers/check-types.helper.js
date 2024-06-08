function checkTypeof(type, val) {
  return typeof val === type;
}

exports.isObject = function isObject(val) {
  return checkTypeof('object', val);
};

exports.isFunction = function isFunction(val) {
  return checkTypeof('function', val);
};

exports.isString = function isString(val) {
  return checkTypeof('string', val);
};

exports.isArray = function isArray(val) {
  return Array.isArray(val);
};
