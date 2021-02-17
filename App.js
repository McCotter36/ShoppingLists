import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
const firebase = require('firebase');
require('firebase/firestore');

class App extends Component{
  constructor(props) {
    super(props);
    this.state={
      lists: [],
      uid: '',
      loggedInText: 'Please wait while you are logged in',
    }
    //disable warnings for Android
    console.disableYellowBox = true;

    // variable contains Firebase configuration called in initialization below
    var firebaseConfig = {
      apiKey: "AIzaSyAYru9i-5Ru0tVNoLV9RH4Ap0jqDvxEevo",
      authDomain: "test-88246.firebaseapp.com",
      projectId: "test-88246",
      storageBucket: "test-88246.appspot.com",
      messagingSenderId: "417129154008",
      appId: "1:417129154008:web:d2e228a2115d03e85f1ead",
      measurementId: "G-J6QKQFD497"
    };
    // check if firebase app is initialized - keeps app from initializing twice
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } 
    else {
      firebase.app();
    }

    // ======== references shopping lists ===========
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');
    //create a reference to the active user's documents
    this.referenceShoppinglistUser = firebase.firestore().collection('shoppinglists').where("uid", "==", this.state.uid);
    
    // ===== all lists listener ============
    // this.unsubscribe = this.referenceShoppingLists.onSnapshot(this.onCollectionUpdate);
    // ===================

    // ====== current user listener ================
    this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    // ===================
  }

  componentDidMount() {
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello There',
      });
    });
  }
  
  componentWillUnmount() {
    // this.unsubscribe();
    this.authUnsubscribe();
    this.unsubscribeListUser();
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    //go through each document
    querySnapshot.forEach((doc) => {
      //get the QueryDocumentSnapshot's data
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
        uid: data.uid,
      });
    });
    this.setState({
      lists,
    });
  };

  addList = () => {
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['eggs', 'pasta', 'veggies'],
      uid: this.state.uid,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{this.state.loggedInText}</Text>
        <Text>{this.state.uid}</Text>
          <FlatList
            data={this.state.lists}
            renderItem={
              ({ item }) => <Text>{item.name}: {item.items} {item.uid}</Text>
            }
            keyExtractor={(item, index) => index.toString()}
          />
          <Button 
          title='Add List'
          onPress={() => {this.addList()}}
          />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    textAlign: 'center',
    fontSize: 30,
  },
});

export default App;