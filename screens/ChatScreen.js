import React, { useState, useEffect, useCallback } from 'react';
import {  View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';
import { database } from '../modules/firebase';
import ChatHeader from '../components/ChatHeader';


export default function ChatScreen( {navigation, route }) {

  const [messages, setMessages] = useState([]);
  const { email, sos, accountID } = route.params;
  const [inputMessage, setInputMessage] = useState(sos === "SOS" ? "SOS: Help needed!" : "");
  let unsubscribe;

  useEffect(() => {

    signInAndListen();
  
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signInAndListen = async () => {

    try {
        const collectionRef = collection(database, email);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
  
        return onSnapshot(q, querySnapshot => {
          console.log('querySnapshot unsubscribe');
          setMessages(
            querySnapshot.docs.map(doc => ({
              _id: doc.id,
              createdAt: doc.data().createdAt.toDate(),
              text: doc.data().text,
              user: doc.data().user
            }))
          );
        });
      
    } catch (error) {
      Alert.alert("Login error", error.message);
    }
  };
  

  const onSend = useCallback((messages = []) => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages)
      );
      const { _id, createdAt, text, user } = messages[0];    
      addDoc(collection(database, email), {
        _id,
        createdAt,
        text,
        user
      });
    }, []);

    return (
      <View style={styles.container}>
        <ChatHeader title="Poruke" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={styles.chatContainer}
        >
          <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: accountID,
              avatar: 'https://i.pravatar.cc/300'
            }}
            placeholder="Type your message here..."
            text={inputMessage} // Set the initial input message
            onInputTextChanged={(text) => setInputMessage(text)} // Update input message state
          />
        </KeyboardAvoidingView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    chatContainer: {
      flex: 1,
      paddingBottom: 20,
    },
  });