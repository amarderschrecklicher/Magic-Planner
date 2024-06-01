import React, { useState, useEffect } from 'react';
import { Text,View, StyleSheet, KeyboardAvoidingView, Platform, FlatList, TextInput, TouchableOpacity } from 'react-native';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { database } from '../modules/firebase';
import ChatHeader from '../components/ChatHeader';
import { FontAwesome } from '@expo/vector-icons';

export default function ChatScreen({navigation, route }:{navigation:any,route:any}) {

  const [messages, setMessages] = useState([]);
  const { email, sos, accountID } = route.params;
  const [newMessage, setNewMessage] = useState(sos === "SOS" ? "SOS: POMOĆ POTREBNA!" : "");

  useEffect(() => {
    const unsubscribe = signInAndListen();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signInAndListen = async () => {
    try {
        const collectionRef = collection(database, email);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, querySnapshot => {
            console.log('Received messages:');
            const receivedMessages = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt ? data.createdAt.toDate() : new Date(); 
                return {
                    _id: doc.id,
                    createdAt,
                    text: data.text,
                    user: data.user
                };
            });
            setMessages(receivedMessages); 
        });
    } catch (error:any) {
        console.log("Login error:", error.message);
    }
};
  

const onSendMessage = async (e:any) => {
  e.preventDefault();

  if (newMessage.trim() === '') return;

  const message = {
      text: newMessage,
      user: {
          _id: accountID,
          avatar: 'https://i.pravatar.cc/300'
      },
      createdAt: serverTimestamp() 
  };

  try {
      await addDoc(collection(database, email), message); 
      setNewMessage('');
  } catch (error) {
      console.error("Error sending message:", error);
  }
};

return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
  >
    <ChatHeader title={'Poruke'}></ChatHeader>
    <FlatList
      inverted
      data={messages}
      renderItem={({ item }) => (
        <View
          key={item._id}
          style={[
            styles.messageContainer,
            item.user._id === accountID ? styles.sent : styles.received,
          ]}
        >
          <View
            style={[
              styles.message,
              item.user._id === accountID ? styles.messageSent : styles.messageReceived,
            ]}
          >
            <Text style={item.user._id === accountID ?styles.textSent:styles.textRecieved}>{item.text}</Text>
            <View style={styles.messageTime}>
              <Text style={styles.smallText}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>
      )}
      keyExtractor={(item) => item._id.toString()}
      contentContainerStyle={styles.messageList}
    />
    <View style={styles.messageInput}>
      <TextInput
        style={styles.input}
        placeholder="Unesi poruku..."
        placeholderTextColor="#888"
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={(e) => {
          onSendMessage(e);
          setNewMessage('');
        }}
      >
        <FontAwesome name="paper-plane" size={24} color="white" />
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  textSent:  {
    color:"white"
  },
  textRecieved:  {
    color:"black"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
  },
  sent: {
    alignItems: 'flex-end',
  },
  received: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  messageSent: {
    backgroundColor: '#007AFF',
    color:"white"
  },
  messageReceived: {
    backgroundColor: '#E5E5EA',
  },
  smallText: {
    fontSize: 10,
    color: '#555',
  },
  messageTime: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 25,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});