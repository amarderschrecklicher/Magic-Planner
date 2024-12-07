import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Modal, Button, Image } from "react-native";
import Checkbox from "expo-checkbox";
import { CameraView } from "expo-camera";
import { saveMaterial } from '../modules/fetchingData';
import { storage } from '../modules/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { SettingsData, SubTaskData, updateFinishedSubTasks } from "../modules/fetchingData";
import * as ImageManipulator from "expo-image-manipulator";

export default function SubTask({ started, subTask, subTaskColor, settings }: { started: boolean, subTask: SubTaskData, subTaskColor: string, settings: SettingsData }) {
  const [isChecked, setChecked] = useState(subTask.done ?? null);
  const [needsValidation, setNeedsValidation] = useState(subTask.needPhoto ? true : false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
    if (subTask.needPhoto && !isChecked) {
      setModalVisible(true); // Open modal when checkbox is checked
    } else if (!isChecked) {
      // Immediately update the subtask if no photo is required
      updateFinishedSubTasks(subTask.id);
      setChecked(true);
    }

  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      
      if (result){
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.uri,
          [],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
      
        setPhoto({ uri: manipulatedImage.uri, width: manipulatedImage.width, height: manipulatedImage.height }); // Save the photo URI
    }
  };
  }

  const confirmPhoto = async () => {
    if (photo) {
      // Generate metadata
      const fileType = "image/jpeg";
      const currentDate = new Date().toISOString();


      try {
        // Convert the file URI to a blob
        const response = await fetch(photo.uri);
        const photoBlob = await response.blob();
        console.log(subTask)
        const storageRef = ref(storage, `Tasks/${subTask.task.id}_${subTask.id}_${currentDate}`);
        // Upload the blob
        const uploadTask = uploadBytesResumable(storageRef, photoBlob, {
          contentType: fileType,
          customMetadata: {
            width: photo.width.toString(),
            height: photo.height.toString(),
            currentDate,
          },
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error("Upload failed:", error);
          },
          async () => {
            // Upload completed successfully, get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await saveMaterial(`${subTask.task.id}_${subTask.id}_${currentDate}`, fileType, downloadURL, currentDate);
            console.log("File available at:", downloadURL);
          }
        );

        setModalVisible(false);
        setPhoto(null);
        updateFinishedSubTasks(subTask.id);
        setNeedsValidation(true);
        setChecked(true);
      }
      catch (error) {
        console.error("Error uploading photo:", error);
        Alert.alert("Error", "Failed to upload the photo. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setChecked(false); // Reset checkbox if canceled
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  return (
    <View style={styles.container}>
      <View
        style={
          isChecked
            ? [styles.subTaskFinished, { backgroundColor: subTaskColor }]
            : [styles.subTaskActive, { backgroundColor: subTaskColor }]
        }
      >
        <Text
          style={{
            fontSize: settings.fontSize,
            color: settings.colorForFont,
            fontFamily: settings.font,
            textDecorationLine: isChecked ? "line-through" : "none"
          }}
        >
          {subTask.description}
        </Text>
      </View>
      <View style={isChecked ? { opacity: 0.6 } : { opacity: 1 }}>
        <Checkbox
          style={styles.checkbox}
          color={
            isChecked === true
               ? settings.colorForProgress
              : isChecked === null
              ? "gray" 
              : undefined
          }
          value={isChecked === true}
          onValueChange={handleCheckboxChange}
          disabled={!started}
        />
      </View>
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.cameraContainer}>
          {photo ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: photo.uri }}
                style={[
                  styles.image,
                  photo.width > photo.height
                    ? { width: "90%", height: undefined, aspectRatio: photo.width / photo.height }
                    : { height: "90%", width: undefined, aspectRatio: photo.width / photo.height }
                ]}
              />
              <View style={styles.buttons}>
                <Button title="Potvrdi" onPress={confirmPhoto} />
                <Button title="Ponovi" onPress={retakePhoto} />
              </View>
            </View>
          ) : (
            <CameraView ref={cameraRef} style={styles.camera}>
              <View style={styles.captureButtonContainer}>
                <Button title="Slikaj" onPress={takePhoto} />
              </View>
            </CameraView>
          )}
          <Button title="Odustani" onPress={handleCancel} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    margin: 10,
  },
  subTaskFinished: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
    elevation: 8,
    borderWidth: 2,
    opacity: 0.5,
  },
  subTaskActive: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
    elevation: 8,
    borderWidth: 2,
  },
  checkbox: {
    margin: 8,
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "black",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  captureButtonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    maxWidth: "90%",
    maxHeight: "90%",
    resizeMode: "contain", // Ensures the image is displayed correctly
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
});
