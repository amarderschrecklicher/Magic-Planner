import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ChatHeader = ({ title }: {title:string}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
    <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backButton}
    >
  <View style={styles.backButtonContainer}>
    <AntDesign name="arrowleft" size={24} color="black" />
    <Text style={styles.backButtonText}>Back</Text>
  </View>
</TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center horizontally
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.03,
      paddingBottom: screenHeight * 0.01,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      height: Platform.OS === 'ios' ? screenHeight * 0.12 : screenHeight * 0.12,
    },
    backButtonContainer: {
      flexDirection: 'row', // Align icon and text horizontally
      alignItems: 'center', // Center vertically
      position: 'absolute',
    },
    backButton: {
      marginRight: 8, // Add margin between icon and text
    },
    backButtonText: {
      fontSize: screenWidth * 0.04,
      fontWeight: 'bold',
      color: 'black',
    },
    title: {
      fontSize: screenWidth * 0.05,
      fontWeight: 'bold',
      textAlign: 'center', // Center the title text
      flex: 1, // Allow the title to expand to fill the space
    },
  });
  

export default ChatHeader;
