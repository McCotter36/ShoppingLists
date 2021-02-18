import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import firebase from 'firebase';
import firestore from 'firebase';

// const firebase = require('firebase');
// require('firebase/firestore');

class App extends React.Component{
  constructor() {
    super();
    this.state = {
      lists: [],
      uid: 0,
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
    // else {
    //   firebase.app();
    // }
    
    //create a reference to the active user's documents
    this.referenceShoppinglistUser = null;
    // ===== all lists listener ============
    // this.unsubscribe = this.referenceShoppingLists.onSnapshot(this.onCollectionUpdate);
   
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
          <FlatList
            data={this.state.lists}
            renderItem={({ item }) => 
              <Text>{item.name}: {item.items}</Text>
            }
            keyExtractor={(item, index) => index.toString()}
          />
          <Button 
          title="Add List"
          // style={styles.button}
          onPress={() => {this.addList()}}
          />
      </View>
    );
  };


  componentDidMount() {
    // ======== references shopping lists ===========
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');

    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello There',
      });

    // create a reference to the active user's documents
    this.referenceShoppinglistUser = firebase.firestore().collection('shoppinglists').where("uid", "==", this.state.uid);
    // ====== current user listener ================
    this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    // ===================
    });
  }

  componentWillUnmount() {
    // this.unsubscribe();
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
  }
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
  // button: {
  //   width: '80%',
  //   borderRadius: 20,
  //   flex: 1,
  //   justifyContent: 'flex-end',
  //   marginBottom: 10,
  // }
});

export default App;