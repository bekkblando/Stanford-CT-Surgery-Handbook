import React from 'react';
import { StyleSheet, View, ScrollView, WebView, Button, Image, Text, TextInput} from 'react-native';
import * as firebase from "firebase";
import HtmlParser from 'react-native-htmlparser';
import Section from "./Section";

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDO4gQiWkeNAxllb-nXWDr74vemGMRQBbw",
  authDomain: "georgetown-memorial.firebaseapp.com",
  databaseURL: "https://georgetown-memorial.firebaseio.com",
  projectId: "georgetown-memorial",
  storageBucket: "georgetown-memorial.appspot.com",
  messagingSenderId: "633749216180",
  appId: "1:633749216180:web:e1f318a5a37df142"
};
firebase.initializeApp(config);

// Create a reference with .ref() instead of new Firebase(url)

export default class App extends React.Component {

    constructor() {
        super();
        console.disableYellowBox = true;
        let rootRef = firebase.database().ref();
        this.itemsRef = rootRef;
        this.state = {
            location: "login",
            table_of_contents: {},
            link: '',
            search: '',
            navigation: [],
            email: '',
            password: '',
            user: '',
            errorMessage: ''
        };

        this.searchSections = [];
        this.viewContent = this.viewContent.bind(this);
        this.listenForItems(this.itemsRef);
    }

    listenForItems(itemsRef) {
        itemsRef.once("value").then((snap) => {
            let navList = snap.val()[0]["Manual"]

            this.setState({
                "table_of_contents": navList
            });
            this.setState({navigation: this.makeNav(this.state.table_of_contents, 0, '0/Manual/', '')});
        });
    }

    viewContent(link){
      this.setState({location: 'content', link: link})
    }

    searchTerm(sectionName, searchTerm){
      // Check if it's matching or is a sub string or vice versa
      return sectionName.toLowerCase().includes(searchTerm.toLowerCase())
    }

    search(){

    }

    makeNav(ob, count, link, searchTerm = '') {
        let components = []
        Object.keys(ob).map((key) => {
            if (key != "content") {
                let component = <Section style = {{ marginBottom: 20 }} key={ key } name={ key }>{ this.makeNav(ob[key], count + 1, link + "/" + key, searchTerm) }</Section>
                console.log(this.state.search)
                if(!searchTerm){
                  components.push(component);
                }else if(this.searchTerm(key, searchTerm)){
                  this.searchSections.push(component);
                }
            }else{
              // Content
              components.push(<Button color = '#8c1515' onPress={() => this.viewContent(link)} key = { count } title = "View Content"/>)
            }
        })
        return(components)
    }

    login(){
      firebase.auth().signInWithEmailAndPassword(this.state.email.trim(), this.state.password.trim()).then((results) => {
        console.log(results)
        this.setState({location: 'home', email: '', password: '', user: results})
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        this.setState({errorMessage: errorMessage})
        });
    }

    render() {
        switch(this.state.location) {
          case "login":
            return(
              <View style={ styles.loginContainer }>
                <Text> { this.state.errorMessage } </Text>
                <Button title="Login" onPress={this.login.bind(this)}/>
                  <TextInput
                    style={ styles.email }
                    editable = {true}
                    placeholder = "User Name"
                    underlineColorAndroid = 'white'
                    onChangeText = { (text) => this.setState({email: text}) }
                  />
                  <TextInput
                    secureTextEntry={true}
                    style={ styles.password }
                    editable = {true}
                    placeholder = "Password"
                    underlineColorAndroid = 'white'
                    onChangeText = { (text) => this.setState({password: text}) }
                  />
              </View>
            )
            break;
    			case "home":
    				return(
    					<View contentContainerStyle={ styles.contentContainer }>
                <View style = { styles.imageHolder }>
                  <Image style = { styles.image } source={require('./stanford_medicine_logo.png')} />
                  <TextInput
                    style = { styles.search }
                    editable = {true}
                    placeholder = "Search"
                    underlineColorAndroid = 'white'
                    onChangeText = { (text) => {
                      if(text){
                        this.searchSections = [];
                        this.makeNav(this.state.table_of_contents, 0, '0/Manual/', text)
                        this.setState({navigation: this.searchSections});
                      }else{
                        this.setState({navigation: this.makeNav(this.state.table_of_contents, 0, '0/Manual/', '')});
                      }
                    } } />
                </View>
                <ScrollView>
                  { this.state.navigation }
                </ScrollView>
    					</View>
    				)
            break;
          case "content":
            console.log("http://d27dkc7f7abooa.cloudfront.net/viewContent?" + this.state.link)
            return(
              <View style = { webViewStyles.container } >
                <View style = { styles.imageHolder }>
                  <Image style = { styles.image } source={require('./stanford_medicine_logo.png')} />
                </View>
                <Button color = '#8c1515' onPress = {() => this.setState({location: 'home'})} title = {"Back"}/>
                <WebView
                  style = {{
                    width: '100%',
                    flex: 1
                  }}
                  javaScriptEnabled
                  renderLoading={() => <ActivityIndicator size={'small'} />}
                  renderError={() => <Text> A Loading error has occured</Text>}
                  scrollEnabled
                  scalesPageToFit
                  source={{uri: "http://d27dkc7f7abooa.cloudfront.net/viewContent?" + this.state.link}}
                />
              </View>
            )
    				break;
		    }
    }
}


const styles = StyleSheet.create({
  contentContainer: {
      position: 'absolute',
      marginBottom: '20%',
      width: '100%',
      height: '100%',
    },
    loginContainer: {
        position: 'absolute',
        backgroundColor: '#8c1515',
        marginBottom: '20%',
        padding: '10%',
        width: '100%',
        height: '100%',
      },
    imageHolder: {
      height: 100,
      padding: '10%',
      paddingTop: '20%',
      paddingBottom: '30%',
      marginBottom: '5%',
      backgroundColor: "#4d4f53",
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    image: {
      width: '70%',
      height: 100,
      resizeMode: 'contain',
    },
    search: {
      backgroundColor: 'white',
      width: '70%',
      height: 30,
      color: 'black'
    },
    userName: {
      backgroundColor: 'white',
      width: '100%',
      height: 30,
      color: 'black'
    },
    password: {
      backgroundColor: 'white',
      width: '100%',
      height: 30,
      color: 'black'
    }
  });

const webViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '10%',
    justifyContent: 'space-between',
  }
});
