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
exports.generatePresignedUrl = generatePresignedUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const bucketName = process.env.S3_BUCKET_NAME;
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    endpoint: "https://mfimptmujqalltgryglj.storage.supabase.co",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});
function generatePresignedUrl(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fileName, fileType } = req.body;
            if (!fileName || !fileType) {
                res.status(400).json({ error: "Missing fileName or fileType" });
                return;
            }
            const key = `uploads/${Date.now()}-${fileName}`;
            const params = {
                Bucket: bucketName,
                Key: key,
                ContentType: fileType,
            };
            const command = new client_s3_1.PutObjectCommand(params);
            const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 300 });
            res.json({
                2: signedUrl,
                key,
            });
            return;
        }
        catch (error) {
            console.error("Error generating pre-signed URL:", error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
    });
}
