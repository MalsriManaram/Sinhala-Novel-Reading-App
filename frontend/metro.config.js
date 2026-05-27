const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow serving from behind the Kubernetes ingress (no host check)
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => middleware;

module.exports = config;
