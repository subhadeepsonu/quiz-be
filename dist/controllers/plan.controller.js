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
exports.getAllPlan = getAllPlan;
exports.createPlan = createPlan;
exports.updatePlan = updatePlan;
exports.deletePlan = deletePlan;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const plan_validator_1 = require("../validator/plan.validator");
function getAllPlan(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const plans = yield db_1.prisma.plan.findMany({
                where: {
                    isActive: true,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Plans fetched successfully",
                data: plans,
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
function createPlan(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const check = plan_validator_1.PlanValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const plan = yield db_1.prisma.plan.create({
                data: {
                    name: check.data.name,
                    price: check.data.price,
                    duration: check.data.duration,
                    description: check.data.description,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "Plan created successfully",
                data: plan,
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
function updatePlan(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const id = req.params.id;
            const check = plan_validator_1.PlanValidator.safeParse(body);
            if (!check.success) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: "Invalid request body",
                    details: check.error.errors,
                });
                return;
            }
            const checkPlan = yield db_1.prisma.plan.findUnique({
                where: {
                    id: id,
                    isActive: true,
                },
            });
            if (!checkPlan) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Plan not found",
                });
                return;
            }
            const plan = yield db_1.prisma.plan.update({
                where: {
                    id: id,
                },
                data: {
                    name: check.data.name,
                    price: check.data.price,
                    duration: check.data.duration,
                    description: check.data.description,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Plan updated successfully",
                data: plan,
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
function deletePlan(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const checkPlan = yield db_1.prisma.plan.findUnique({
                where: {
                    id: id,
                    isActive: true,
                },
            });
            if (!checkPlan) {
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                    error: "Plan not found",
                });
                return;
            }
            yield db_1.prisma.plan.update({
                where: {
                    id: id,
                },
                data: {
                    isActive: false,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Plan deleted successfully",
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
