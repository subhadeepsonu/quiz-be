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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireQuizAccess = requireQuizAccess;
const http_status_codes_1 = require("http-status-codes");
const entitlements_1 = require("../services/entitlements");
function getDiagnosticQuizId() {
    return process.env.DIAGNOSTIC_QUIZ_ID || null;
}
function requireQuizAccess() {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }
            const quizId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.params) === null || _b === void 0 ? void 0 : _b.quizId) || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.quizId);
            if (!quizId || typeof quizId !== "string") {
                next();
                return;
            }
            const ent = yield (0, entitlements_1.computeEntitlements)(userId);
            if (!ent) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }
            if (ent.accessLevel !== "DIAGNOSTIC_ONLY") {
                next();
                return;
            }
            const diagnosticId = getDiagnosticQuizId();
            // If not configured yet, don't hard-block the whole product in beta.
            // Set DIAGNOSTIC_QUIZ_ID to enforce diagnostic-only access.
            if (!diagnosticId) {
                next();
                return;
            }
            if (diagnosticId && quizId === diagnosticId) {
                next();
                return;
            }
            res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                error: "Subscription required",
            });
        }
        catch (err) {
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
