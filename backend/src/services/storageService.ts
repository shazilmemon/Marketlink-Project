import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface UploadResult {
  url: string;
  publicId: string;
  provider: string;
  sizeBytes?: number;
}

export interface IStorageServiceProvider {
  name: string;
  uploadFile(fileBuffer: Buffer, fileName: string, folder?: string): Promise<UploadResult>;
  deleteFile(publicId: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageServiceProvider {
  public name = 'local';

  public async uploadFile(_fileBuffer: Buffer, fileName: string, folder = 'uploads'): Promise<UploadResult> {
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');
    const mockUrl = `/uploads/${sanitizedFolder}/${Date.now()}_${sanitizedFileName}`;
    return {
      url: mockUrl,
      publicId: `local_${Date.now()}_${sanitizedFileName}`,
      provider: this.name,
    };
  }

  public async deleteFile(publicId: string): Promise<boolean> {
    logger.info(`Local storage delete requested for publicId: ${publicId}`);
    return true;
  }
}

export class StorageService {
  private static providerInstance: IStorageServiceProvider;

  public static getProvider(): IStorageServiceProvider {
    if (!this.providerInstance) {
      const selected = env.STORAGE_PROVIDER;
      logger.info(`📁 Initializing StorageService with provider: ${selected}`);
      this.providerInstance = new LocalStorageProvider();
    }
    return this.providerInstance;
  }
}
