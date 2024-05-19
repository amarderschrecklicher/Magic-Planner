import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SideButtons = ({ onChatPress, onSOSPress }) => {
  
  return (
    <View style={styles.container}>
      {/* Chat button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={onChatPress}>
        <Ionicons name="chatbox-outline" size={windowWidth * 0.07} color="white" />
      </TouchableOpacity>
      {/* SOS button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF5733' }]} onPress={onSOSPress}>
        <Ionicons name="alert-circle-outline" size={windowWidth * 0.12} color="white" style={styles.sosIcon} />
      </TouchableOpacity>
    </View>
  );
};

  
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: windowHeight * 0.05,
    right: windowWidth * 0.05,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 999,
  },
  button: {
    width: windowWidth * 0.15,
    height: windowWidth * 0.15,
    borderRadius: windowWidth * 0.071,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sosIcon: {
    paddingLeft: 3, // Adjust the padding to move the icon to the right
  },
});

export default SideButtons;