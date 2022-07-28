import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import Amplify, {API} from 'aws-amplify';

// Amplify configuration for API-Gateway
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'Rekognition', //your api name
        endpoint:
          'https://6urhqmxoyj.execute-api.us-east-1.amazonaws.com/dev/uploadFile', //Your Endpoint URL
      },
    ],
  },
});

const App = () => {
  const [image, setImage] = useState({
    capturedImage: '',
    base64String: '',
  });

  const captureImageButtonHandler = async () => {
    launchCamera({includeBase64: true, quality: 0.8}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        setImage({
          capturedImage: response?.assets[0]?.uri,
          base64String: response?.assets[0]?.base64,
        });
      }
    });
  };

  const registerImage = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://6urhqmxoyj.execute-api.us-east-1.amazonaws.com/dev/uploadFile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-amz-json-1.1',
        },
        data: {
          Image: image.base64String,
          name: image.capturedImage,
        },
      });
      console.log(response);
    } catch (e) {
      console.log('error', e);
    }
  };

  const getAllImage = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://6urhqmxoyj.execute-api.us-east-1.amazonaws.com/dev/uploadFile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-amz-json-1.1',
        },
        data: {
          Image: image.base64String,
          name: image.capturedImage,
        },
      });
      console.log(response);
    } catch (e) {
      console.log('error', e);
    }

    // const apiName = 'Rekognition';
    // const path = '/storeimage';
    // const init = {
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/x-amz-json-1.1',
    //   },
    //   data: {
    //     Image: image.base64String,
    //     name: image.capturedImage,
    //   },
    // };

    // API.post(apiName, path, init)
    //   .then(response => {
    //     console.log(response);
    //   })
    //   .catch(e => console.log(e));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={captureImageButtonHandler}>
        <Text style={{color: 'white'}}>Capture Image</Text>
      </TouchableOpacity>
      <Image
        source={{uri: `data:image/jpg;base64,${image.base64String}`}}
        style={{
          height: 250,
          width: '90%',
          alignSelf: 'center',
          resizeMode: 'contain',
        }}
      />
      {!!image.base64String && (
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={registerImage}>
          <Text style={{color: 'white'}}>Register Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
