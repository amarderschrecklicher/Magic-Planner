import React, { useState, useEffect } from 'react';
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
  SectionList,
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
  const { accountID, email } = route.params;

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

  const renderImageOrVideo = ({ item }) => (
    <TouchableOpacity style={styles.materialBox} onPress={() => openMaterial(item)}>
      {item.contentType.startsWith('image/') && (
        <Image source={{ uri: item.downloadURL }} style={styles.materialImage} />
      )}
      {item.contentType.startsWith('video/') && (
        <Video
          source={{ uri: item.downloadURL }}
          style={styles.video}
          useNativeControls
        />
      )}
    </TouchableOpacity>
  );

  const renderPDF = ({ item }) => (
    <TouchableOpacity style={styles.pdfContainer} onPress={() => openMaterial(item)}>
      <Text style={styles.pdfLink}>{item.name}</Text>
    </TouchableOpacity>
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
    navigation.navigate('Chat', { email: email, accountID: accountID });
  };

  const handleSOSPress = () => {
    navigation.navigate('Chat', { sos: 'SOS', email: email, accountID: accountID });
  };

  if (!settings) {
    return <LoadingAnimation />;
  }

  const imageMaterials = materials.filter(material => material.contentType.startsWith('image/'));
  const videoMaterials = materials.filter(material => material.contentType.startsWith('video/'));
  const pdfMaterials = materials.filter(material => material.contentType === 'application/pdf');

  return (
    <SafeAreaView style={{ backgroundColor: settings.colorForBackground, flex: 1 }}>
      <View style={styles.header}>
        <CurrentDate settings={settings} />
        <TouchableOpacity style={styles.logoutButton} onPress={alertFunction}>
          <SimpleLineIcons name="logout" size={33}></SimpleLineIcons>
        </TouchableOpacity>
      </View>
      <FlatList
        ListHeaderComponent={() => (
          <>
          <Text style={[styles.sectionTitle, { fontSize: settings.fontSize + 6, fontFamily: settings.font, marginBottom: 35 }]}>Instrukcije</Text>
            <Text style={[styles.sectionTitle, { fontSize: settings.fontSize, fontFamily: settings.font }]}>Slike</Text>
            <FlatList
              data={imageMaterials}
              renderItem={renderImageOrVideo}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style = {{marginLeft: 15}}
            />
            <Text style={[styles.sectionTitle, { fontSize: settings.fontSize, fontFamily: settings.font, marginTop: 25 }]}>Videozapisi</Text>
            <FlatList
              data={videoMaterials}
              renderItem={renderImageOrVideo}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style = {{marginLeft: 15}}
            />
            <Text style={[styles.sectionTitle, { fontSize: settings.fontSize, fontFamily: settings.font, marginTop: 25 }]}>PDF dokumenti</Text>
          </>
        )}
        data={pdfMaterials}
        renderItem={renderPDF}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pdfList}
      />
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
  materialBox: {
    marginBottom: 15,
    alignItems: 'center',
  },
  pdfContainer: {
    marginBottom: 15,
    alignItems: 'flex-start',
    paddingHorizontal: 25,
  },
  materialImage: {
    width: '100%',
    height: 150,
    aspectRatio: 16 / 9,
    marginHorizontal: 10
  },
  pdfLink: {
    marginTop: 5,
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 25,
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
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 30,
    color: 'white',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    height: '65%',
    aspectRatio: 1,
    borderRadius: 10,
    marginHorizontal: 5,
    resizeMode: 'contain',
  },
  video: {
    width: '100%',
    height: 150,
    aspectRatio: 16 / 9,
    marginHorizontal: 10
  },
});

export default MaterialsScreen;