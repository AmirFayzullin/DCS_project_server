const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {WEB_SOCKET_SERVER_PORT} = require("../config");

/**
 * messages format
 * {
 *     event: string - describes endpoint,
 *     payload: Object
 * }
 */

const SOCKET_EVENTS = {
    ID_ASSIGNMENT: "ID_ASSIGNMENT",
    PROCESSING_FINISHED: "PROCESSING_FINISHED"
};

class SocketServer {
    _connectionsPool = {};
    constructor(server) {
        this._server = server;

        this._server.on('connection', this._onConnect.bind(this));
    }

    _onConnect(ws) {
        const id = (Math.random() * Math.pow(10, 10)).toFixed(0);
        this._connectionsPool[id] = ws;
        this.send(id, SOCKET_EVENTS.ID_ASSIGNMENT, {id});

        this.onConnect(id);

        ws.on('message', msg => this.onMessage(id, msg));

        ws.on('error', error => this.onError(id, error));

        ws.on('close', params => this.onClose(id, params));
    }

    onMessage(id, msg) {
        console.log(msg);
    };

    onError(id, error) {
        console.log(error);
    }

    onClose(id, params) {
        delete this._connectionsPool[id];
        console.log(`Connection ${id} closed`);
    }

    onConnect(id) {
        console.log(`Connection with id ${id} established`);
    }

    send(id, event, payload) {
        this._connectionsPool[id].send(JSON.stringify({event, payload}));
    }
}

class AppSocketServer extends SocketServer {
    constructor(server) {
        super(server);
    }

    notifyProcessingFinished(id, status) {
        try {
            this.send(id, SOCKET_EVENTS.PROCESSING_FINISHED, {status});
        } catch(err) {
            console.log("[AppSocketServer]: Error - " + err);
        }
    }
}

function run() {
    const app = express();

    const httpServer = http.createServer(app);

    const webSocketServer = new WebSocket.Server({server: httpServer});

    const socketServer = new AppSocketServer(webSocketServer);

    httpServer.listen(WEB_SOCKET_SERVER_PORT, () => {
        console.log(`WS Server started on port ${WEB_SOCKET_SERVER_PORT}`)
    });

    return socketServer;
}

module.exports = {run};