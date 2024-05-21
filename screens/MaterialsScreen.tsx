import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../modules/firebase';
import { Video } from 'expo-av';
import {
  fetchAccount,
  fetchSettings,
  SettingsData
} from "../modules/fetchingData";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import CurrentDate from '../components/CurrentDate';
import SideButtons from '../components/SideButtons';
import LoadingAnimation from '../components/LoadingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const MaterialsScreen = ({ navigation, route }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState(null);
  const { accountID } = route.params;

  useEffect(() => {
    fetchData();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const fetchData = async () => {
    try {
      const materialsCollection = collection(database, 'materials');
      const materialsSnapshot = await getDocs(materialsCollection);
      const materialsList = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterials(materialsList);

      const settingsData = await fetchSettings(accountID);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Alert.alert('Error', 'Failed to fetch materials');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const openMaterial = (material) => {
    if (material.contentType === 'application/pdf') {
      Linking.openURL(material.downloadURL);
    } else {
      setSelectedMaterial(material);
      setModalVisible(true);
    }
  };

  const renderMaterial = ({ item }) => (
    <TouchableOpacity style={styles.materialBox} onPress={() => openMaterial(item)}>
      {item.contentType.startsWith('image/') && (
        <Image source={{ uri: item.downloadURL }} style={styles.materialImage} />
      )}
      {item.contentType.startsWith('video/') && (
        <Video
          source={{ uri: item.downloadURL }}
          style={styles.materialImage}
          useNativeControls
        />
      )}
      {item.contentType === 'application/pdf' && (
        <Text style={styles.pdfLink}>{item.name}</Text>
      )}
    </TouchableOpacity>
  );

  const renderSection = (sectionTitle, sectionMaterials) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: settings.fontSize, fontFamily: settings.font }]}>
        {sectionTitle}
      </Text>
      <FlatList
        data={sectionMaterials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const alertFunction = () => {
    Alert.alert(
      'Da li ste sigurni da se želite odjaviti?',
      'Ako se odjavite ponovo ćete morati skenirati QR kod kako biste se prijavili.',
      [
        {
          text: 'Ne',
          onPress: undefined,
          style: 'cancel',
        },
        {
          text: 'Da',
          onPress: logout,
        },
      ]
    );
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('account');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home', params: { accountID: 0 } }],
        })
      );
    } catch (e) {
      console.log('Error when storing data: ' + e);
    }
  };

  const handleChatPress = () => {
    navigation.navigate('Chat', { email: settings.email, accountID: accountID });
  };

  const handleSOSPress = () => {
    navigation.navigate('Chat', { sos: 'SOS', email: settings.email, accountID: accountID });
  };

  if (!settings) {
    return <LoadingAnimation />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: settings.colorForBackground, flex: 1 }}>
      <View style={styles.header}>
        <CurrentDate settings={settings} />
        <TouchableOpacity style={styles.logoutButton} onPress={alertFunction}>
          <SimpleLineIcons name="logout" size={33}></SimpleLineIcons>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <Text style={{ fontSize: settings.fontSize + 6, fontFamily: settings.font, marginLeft: 25, marginBottom: 40 }}>
          Instrukcije
        </Text>
        {renderSection('Slike', materials.filter(material => material.contentType.startsWith('image/')))}
        {renderSection('Videozapisi', materials.filter(material => material.contentType.startsWith('video/')))}
        {renderSection('PDF dokumenti', materials.filter(material => material.contentType === 'application/pdf'))}
      </ScrollView>
      <SideButtons onChatPress={handleChatPress} onSOSPress={handleSOSPress} />
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
          {selectedMaterial && (
            <View style={styles.modalContent}>
              {selectedMaterial.contentType.startsWith('image/') && (
                <Image source={{ uri: selectedMaterial.downloadURL }} style={styles.modalImage} />
              )}
              {selectedMaterial.contentType.startsWith('video/') && (
                <Video
                  source={{ uri: selectedMaterial.downloadURL }}
                  style={styles.modalImage}
                  useNativeControls
                />
              )}
              {selectedMaterial.contentType === 'application/pdf' && (
                <TouchableOpacity onPress={() => Linking.openURL(selectedMaterial.downloadURL)}>
                  <Text style={styles.pdfLink}>{selectedMaterial.name}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  logoutButton: {
    marginTop: 5,
    marginLeft: 15,
    marginBottom: 15,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  materialBox: {
    marginBottom: 15,
    alignItems: 'center',
  },
  materialImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  pdfLink: {
    marginTop: 5,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 20,
    marginLeft: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    fontSize: 30,
    color: 'white',
  },
  modalImage: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  modalContent: {
    alignItems: 'center',
  },
});

export default MaterialsScreen;
