'use strict';
import React, { PureComponent } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import moment from 'moment';
import RNFS from 'react-native-fs';

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

const ExampleApp = () => {
  const takePicture = ( camera ) => {
    const options = { quality: 0.5, fixOrientation: false, width: 1920 };
    if (camera) {
      camera
        .takePictureAsync(options)
        .then(data => {
             saveImage(data.uri);
        })
        .catch(err => {
          console.error("capture picture error", err);
        });
    } else {
      console.error("No camera found!");
    }
  }

  const dirHome = Platform.select({
    ios: `${RNFS.DocumentDirectoryPath}/Pictures`,
    android: `${RNFS.ExternalStorageDirectoryPath}/Pictures`
  });

  const dirPictures = `${dirHome}/MyAppName`;

  const saveImage = async (filePath) =>  {
    try {
      // set new image name and filepath
      const newImageName = `${moment().format("DDMMYY_HHmmSSS")}.jpg`;
      const newFilepath = `${dirPictures}/${newImageName}`;
      // move and save image to new filepath
      const imageMoved = await moveAttachment(filePath, newFilepath).then(
        imageMoved => {
          if (imageMoved) {
            return RNFS.scanFile(newFilepath);
          } else {
            return false;
          }
        }
      );
      console.log("image moved", imageMoved);
    } catch (error) {
      console.log(error);
    }
  };

    const moveAttachment = async (filePath, newFilepath) => {
      return new Promise((resolve, reject) => {
        RNFS.mkdir(dirPictures)
          .then(() => {
            RNFS.moveFile(filePath, newFilepath)
              .then(() => {
                console.log("FILE MOVED", filePath, newFilepath);
                resolve(true);
              })
              .catch(error => {
                console.log("moveFile error", error);
                reject(error);
              });
          })
          .catch(err => {
            console.log("mkdir error", err);
            reject(err);
          });
      });
    };


    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        >
          {({ camera, status, recordAudioPermissionStatus }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => takePicture(camera)} style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> SNAP </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default ExampleApp;