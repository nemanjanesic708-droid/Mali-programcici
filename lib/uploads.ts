import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadsDirectory = path.join(process.cwd(), "public", "uploads");

async function saveImageUpload(file: File) {
  if (!file || file.size === 0) {
    console.info("[Warranty Tracker] Upload skipped because file is empty");
    return null;
  }

  await mkdir(uploadsDirectory, { recursive: true });

  const extension = path.extname(file.name || "").toLowerCase();
  const safeExtension = extension && extension.length <= 6 ? extension : ".jpg";
  const fileName = `${randomUUID()}${safeExtension}`;
  const filePath = path.join(uploadsDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  console.info("[Warranty Tracker] File saved", {
    originalName: file.name,
    savedAs: fileName,
    absolutePath: filePath,
    publicPath: `/uploads/${fileName}`,
    size: file.size,
    type: file.type
  });

  return `/uploads/${fileName}`;
}

async function deleteUploadedFile(filePath: string | null | undefined) {
  if (!filePath || !filePath.startsWith("/uploads/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));

  try {
    await unlink(absolutePath);
    console.info("[Warranty Tracker] File deleted", {
      publicPath: filePath,
      absolutePath
    });
  } catch {
    // Ignore missing files during cleanup.
  }
}

export async function saveReceiptUpload(file: File) {
  return saveImageUpload(file);
}

export async function saveProductImageUpload(file: File) {
  return saveImageUpload(file);
}

export async function deleteReceiptFile(receiptPath: string | null | undefined) {
  return deleteUploadedFile(receiptPath);
}

export async function deleteProductImageFile(productImagePath: string | null | undefined) {
  return deleteUploadedFile(productImagePath);
}
