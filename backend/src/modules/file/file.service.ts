import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);

  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('app.cloudinaryCloudName'),
      api_key: config.get('app.cloudinaryApiKey'),
      api_secret: config.get('app.cloudinaryApiSecret'),
    });
  }

  async generatePresignedUploadUrl(folder: string, contentType: string): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}`;
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, public_id: key },
      this.config.get('app.cloudinaryApiSecret'),
    );
    const url = `https://api.cloudinary.com/v1_1/${this.config.get('app.cloudinaryCloudName')}/image/upload`;
    return {
      key,
      url: `${url}?api_key=${this.config.get('app.cloudinaryApiKey')}&timestamp=${timestamp}&signature=${signature}&folder=${folder}&public_id=${key}`,
    };
  }

  async generatePresignedDownloadUrl(key: string): Promise<string> {
    return cloudinary.url(key, { secure: true, sign_url: true, type: 'authenticated' });
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch (err) {
      this.logger.error(`Failed to delete file ${key}: ${err.message}`);
    }
  }

  async uploadBuffer(buffer: Buffer, folder: string, mimeType: string): Promise<{ key: string; url: string }> {
    return new Promise((resolve, reject) => {
      const key = `${folder}/${uuidv4()}`;
      cloudinary.uploader.upload_stream(
        { folder, public_id: key, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve({ key: result.public_id, url: result.secure_url });
        },
      ).end(buffer);
    });
  }
}
