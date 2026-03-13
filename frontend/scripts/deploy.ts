import { execSync } from "node:child_process";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const BUCKET_NAME = process.env.S3_BUCKET ?? "who-frontend-prod";
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const REGION = process.env.AWS_REGION ?? "us-west-1";
const DIST_DIR = join(import.meta.dirname, "..", "dist");

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".webp": "image/webp",
  ".map": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

function getContentType(filePath: string): string {
  return CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream";
}

function collectFiles(dir: string, base: string = ""): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const relativePath = base ? `${base}/${entry}` : entry;
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

async function clearBucket(s3: S3Client) {
  console.log("Clearing existing objects from bucket...");
  let continuationToken: string | undefined;
  do {
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      })
    );
    if (list.Contents?.length) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: list.Contents.map((obj) => ({ Key: obj.Key })),
          },
        })
      );
    }
    continuationToken = list.NextContinuationToken;
  } while (continuationToken);
}

async function uploadFiles(s3: S3Client) {
  const files = collectFiles(DIST_DIR);
  console.log(`Uploading ${files.length} files to s3://${BUCKET_NAME}/...`);

  const uploads = files.map((file) => {
    const filePath = join(DIST_DIR, file);
    const isHashed = /assets\//.test(file);
    return s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file,
        Body: readFileSync(filePath),
        ContentType: getContentType(file),
        CacheControl: isHashed
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      })
    );
  });

  await Promise.all(uploads);
  console.log("Upload complete.");
}

async function invalidateCache(cf: CloudFrontClient) {
  if (!DISTRIBUTION_ID) {
    console.log(
      "Skipping CloudFront invalidation (CLOUDFRONT_DISTRIBUTION_ID not set)."
    );
    return;
  }
  console.log(`Invalidating CloudFront distribution ${DISTRIBUTION_ID}...`);
  await cf.send(
    new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    })
  );
  console.log("Invalidation created.");
}

async function main() {
  console.log("Building frontend...");
  execSync("npm run build", { cwd: join(import.meta.dirname, ".."), stdio: "inherit" });

  const s3 = new S3Client({ region: REGION });
  const cf = new CloudFrontClient({ region: "us-east-1" });

  await clearBucket(s3);
  await uploadFiles(s3);
  await invalidateCache(cf);

  console.log("Deploy complete!");
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
