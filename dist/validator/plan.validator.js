"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanValidator = void 0;
const zod_1 = __importDefault(require("zod"));
exports.PlanValidator = zod_1.default.object({
    name: zod_1.default.string(),
    price: zod_1.default.number(),
    duration: zod_1.default.number().min(1),
    description: zod_1.default.string(),
});
