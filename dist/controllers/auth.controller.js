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
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const auth_validator_1 = require("../validator/auth.validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });
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
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });
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
            const newUser = yield db_1.prisma.user.upsert({
                where: {
                    email: check.data.email,
                },
                update: {
                    name: check.data.name,
                    password: hashedPassword,
                    role: "admin",
                },
                create: {
                    name: check.data.name,
                    email: check.data.email,
                    password: hashedPassword,
                    role: "admin",
                },
            });
            const user = {
                id: newUser.id,
                role: newUser.role,
            };
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });
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
