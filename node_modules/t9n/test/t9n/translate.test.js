const { expect } = require('chai');
const { describe } = require('mocha');
const T9N = require('../../src/t9n');
const messages = require('./resources/messages.json');

describe('translate test', () => {
  it('should have translate method', () => {
    expect(new T9N().translate).not.to.be.undefined;
    expect(new T9N().translate).to.be.a('function');
  });

  it('should return key not found', () => {
    expect(new T9N().translate('hello')).to.equal('hello');
  });

  it('should translate a key', () => {
    expect(new T9N({ messages }).translate('hello')).to.equal(
      messages.en.hello
    );
  });

  it('should translate nested key', () => {
    expect(new T9N({ messages }).translate('greet')).to.equal(
      messages.en.greet
    );
  });

  it('should translate interpolated key', () => {
    const t9n = new T9N({ messages });

    expect(
      t9n.translate('action.ask', { question: 'go to the toilet' })
    ).to.equal('I want to go to the toilet');
    expect(
      t9n.translate('action.prompt', {
        name: 'jhon',
        input: 'age',
        answer: 'ok',
      })
    ).to.equal('Hi jhon, please enter your age');
  });

  it('should use override default locale', () => {
    const t9n = new T9N({ messages });

    expect(t9n.translate('hello', {}, { locale: 'id' })).to.equal(
      messages.id.hello
    );
    expect(t9n.translate('greet', {}, { locale: 'id' })).to.equal(
      messages.id.greet
    );
  });

  it('should use fallback locale if key is not found', () => {
    const t9n = new T9N({ messages, locale: 'id' });

    expect(t9n.translate('action.click')).to.equal(messages.en.action.click);
  });

  it('should return raw key on key not found', () => {
    const t9n = new T9N({ messages });

    expect(t9n.translate('not-found')).equal('not-found');
    expect(t9n.translate('action.close')).equal('action.close');
  });
});
