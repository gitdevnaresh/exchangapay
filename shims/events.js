const EventEmitterModule = require("react-native/Libraries/vendor/emitter/EventEmitter");
const EventEmitter = EventEmitterModule.default || EventEmitterModule;

module.exports = EventEmitter;
module.exports.EventEmitter = EventEmitter;
