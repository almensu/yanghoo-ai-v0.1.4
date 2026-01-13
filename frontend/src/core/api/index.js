/**
 * Core API module - centralized exports
 * @module core/api
 */
export { default as http } from './http';
export { createWebSocket, createWS } from './websocket';
export * from './endpoints';
