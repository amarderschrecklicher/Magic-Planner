import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, Alert, Linking } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../modules/firebase';

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
      <Text style={styles.materialTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (!selectedMaterial) {
      return null;
    }

    if (selectedMaterial.contentType.startsWith('image/')) {
      return (
        <Image source={{ uri: selectedMaterial.downloadURL }} style={styles.modalImage} />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={materials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
          {renderModalContent()}
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
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
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
});

export default MaterialsScreen;
