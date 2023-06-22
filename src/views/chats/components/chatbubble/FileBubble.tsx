import React from 'react';
import { useTranslation } from 'react-i18next';
import path from 'path';
import { Alert, Image, Linking, Platform, Text, TouchableOpacity } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';
import { Row } from '../../../../components/layouts/Row';
import { Column } from '../../../../components/layouts/Column';
import { COLOR } from '../../../../constants/COLOR';
import LogUtil from '../../../../utils/LogUtil';
import FileViewer from 'react-native-file-viewer';
import { t } from 'i18next';

interface FileBubbleProps {
  showMenu?: any;
  fileUrl: string;
  fileSize?: number;
  messageText?: string;
  isMe?: boolean;
}

const FileBubble = ({ showMenu, fileUrl, fileSize, messageText, isMe }: FileBubbleProps) => {
  const { t } = useTranslation();
  const fileName = messageText;
  const fileBasename = path.basename(fileUrl);
  const fileType = path.extname(fileUrl);
  LogUtil.info('messageText', messageText);

  let image = require('assets/chats/chatroom/ic_file_unknown.png');
  if (fileType.includes('doc')) {
    image = require('assets/chats/chatroom/ic_file_doc.png');
  } else if (
    fileType.includes('jpg') ||
    fileType.includes('jpeg') ||
    fileType.includes('png') ||
    fileType.includes('gif')
  ) {
    image = require('assets/chats/chatroom/ic_file_image.png');
  } else if (fileType.includes('pdf')) {
    image = require('assets/chats/chatroom/ic_file_pdf.png');
  } else if (fileType.includes('ppt')) {
    image = require('assets/chats/chatroom/ic_file_ppt.png');
  } else if (fileType.includes('xlsx')) {
    image = require('assets/chats/chatroom/ic_file_xlsx.png');
  } else if (fileType.includes('apk')) {
    image = require('assets/chats/chatroom/ic_file_apk.png');
  }

  return (
    <TouchableOpacity
      onLongPress={() => {
        showMenu();
      }}
      onPress={async () => {
        const dirs = RNFetchBlob.fs.dirs;
        console.log('fileUrl', fileUrl);
        let toastType = 'success';
        try {
          await RNFetchBlob.config({
            fileCache: true,
            path: Platform.OS === 'ios' ? dirs.DocumentDir + `/${fileName}` : dirs.DownloadDir + `/${fileName}`,
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`,
            },
          })
            .fetch('GET', encodeURI(fileUrl))
            .then((res) => {
              console.log('the file saved to ', res.path());
              // if(Platform.OS==='ios'
              // ){
              //   RNFetchBlob.ios.previewDocument(res.path())
              // }
              const path = FileViewer.open(res.path()) // absolute-path-to-my-local-file.
                .then(() => {
                  // success
                  console.log('success');
                })
                .catch((error) => {
                  // error
                });
            });
        } catch (error) {
          toastType = 'error';
          //@ts-ignore
          Alert.alert('error', error.response);
        }
      }}
    >
      <Row justify="center" align="center">
        <Image source={image} style={{ width: 50, height: 50, margin: 15 }} />
        <Column style={{ width: 155 }}>
          <Text style={[{ marginBottom: 5 }, isMe ? { color: COLOR.WHITE } : { color: COLOR.BLACK }]}>{fileName}</Text>
          {fileSize ? <Text style={{ color: '#999999' }}>{(fileSize / 1024 / 1024).toFixed(2)} MB</Text> : <></>}
        </Column>
      </Row>
    </TouchableOpacity>
  );
};

export default React.memo(FileBubble);
