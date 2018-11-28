import React, { Component } from 'react';
import { Root,Container, Content, Spinner } from 'native-base';
import { View } from 'react-native';
import * as Expo from 'expo';
import Login from './Login';
import Home from './Home';
import Activity from './Activity';
import ShowActivities from './ShowActivities';

export default class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      token: null,
      data: null,
      loading: true
    }
    this.handler = this.handler.bind(this);
    this.handler2 = this.handler2.bind(this);
    console.ignoredYellowBox = ['Setting a timer', 'Require cycle:'];
    console.ignoredYellowBox = ['Require cycle:'];
  }

  /***
   * cambiar el valor del layout a mostrar.
   * @Ex: 0 = login, 1 = home
   */
  switchScreen(index) {
      this.setState({index: index})
  }

  /***
   * Cargar tipos de fuentes antes de mostrar el layout.
   */
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }

  /***
   * Obtiene el token y un valor de un layout para cargar otro layout
   * @param {int} index: valor del layout al cual se quiere acceder
   * @param token: token obtenido de otro layout
   */
  handler2(index,token,data) {
    this.setState({token: token, data: data})
    this.switchScreen(index);
  }
  handler(index,token) {
    this.setState({token: token})
    this.switchScreen(index);
  }
  handler(index) {
    this.switchScreen(index);
  }

  render() {
    /***
     * mostrar un spinner mientras la aplicación carga.
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /><Expo.AppLoading /></View>);
    }
    let AppComponent = null;

    /***
     * verificar el layout que se va a mostrar.
     */
    if (this.state.index == 0) {
      AppComponent = Login
    } else if(this.state.index == 1){
      AppComponent = Home
    } else if(this.state.index == 2){
      AppComponent = Activity
    } else if(this.state.index == 3){
      AppComponent = ShowActivities
    }
    return (
      <Root>
        <Container>
          <Content>
            <AppComponent handler={this.handler} handler2={this.handler2} token={this.state.token} data={this.state.data}/>
          </Content>
        </Container>
      </Root>
    );
  }
}