'use strict';

require('should-sinon');
const sinon = require('sinon');
const aipc = require('../index.js');

const SOCKET_NAME = 'test312';

describe('ipc server', () => {
    let server;
    afterEach(() => server.close());

    it('should emit event on message', () => {
        const listener = sinon.spy();
        aipc.server(SOCKET_NAME, () => Promise.resolve().then(listener))
            .then(_server => {
                server = _server;
                return aipc.send(SOCKET_NAME, 'hello')
                    .then(() => listener.should.be.calledOnce());
            });
    });

    it('should emit event with message contents', () => {
        const listener = sinon.spy();
        aipc.server(SOCKET_NAME, () => Promise.resolve().then(listener))
            .then(_server => {
                server = _server;
                return aipc.send(SOCKET_NAME, 'hello')
                    .then(() => listener.should.be.calledWith('hello'));
            });
    });

    it('should return error when rejecting', () => {
        const listener = sinon.spy();
        aipc.server(SOCKET_NAME, () => Promise.reject(new Error('test')))
            .then(_server => {
                server = _server;
                return aipc.send(SOCKET_NAME, 'hello')
                    .then(() => listener.should.not.be.called())
                    .catch(err => err.message.should.equal('test'));
            });
    });
});

