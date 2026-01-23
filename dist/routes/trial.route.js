"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trialRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware/middleware");
const trial_controller_1 = require("../controllers/trial.controller");
exports.trialRouter = (0, express_1.Router)();
exports.trialRouter.post("/start", (0, middleware_1.middleware)(["user", "admin", "editor"]), trial_controller_1.startTrial);
