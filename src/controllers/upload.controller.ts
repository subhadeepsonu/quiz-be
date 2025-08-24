import { Request, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: "https://mfimptmujqalltgryglj.storage.supabase.co",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function generatePresignedUrl(req: Request, res: Response) {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      res.status(400).json({ error: "Missing fileName or fileType" });
      return;
    }

    const key = `uploads/${Date.now()}-${fileName}`;

    const params: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({
      2: signedUrl,
      key,
    });
    return;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}
