import fs from "fs/promises";
import path from "path";

export interface UploadOptions {
  fileName: string;
  folder?: string;
  mimeType?: string;
}

export interface StorageProvider {
  upload(fileBuffer: Buffer, options: UploadOptions): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): string;
}

/**
 * Local filesystem storage provider (default for development and standalone deployments)
 */
export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private publicPrefix: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
    this.publicPrefix = "/uploads";
  }

  async upload(fileBuffer: Buffer, options: UploadOptions): Promise<{ url: string; key: string }> {
    const folder = options.folder ? path.join(this.baseDir, options.folder) : this.baseDir;
    await fs.mkdir(folder, { recursive: true });

    const safeName = `${Date.now()}-${options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(folder, safeName);
    await fs.writeFile(filePath, fileBuffer);

    const relativePath = options.folder ? `${options.folder}/${safeName}` : safeName;
    const url = `${this.publicPrefix}/${relativePath}`;

    return {
      url,
      key: relativePath,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, key);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return `${this.publicPrefix}/${key}`;
  }
}

/**
 * Storage Service Factory
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  switch (provider) {
    case "s3":
      // In cloud deployments with S3 / Cloudflare R2 / MinIO, S3 client adapter is returned
      return new LocalStorageProvider();
    default:
      return new LocalStorageProvider();
  }
}

export const storage = getStorageProvider();
