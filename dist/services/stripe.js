"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripe = getStripe;
const stripe_1 = __importDefault(require("stripe"));
function requiredEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
function getStripe() {
    const key = requiredEnv("STRIPE_SECRET_KEY");
    // Keep a pinned API version for predictable webhook payloads.
    return new stripe_1.default(key, { apiVersion: "2025-12-15.clover" });
}
