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
exports.runTrialExpirySweep = runTrialExpirySweep;
const db_1 = require("../db");
const email_1 = require("./email");
function getFrontendBaseUrl() {
    return process.env.FRONTEND_BASE_URL || "http://localhost:3001";
}
function runTrialExpirySweep() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const expired = yield db_1.prisma.user.findMany({
            where: {
                trialEndsAt: { lt: now },
                trialEndedEmailSentAt: null,
                trialUsedAt: { not: null },
            },
            select: { id: true, email: true },
            take: 200,
        });
        if (expired.length === 0)
            return;
        // Beta: simple email with a link to pricing.
        yield Promise.all(expired.map((u) => __awaiter(this, void 0, void 0, function* () {
            const url = `${getFrontendBaseUrl()}/pricing`;
            yield (0, email_1.sendTrialEndedEmail)({ to: u.email, pricingUrl: url });
            yield db_1.prisma.user.update({
                where: { id: u.id },
                data: { trialEndedEmailSentAt: now },
            });
        })));
    });
}
