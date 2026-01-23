"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMagicToken = generateMagicToken;
exports.hashMagicToken = hashMagicToken;
const crypto_1 = __importDefault(require("crypto"));
function generateMagicToken() {
    // URL-safe token
    return crypto_1.default.randomBytes(32).toString("base64url");
}
function hashMagicToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
