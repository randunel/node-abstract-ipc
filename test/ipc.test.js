'use strict';

require('should-sinon');
const sinon = require('sinon');
const aipc = require('../index.js');

const SOCKET_NAME = 'test312';

describe('ipc server', () => {
    let server;
    afterEach(() => server.stop());

    it('should emit event on message', () => {
        const listener = sinon.spy();
        aipc.server(SOCKET_NAME, () => Promise.resolve().then(listener))
            .then(_server => {
                server = _server;
                return aipc.send(SOCKET_NAME, 'hello')
                    .then(() => listener.should.be.calledOnce() && listener.calledWith.should.be('hello'));
            });
    });
});

