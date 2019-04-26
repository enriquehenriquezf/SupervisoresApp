import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import {Icon} from 'native-base'
import { Camera, Permissions } from 'expo';

export default class Camara extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    disable: false,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  /**
   * Tomar foto
   */
  snap = async () => {
    if (this.camera) {
      this.setState({disable:true});
      let photo = await this.camera.takePictureAsync({skipProcessing:true});//{base64:true}
      this.props.setImage(photo);
    //   console.log(photo)
    }
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Debe activar el permiso para acceder a la camara</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera ref={ref => { this.camera = ref; }} style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.58,
                  alignSelf: 'flex-end',
                  alignItems: 'flex-end',
                }}
                disabled={this.state.disable}
                onPress={() => {this.snap();}}>
                <Icon ios="ios-aperture" android="md-aperture" style={{marginBottom:10, color: 'white', fontSize:64}}></Icon>
                {/* <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Snap{' '}
                </Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.42,
                  alignSelf: 'flex-start',
                  alignItems: 'flex-end',
                }}
                disabled={this.state.disable}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Icon ios="ios-reverse-camera" android="md-reverse-camera" style={{marginTop:10,marginRight:10, color: 'white'}}></Icon>
                {/* <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text> */}
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
