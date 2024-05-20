import React, { useState, useEffect, useCallback } from 'react';
import {  View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';
import { database } from '../modules/firebase';
import ChatHeader from '../components/ChatHeader';

type ChatMessage = IMessage;

export default function ChatScreen({navigation, route }:{navigation:any,route:any}) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { email, sos, accountID } = route.params;
  const [inputMessage, setInputMessage] = useState(sos === "SOS" ? "SOS: Help needed!" : "");

  useEffect(() => {
    const unsubscribe = signInAndListen();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInAndListen = useCallback(() => {
    try {
      const collectionRef = collection(database, email);
      const q = query(collectionRef, orderBy('createdAt', 'desc'));

      return onSnapshot(q, querySnapshot => {
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
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
    }
  }, [email]);
  

  const onSend = useCallback((messages: ChatMessage[] = []) => {
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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