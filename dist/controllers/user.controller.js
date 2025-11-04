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
exports.getAllUser = getAllUser;
exports.getMe = getMe;
exports.getUser = getUser;
exports.createUser = createUser;
exports.ChangeRole = ChangeRole;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_validator_1 = require("../validator/auth.validator");
function getAllUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const users = yield db_1.prisma.user.findMany({
                skip: skip,
                take: limit,
            });
            const totalUsers = yield db_1.prisma.user.count({});
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Users fetched successfully",
                data: users,
                pagination: {
                    total: totalUsers,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(totalUsers / limit),
                },
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
function getMe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.userId;
            const me = yield db_1.prisma.user.findUnique({
                where: { id },
                select: {
                    role: true,
                    name: true,
                },
            });
            if (!me) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    message: "user not found",
                });
                return;
            }
            res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({
                message: "user verifed",
                data: me,
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
function getUser(req, res) {
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
function createUser(req, res) {
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
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: "Internal Server Error" });
            return;
        }
    });
}
function ChangeRole(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const id = req.params.id;
            if (body.role != client_1.Role.admin && body.role != client_1.Role.user) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    message: "Invalid request",
                });
                return;
            }
            const user = yield db_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    message: "User not found",
                });
                return;
            }
            yield db_1.prisma.user.update({
                where: { id },
                data: {
                    role: body.role,
                },
            });
            res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({
                message: "User updated",
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
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const body = req.body;
            if (body.role != client_1.Role.admin || body.role != client_1.Role.user) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Invalid role" });
                return;
            }
            const check = yield db_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!check) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "User not found" });
                return;
            }
            const updatedUser = yield db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    role: body.role,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "User role updated successfully",
                data: updatedUser,
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
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            const user = yield db_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "User not found" });
                return;
            }
            yield db_1.prisma.user.delete({
                where: { id: userId },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "User deleted successfully",
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
