# t9n

Simple translation library.

- [https://github.com/ibrahimalanshor/t9n](https://github.com/ibrahimalanshor/t9n)
- [https://www.npmjs.com/package/t9n](https://www.npmjs.com/package/t9n)

## Instalation

```bash
npm install t9n
```

## Usage

### 1. Simple Usage

Prepare `messages.json` file

```json
{
  "en": {
    "hello": "Hello"
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Translate Key
console.log(t9n.translate('hello')); // Hello
```

> You can also set messages via constructor : `new T9N({ messages: require('./messages.json')`
> You can also set messages for a specific locale via the `setLocaleMessages` method : `new T9N().setLocaleMessage('en', require('./en.json')`

---

### 2. Nested Key

Prepare `messages.json` file

```json
{
  "en": {
    "action": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Translate
console.log(t9n.translate('action.save')); // Save
console.log(t9n.translate('action.cancel')); // Cancel
```

---

### 3. Interpolate Key

Prepare `messages.json` file

```json
{
  "en": {
    "prompt": "Hi {name}, i am {me}"
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Translate
console.log(
  t9n.translate('prompt', {
    name: 'Jhon',
    me: 'Deff',
  })
); // Hi Jhon, i am Deff
```

---

### 4. Change Locale

Prepare `messages.json` file

```json
{
  "en": {
    "hello": "Hello"
  },
  "id": {
    "hello": "Halo gan"
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Set Locale
t9n.setLocale('id');

// Translate Key
console.log(t9n.translate('hello')); // Halo gan
```

---

### 5. Override Default Locale

Prepare `messages.json` file

```json
{
  "en": {
    "hello": "Hello"
  },
  "id": {
    "hello": "Halo gan"
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Translate Key
console.log(t9n.translate('hello'), {}, { locale: 'id' }); // Halo gan
```

---

### 6. Fallback Locale

Prepare `messages.json` file

```json
{
  "en": {
    "hello": "Hello",
    "greet": "Good Morning"
  },
  "id": {
    "hello": "Halo gan"
  }
}
```

Use it in `index.js`

```js
const T9N = require('t9n');

const t9n = new T9N();

// Add Messages
t9n.setMessages(require('./messages.json'));

// Set Locale
t9n.setLocale('id');

// Set Fallback Locale (default en)
t9n.setFallbackLocale('en');

// Translate Key
console.log(t9n.translate('hello')); // Halo gan
console.log(t9n.translate('greet')); // Good Morning
```

---

## API

### new T9N(options)

- **Return** : Object - T9N instance
- **Params**
  - options : Object (optional)
    - options.messages : Object (message list)
    - options.locale : String (set locale, default en)
    - options.fallbackLocale : String (set fallback locale, default en)

### getMessages

- **Return** : Object - message list

### setMessages

- **Params**
  - messages : Object (set message list, required)

### getLocaleMessages

- **Return** : Object - locale message list

### setLocaleMessages

- **Params**
  - locale : String (locale name, required)
    - messages : Object (set message list, required)

### getLocale

- **Return** String - Current Locale

### setLocale

- **Params**
  - locale : String (set locale, required)

### getFallbackLocale

- **Return** String - Current Fallback Locale

### setFallbackLocale

- **Params**
  - fallbackLocale : String (set fallback locale, required)

### translate

- **Return** String - Translated key
- **Params**
  - key : String (required)
  - interpolateValues : Object (optional)
  - options : Object
    - locale : String (Override Current Locale)
