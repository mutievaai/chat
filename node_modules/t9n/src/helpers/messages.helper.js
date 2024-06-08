const { isString } = require('../../lib/helpers/check-types.helper');

exports.transformMessages = function transformMessages(messages, opts = {}) {
  const { root = false } = opts;
  const init = opts.init ?? {};

  return Object.entries(messages).reduce((res, [prop, val]) => {
    if (isString(val)) {
      res[opts.prefix ? `${opts.prefix}.${prop}` : prop] = val;

      return res;
    }

    if (root) {
      res[prop] = transformMessages(val);

      return res;
    }

    return transformMessages(val, {
      prefix: opts.prefix ? `${opts.prefix}.${prop}` : prop,
      init: res,
    });
  }, init);
};

exports.interpolate = function (text, attrs) {
  return Object.keys(attrs).reduce(
    (res, current) => res.replace(`{${current}}`, attrs[current]),
    text
  );
};
