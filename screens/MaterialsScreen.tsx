import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, Alert, Linking } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../modules/firebase';
import { Video } from 'expo-av';

const MaterialsScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const materialsCollection = collection(database, 'materials');
        const materialsSnapshot = await getDocs(materialsCollection);
        const materialsList = materialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(materialsList);
      } catch (error) {
        console.error('Error fetching materials:', error);
        Alert.alert('Error', 'Failed to fetch materials');
      }
    };

    fetchMaterials();
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
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <FlatList
        data={sectionMaterials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSection('Slike', materials.filter(material => material.contentType.startsWith('image/')))}
      {renderSection('Videozapisi', materials.filter(material => material.contentType.startsWith('video/')))}
      {renderSection('PDF dokumenti', materials.filter(material => material.contentType === 'application/pdf'))}
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
    </View>
  );
};

const styles = StyleSheet.create({
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
