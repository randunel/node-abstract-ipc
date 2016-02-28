'use strict';

const EventEmitter = require('events').EventEmitter;
const abs = require('abstract-socket');

module.exports = Object.freeze({server: serverFactory, send});

function serverFactory(name, messageHandler) {
    const events = new EventEmitter();
    const server = Object.freeze({
        events,
        stop
    });
    return new Promise((resolve, reject) => {
        const asServer = abs.createServer(connectionListener);
        asServer.on('error', reject);
        asServer.listen(`\0${name}`, () => {
            asServer.removeListener('error', reject);
            asServer.on('error', errorHandler);
            resolve(server);
        });

        function connectionListener(client) {
            client.on('error', err => events.emit('client error', err));

            let message = new Buffer(0);
            client.on('data', handleData);

            function handleData(data) {
                message = Buffer.concat([message, data], message.length + data.length);

                let parsed;
                try {
                    parsed = JSON.parse(message.toString());
                } catch(e) {
                    // Message still incoming
                    return;
                }

                client.removeListener('data', handleData);
                messageHandler(parsed.payload).then(response => {
                    sendResponse(response);
                })
                    .catch(err => {
                        sendError(err);
                    });

                function sendResponse(response) {
                    send({
                        payload: response
                    });
                }

                function sendError(err) {
                    send({
                        error: err
                    });
                }

                function send(res) {
                    client.write(res);
                    setImmediate(() => client.end());
                }
            }
        }

        function errorHandler(err) {
            events.emit('error', err);
        }
    });
}

function send(name, data) {
    return new Promise((resolve, reject) => {
        const message = {
            payload: data
        };
        const client = abs.connect(`\0${name}`);
        client.on('error', reject);
        client.on('data', handleData);
        client.write(JSON.stringify(message));

        let response = new Buffer(0);
        function handleData(data) {
            response = Buffer.concat([response, data], response.length + data.length);

            let parsed;
            try {
                parsed = JSON.parse(response.toString());
            } catch(e) {
                // Message still incoming
                return;
            }

            client.removeListener('data', handleData);
            if (parsed.error) {
            reject(parsed.error);
            } else {
            resolve(parsed.payload);
            }
        }
    });
}

function stop() {
}

