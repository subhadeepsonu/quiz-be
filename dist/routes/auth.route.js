"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authRouter = (0, express_1.Router)();
const startLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRouter.post("/login", auth_controller_1.login);
exports.authRouter.post("/admin/login", auth_controller_1.adminLogin);
exports.authRouter.post("/register", auth_controller_1.register);
exports.authRouter.post("/start", startLimiter, auth_controller_1.start);
exports.authRouter.post("/magic/verify", auth_controller_1.verifyMagic);
exports.authRouter.post("/verify", auth_controller_1.verify);
exports.authRouter.post("/forgot-password", auth_controller_1.forgotPassword);
exports.authRouter.post("/verify-forgot-password", auth_controller_1.verifyForgotPassword);
