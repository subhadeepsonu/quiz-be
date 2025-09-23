"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware/middleware");
const upload_controller_1 = require("../controllers/upload.controller");
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.post("/", (0, middleware_1.middleware)(["admin"]), upload_controller_1.generatePresignedUrl);
