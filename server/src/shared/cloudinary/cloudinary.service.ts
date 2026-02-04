/* eslint-disable prettier/prettier */
 
 
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadResult extends UploadApiResponse {
  folder: string;
}

export interface FoodMeetUploadConfig {
  uploadType: FoodMeetUploadType;
  maxSizeBytes: number;
  allowedFormats: string[];
  folder: string;
  transformations?: any;
}

export enum FoodMeetUploadType {
  PROFILE_IMAGE = 'profile_image',
  FOOD_IMAGE = 'food_image',
  // MENU_IMAGE = 'menu_image',
}

@Injectable()
export class FoodMeetCloudinaryService {
  private readonly logger = new Logger(FoodMeetCloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('Academeet Cloudinary service initialized');
  }

  private getUploadConfig(uploadType: FoodMeetUploadType): FoodMeetUploadConfig {
    const configs: Record<FoodMeetUploadType, FoodMeetUploadConfig> = {
      [FoodMeetUploadType.FOOD_IMAGE]: {
        uploadType,
        maxSizeBytes: 2 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'academeet/food/profiles',
        transformations: {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'auto',
        },
      },
      [FoodMeetUploadType.PROFILE_IMAGE]: {
        uploadType,
        maxSizeBytes: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'academeet/posts/images',
        transformations: {
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      
    };

    return configs[uploadType];
  }

  async uploadMedia(
    file: Express.Multer.File,
    uploadType: FoodMeetUploadType,
  ): Promise<CloudinaryUploadResult> {
    const config = this.getUploadConfig(uploadType);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > config.maxSizeBytes) {
      throw new BadRequestException('File exceeds maximum allowed size');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: config.folder,
          transformation: config.transformations,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                'Cloudinary upload failed: ' + (error?.message || 'Unknown error'),
              ),
            );
          }

          const uploadResult: CloudinaryUploadResult = {
            ...result,
            folder: config.folder,
          };

          resolve(uploadResult);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadRaw(
    file: Express.Multer.File,
    uploadType: FoodMeetUploadType,
  ): Promise<CloudinaryUploadResult> {
    const config = this.getUploadConfig(uploadType);
  
    if (!file) {
      throw new BadRequestException('No file provided');
    }
  
    if (file.size > config.maxSizeBytes) {
      throw new BadRequestException('File exceeds maximum allowed size');
    }
  
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: config.folder,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                'Cloudinary raw upload failed: ' + (error?.message || 'Unknown error'),
              ),
            );
          }
  
          const uploadResult: CloudinaryUploadResult = {
            ...result,
            folder: config.folder,
          };
  
          resolve(uploadResult);
        },
      );
  
      uploadStream.end(file.buffer);
    });
  }
  
}
