const { isObject, isString } = require('../lib/helpers/check-types.helper');
const { transformMessages, interpolate } = require('./helpers/messages.helper');

function T9N(config) {
  this.messages = {
    en: {},
  };
  this.locale = 'en';
  this.fallbackLocale = 'en';

  if (isObject(config)) {
    if (config.hasOwnProperty('messages')) {
      this.setMessages(config.messages);
    }

    if (config.hasOwnProperty('locale')) {
      this.setLocale(config.locale);
    }

    if (config.hasOwnProperty('fallbackLocale')) {
      this.setFallbackLocale(config.fallbackLocale);
    }
  }
}

T9N.prototype.setMessages = function (messages) {
  if (!isObject(messages)) throw new Error('messages must be an object');

  this.messages = transformMessages(messages, {
    root: true,
  });
};

T9N.prototype.setLocaleMessages = function (locale, messages) {
  if (!isObject(messages)) throw new Error('messages must be an object');

  this.messages[locale] = transformMessages(messages);
};

T9N.prototype.getMessages = function () {
  return this.messages;
};

T9N.prototype.getLocaleMessages = function (locale) {
  if (!this.messages.hasOwnProperty(locale))
    throw new Error('locale not found');

  return this.messages[locale];
};

T9N.prototype.getLocale = function () {
  return this.locale;
};

T9N.prototype.setLocale = function (locale) {
  if (!isString(locale)) throw new Error('locale must be a string');

  this.locale = locale;
};

T9N.prototype.getFallbackLocale = function () {
  return this.fallbackLocale;
};

T9N.prototype.setFallbackLocale = function (fallbackLocale) {
  if (!isString(fallbackLocale))
    throw new Error('fallback locale must be a string');

  this.fallbackLocale = fallbackLocale;
};

T9N.prototype.translate = function (key, attrs, opt = {}) {
  const locale = opt.locale ?? this.locale;

  if (
    !this.messages[locale].hasOwnProperty(key) &&
    this.messages[this.fallbackLocale].hasOwnProperty(key)
  ) {
    console.warn(
      `key ${key} does not exists in locale '${locale}' use '${this.fallbackLocale}' fallback`
    );
  }

  const text =
    this.messages[locale][key] ?? this.messages[this.fallbackLocale][key];

  if (!text) {
    console.warn(`key ${key} does not exists in messages list`);

    return key;
  }

  if (attrs) {
    return interpolate(text, attrs);
  }
  return text;
};

module.exports = T9N;
