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
exports.startTrial = startTrial;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const entitlements_1 = require("../services/entitlements");
function startTrial(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }
            const now = new Date();
            const user = yield db_1.prisma.user.findUnique({
                where: { id: userId },
                select: { trialUsedAt: true, trialEndsAt: true },
            });
            if (!user) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "User not found" });
                return;
            }
            if (user.trialUsedAt) {
                res.status(http_status_codes_1.StatusCodes.CONFLICT).json({ error: "Trial already used" });
                return;
            }
            // If already subscribed, there's no need for a trial.
            const ent = yield (0, entitlements_1.computeEntitlements)(userId);
            if (ent === null || ent === void 0 ? void 0 : ent.hasActiveSubscription) {
                res.status(http_status_codes_1.StatusCodes.CONFLICT).json({ error: "Already subscribed" });
                return;
            }
            const trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60000);
            yield db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    trialUsedAt: now,
                    trialStartedAt: now,
                    trialEndsAt,
                },
            });
            const updated = yield (0, entitlements_1.computeEntitlements)(userId);
            res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Trial started", data: updated });
        }
        catch (error) {
            console.error(error);
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    });
}
