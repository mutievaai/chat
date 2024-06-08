const { expect } = require('chai');
const { describe, it } = require('mocha');
const T9N = require('../../src/t9n');
const messages = require('./resources/messages.json');

describe('messages test', () => {
  describe('global messages', () => {
    it('should return all messages', () => {
      const t9n = new T9N();

      expect(t9n.getMessages).not.to.be.undefined;
      expect(t9n.getMessages).to.be.a('function');

      expect(t9n.getMessages()).to.be.a('object');
    });

    it('should set messages from constructor arguments', () => {
      const t9n = new T9N({
        messages,
      });

      expect(t9n.getMessages()).to.have.property('en');
      expect(t9n.getMessages()).to.have.property('id');
    });

    it('should set messages from setMessages method', () => {
      const t9n = new T9N();

      expect(t9n.setMessages).not.to.be.undefined;
      expect(t9n.setMessages).to.be.a('function');

      t9n.setMessages(messages);

      expect(t9n.getMessages()).to.have.property('en');
      expect(t9n.getMessages()).to.have.property('id');
    });

    it('should throw error on set invalid messages argument', () => {
      expect(() => new T9N({ messages: 'string' })).to.throw();
      expect(() => new T9N().setMessages('string')).to.throw();
    });
  });

  describe('locale messages', () => {
    it('should set locale messages from setLocaleMessages method', () => {
      const messages = {
        en: {
          hello: 'Halo',
        },
      };
      const t9n = new T9N();

      expect(t9n.setLocaleMessages).not.to.be.undefined;
      expect(t9n.setLocaleMessages).to.be.a('function');

      t9n.setLocaleMessages('en', messages.en);

      expect(t9n.getMessages()).to.have.property('en');
    });

    it('should get locale messages from getLocaleMessages method', () => {
      const messages = {
        en: {
          hello: 'Halo',
        },
      };
      const t9n = new T9N({ messages });

      expect(t9n.getLocaleMessages).not.to.be.undefined;
      expect(t9n.getLocaleMessages).to.be.a('function');

      expect(t9n.getMessages()).to.have.property('en');
    });

    it('should throw error on set invalid locale messages argument', () => {
      expect(() => new T9N().setLocaleMessages('en', 'string')).to.throw();
    });

    it('should throw error on get invalid locale name', () => {
      expect(() => new T9N().getLocaleMessages()).to.throw();
    });
  });
});
