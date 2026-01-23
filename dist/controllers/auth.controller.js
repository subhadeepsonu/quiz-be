"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.adminLogin = adminLogin;
exports.register = register;
exports.verify = verify;
exports.forgotPassword = forgotPassword;
exports.verifyForgotPassword = verifyForgotPassword;
exports.start = start;
exports.verifyMagic = verifyMagic;
const auth_validator_1 = require("../validator/auth.validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const http_status_codes_1 = require("http-status-codes");
const email_1 = require("../services/email");
const magicLogin_1 = require("../services/magicLogin");
function signJwt(user) {
    return jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, { expiresIn: "30d" });
}
function getFrontendBaseUrl() {
    return process.env.FRONTEND_BASE_URL || "http://localhost:3001";
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function randomPassword() {
    // Generate an 8-character password with letters and numbers
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = auth_validator_1.loginValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const checkUser = yield db_1.prisma.user.findUnique({
                where: {
                    email: check.data.email,
                },
            });
            if (!checkUser) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    error: "User not found",
                });
                return;
            }
            const validPassword = bcryptjs_1.default.compareSync(check.data.password, checkUser.password);
            if (!validPassword) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    error: "Invalid password",
                });
                return;
            }
            const user = {
                id: checkUser.id,
                role: checkUser.role,
            };
            const token = signJwt(user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Login successful",
                token: token,
            });
            return;
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function adminLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = auth_validator_1.loginValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    message: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const checkUser = yield db_1.prisma.user.findUnique({
                where: {
                    email: check.data.email,
                },
            });
            if (!checkUser) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    message: "User not found",
                });
                return;
            }
            if (checkUser.role !== "admin" && checkUser.role !== "editor") {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    message: "User is not an admin or editor",
                });
                return;
            }
            const validPassword = bcryptjs_1.default.compareSync(check.data.password, checkUser.password);
            if (!validPassword) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    message: "Invalid password",
                });
                return;
            }
            const user = {
                id: checkUser.id,
                role: checkUser.role,
            };
            const token = signJwt(user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Login successful",
                token: token,
            });
            return;
        }
        catch (error) {
            console.log(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = auth_validator_1.registerValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const existingUser = yield db_1.prisma.user.findUnique({
                where: {
                    email: check.data.email,
                },
            });
            if (existingUser) {
                res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                    error: "User already exists",
                });
                return;
            }
            const hashedPassword = bcryptjs_1.default.hashSync(check.data.password, 10);
            const newUser = yield db_1.prisma.user.create({
                data: {
                    name: check.data.name,
                    email: check.data.email,
                    password: hashedPassword,
                    role: "user",
                },
            });
            const user = {
                id: newUser.id,
                role: newUser.role,
            };
            const token = signJwt(user);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "User registered successfully",
                token: token,
            });
            return;
        }
        catch (error) {
            console.log(error);
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function verify(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: implement logic
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: implement logic
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function verifyForgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: implement logic
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function start(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const emailRaw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email;
            if (!emailRaw || typeof emailRaw !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Email is required" });
                return;
            }
            const email = normalizeEmail(emailRaw);
            const now = new Date();
            let user = yield db_1.prisma.user.findUnique({ where: { email } });
            let password;
            let isNewUser = false;
            if (!user) {
                // Create new user with random password
                password = randomPassword();
                const hashed = bcryptjs_1.default.hashSync(password, 10);
                const name = email.split("@")[0] || "User";
                user = yield db_1.prisma.user.create({
                    data: {
                        email,
                        name,
                        password: hashed,
                        role: "user",
                    },
                });
                isNewUser = true;
            }
            else {
                // Existing user - generate new password
                password = randomPassword();
                const hashed = bcryptjs_1.default.hashSync(password, 10);
                // Simple anti-spam: one email per 60s per account
                if (user.magicLoginLastSentAt) {
                    const diffMs = now.getTime() - new Date(user.magicLoginLastSentAt).getTime();
                    if (diffMs < 60000) {
                        res.status(http_status_codes_1.StatusCodes.OK).json({ message: "If that email exists, we sent login credentials." });
                        return;
                    }
                }
                // Update password
                yield db_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        password: hashed,
                        magicLoginLastSentAt: now, // Reuse this field for rate limiting
                    },
                });
            }
            // Include flow in login URL if provided
            const flow = (_b = req.body) === null || _b === void 0 ? void 0 : _b.flow;
            let loginUrl = `${getFrontendBaseUrl()}/auth/login`;
            if (flow && typeof flow === "string") {
                loginUrl += `?flow=${encodeURIComponent(flow)}`;
            }
            yield (0, email_1.sendPasswordEmail)({ to: email, password, loginUrl });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: isNewUser
                    ? "Account created! Check your email for login credentials."
                    : "If that email exists, we sent login credentials."
            });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
function verifyMagic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.body) === null || _a === void 0 ? void 0 : _a.token;
            if (!token || typeof token !== "string") {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Token is required" });
                return;
            }
            const tokenHash = (0, magicLogin_1.hashMagicToken)(token);
            const now = new Date();
            const user = yield db_1.prisma.user.findFirst({
                where: {
                    magicLoginTokenHash: tokenHash,
                    magicLoginExpiresAt: { gt: now },
                },
                select: {
                    id: true,
                    role: true,
                },
            });
            if (!user) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Invalid or expired token" });
                return;
            }
            // One-time use
            yield db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    magicLoginTokenHash: null,
                    magicLoginExpiresAt: null,
                },
            });
            const jwtToken = signJwt({ id: user.id, role: user.role });
            res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Login successful", token: jwtToken });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
