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
exports.middleware = middleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function middleware(requiredRole) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                res
                    .status(401)
                    .json({ message: "Unauthorized: Token missing or invalid" });
                return;
            }
            const token = authHeader;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.role) {
                res.status(401).json({ message: "Unauthorized: Invalid token" });
                return;
            }
            if (requiredRole.includes(decoded.role)) {
                req.body.user = decoded;
                next();
                return;
            }
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
        }
        catch (error) {
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
            return;
        }
    });
}
