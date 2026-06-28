import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSessionUser } from '@/lib/auth';

const cleanEnvVar = (val) => {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

export async function POST(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const rawBucketName = process.env.AWS_BUCKET_NAME || '';
    const bucketName = cleanEnvVar(rawBucketName);
    if (!bucketName) {
      return NextResponse.json({ error: 'AWS Bucket Name is not configured on the server' }, { status: 500 });
    }

    // Clean keys and region
    const accessKeyId = cleanEnvVar(process.env.AWS_ACCESS_KEY_ID || '');
    const secretAccessKey = cleanEnvVar(process.env.AWS_SECRET_ACCESS_KEY || '');
    const region = cleanEnvVar(process.env.AWS_REGION || 'us-east-1');

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json({ error: 'AWS S3 credentials are not configured on the server' }, { status: 500 });
    }

    // Dynamically initialize client with clean values
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic clean key name
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `uploads/${timestamp}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    });

    await s3Client.send(command);

    // Construct the public S3 URL
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

    return NextResponse.json({ success: true, url: s3Url });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file to S3' }, { status: 500 });
  }
}
