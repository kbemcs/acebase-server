"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
// If one executes "node start.js [dbname=name] [host=ip] [port=nr]"
function getVariable(name, defaultValue) {
    // Checks if an argument with the name was passed, 
    // or if an environment variable was set with that name,
    // else it will return the default value
    name = name.toUpperCase();
    const arg = process.argv.find(arg => arg.toUpperCase().startsWith(`${name}=`));
    if (arg) {
        return arg.split('=')[1];
    }
    if (typeof process.env[name] !== 'undefined') {
        return process.env[name];
    }
    return defaultValue;
}
;
const path = getVariable('DBPATH', '.');
const dbname = getVariable('DBNAME', 'default');
const host = getVariable('HOST', 'localhost'); // '0.0.0.0'
const port = +getVariable('PORT', 3000);
const ipcPort = +getVariable('IPC_PORT', 0);
const options = { host, port, path };
if (ipcPort > 0) {
    const role = getVariable('IPC_ROLE');
    if (!['master', 'worker'].includes(role)) {
        throw new Error('IPC_ROLE must be either "master" or "worker"');
    }
    options.ipc = {
        host: getVariable('IPC_HOST'),
        port: ipcPort,
        ssl: +getVariable('IPC_SSL', 0) === 1,
        token: getVariable('IPC_TOKEN'),
        role
    };
}
if (+getVariable('TXLOG', 0) === 1) {
    options.transactions = {
        log: true,
        maxAge: +getVariable('TXDAYS', 30)
    };
}
const server = new server_1.AceBaseServer(dbname, options);
server.once("ready", () => {
    var _a;
    server.debug.log(`AceBase server running`);
    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready'); // When using pm2, you can use --wait-ready flag (see https://pm2.keymetrics.io/docs/usage/signals-clean-restart/)
});
//# sourceMappingURL=start.js.map