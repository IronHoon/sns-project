import { KokKokImageFile } from 'pages/chats/message-type/KokKokGalleryPage';
import path from 'path';
import { DocumentPickerResponse } from 'react-native-document-picker';
import { ImagePickerResponse } from 'react-native-image-picker';
import { RNS3 } from 'react-native-s3-upload';
import Nullable from 'types/_common/Nullable';
import LogUtil from 'utils/LogUtil';
const mime = require('mime');

export interface MediaResponse {
  url: string;
  name: string;
  type: string;
  size?: number;
}

const options = {
  bucket: 'kokkok-app-upload-data',
  region: 'ap-southeast-1',
  accessKey: 'AKIAV42CLJE4T2HFJWVN',
  secretKey: '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',
};

const cloudFrontUrl = 'https://d2hwqo24ontijq.cloudfront.net/';

export const uploadS3ByFilePath: (filePath: string, mimeType?: string) => Promise<Nullable<MediaResponse>> = async (
  filePath,
  mimeType,
) => {
  if (!filePath) {
    LogUtil.error('uploadS3ByFilePath !filePath');
    return null;
  }

  const uri = filePath;
  const name = path.basename(uri);
  const type = mimeType ?? mime.getType(path.extname(uri));

  const res = await RNS3.put({ uri, name, type }, options);
  if (res.status === 201) {
    const mediaResponse: MediaResponse = {
      url: cloudFrontUrl + res.body.postResponse.key,
      name: name ?? '',
      type: type ?? '',
    };
    return mediaResponse;
  }
  return null;
};

export const uploadS3ByImageCropPicker: (
  filePath: string,
  mimeType?: string,
) => Promise<Nullable<MediaResponse>> = async (filePath, mimeType) => {
  if (!filePath) {
    LogUtil.error('uploadS3ByFilePath !filePath');
    return null;
  }

  const uri = filePath;
  const name = path.basename(uri);
  const type = mimeType ?? mime.getType(path.extname(uri));

  const res = await RNS3.put({ uri, name, type }, options);
  if (res.status === 201) {
    const mediaResponse: MediaResponse = {
      url: cloudFrontUrl + res.body.postResponse.key,
      name: name ?? '',
      type: type ?? '',
    };
    return mediaResponse;
  }
  return null;
};

export const multiUploadS3ByFilePath: (fileList: KokKokImageFile[]) => Promise<MediaResponse[]> = async (fileList) => {
  if (fileList.length <= 0) {
    LogUtil.error('multiUploadS3ByFilePath fileList.length<=0');
    return [];
  }

  let returnFileList: MediaResponse[] = [];
  for (let i = 0; i < fileList.length; i++) {
    const { uri, name, type } = fileList[i];
    LogUtil.info('length', fileList.length);
    LogUtil.info('uri', uri);
    LogUtil.info('file name', name);
    LogUtil.info('type', type);
    const res = await RNS3.put({ uri, name, type }, options);
    if (res.status === 201) {
      LogUtil.info('res.status', res.status);
      const mediaResponse: MediaResponse = {
        url: cloudFrontUrl + res.body.postResponse.key,
        name: name ?? '',
        type: type ?? '',
      };
      returnFileList.push(mediaResponse);
    } else {
      LogUtil.info('res', res);
      LogUtil.info('res.status', res.status);
      return [];
    }
  }
  return returnFileList;
};

export const uploadS3ByImagePicker: (
  imagePickerResponse: ImagePickerResponse,
) => Promise<Nullable<MediaResponse>> = async (imagePickerResponse) => {
  if (!imagePickerResponse.assets) {
    LogUtil.error('uploadS3ByImagePicker !imagePickerResponse.assets');
    return null;
  }

  const { uri, fileName: name, type, fileSize } = imagePickerResponse.assets[0];
  const res = await RNS3.put({ uri, name, type }, options);
  if (res.status === 201) {
    const mediaResponse: MediaResponse = {
      url: cloudFrontUrl + res.body.postResponse.key,
      name: name ?? '',
      type: type ?? '',
      size: fileSize,
    };
    return mediaResponse;
  }
  return null;
};

export const multiUploadS3ByImagePicker: (
  imagePickerResponse: ImagePickerResponse,
) => Promise<MediaResponse[]> = async (imagePickerResponse) => {
  if (!imagePickerResponse.assets) {
    LogUtil.error('multiUploadS3ByImagePicker !imagePickerResponse.assets');
    return [];
  }

  var fileList: MediaResponse[] = [];
  for (var i = 0; i < imagePickerResponse.assets.length; i++) {
    const { uri, fileName: name, type, fileSize } = imagePickerResponse.assets[i];
    const res = await RNS3.put({ uri, name, type }, options);
    if (res.status === 201) {
      const mediaResponse: MediaResponse = {
        url: cloudFrontUrl + res.body.postResponse.key,
        name: name ?? '',
        type: type ?? '',
        size: fileSize,
      };
      fileList.push(mediaResponse);
    } else {
      return [];
    }
  }
  return fileList;
};

export const multiUploadS3ByDocumentPicker: (
  documentPickerResponseList: DocumentPickerResponse[],
) => Promise<MediaResponse[]> = async (documentPickerResponseList) => {
  if (documentPickerResponseList.length <= 0) {
    LogUtil.error('multiUploadS3ByDocumentPicker !documentPickerResponseList');
    return [];
  }

  var fileList: MediaResponse[] = [];
  for (var i = 0; i < documentPickerResponseList.length; i++) {
    const { uri, name, type, size } = documentPickerResponseList[i];
    const res = await RNS3.put({ uri, name, type }, options);
    if (res.status === 201) {
      const mediaResponse: MediaResponse = {
        url: cloudFrontUrl + res.body.postResponse.key,
        name: name ?? '',
        type: type ?? '',
        size: size ?? undefined,
      };
      fileList.push(mediaResponse);
    } else {
      return [];
    }
  }
  return fileList;
};
