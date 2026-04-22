import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { savePost, updatePost } from "../../utils/postStorage";

export default function CreateStory() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [postId, setPostId] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [notes, setNotes] = useState([""]);

  useEffect(() => {
    if (params?.id && params?.data) {
      const postData = JSON.parse(params.data);
      setTitle(postData.title || "");
      setDescription(postData.description || "");
      setLocation(postData.location || "");
      setImage(postData.image || null);
      setPostId(postData.id);
      setIsUpdate(true);
    }
  }, [params]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveStory = async () => {
    if (!title && !description && !image) {
      alert("Please add a title, description, or image!");
      return;
    }

    if (isUpdate) {
      const updatedPost = {
        id: postId,
        user: "Inu Jayasinghe",
        image,
        title,
        description,
        location,
        reacts: 0,
        comments: 0,
        shares: 0,
      };

      await updatePost(updatedPost);
      setModalVisible(false);
      setShowSuccessModal(true);
    } else {
      const newPost = {
        id: Date.now(),
        user: "Inu Jayasinghe",
        image,
        title,
        description,
        location,
        reacts: 0,
        comments: 0,
        shares: 0,
      };

      await savePost(newPost);
      setModalVisible(false);
      router.push("/(tabs)/feed/?uploading=true");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Image
          source={
            image
              ? { uri: image }
              : require("../../assets/images/placeholder.jpg")
          }
          style={styles.topImage}
        />
        <Text style={styles.mainTitle}>Wander & Discover</Text>
        <Text style={styles.subTitle}>Every journey begins with a story</Text>
        {/* FORM */}
        const [notes, setNotes] = useState([""]);
        <View style={styles.form}>
          <Text style={styles.label}>Caption</Text>
          <TextInput style={styles.input} />

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.uploadText}>Upload your image</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Province</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Collaborators</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Travel moods</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Trip Highlights</Text>
          {notes.map((note, index) => (
            <View key={index} style={styles.inputWithButton}>
              <TextInput
                // placeholder="Funniest moment"
                // placeholderTextColor="#aaaaaae0"
                style={styles.inputFlex}
                value={note}
                placeholder={`Unforgettable moment ${index + 1}`}
                onChangeText={(text) => {
                  const updated = [...notes];
                  updated[index] = text;
                  setNotes(updated);
                }}
              />
              {index === notes.length - 1 && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setNotes([...notes, ""])}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.warning}>
            <Text style={[styles.text, { color: "#0c7ae9" }]}>
              Add a special moment, then tap + to add more ✨
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="send" size={24} color="white" />
          <Text style={styles.submitText}>
            {isUpdate ? "Update Story" : "Create Story"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PREVIEW MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.storyTitle}>{title}</Text>
            <Text style={styles.storyLocation}>{location}</Text>

            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../assets/images/placeholder.jpg")
              }
              style={styles.storyImage}
            />

            <Text style={styles.descText}>{description}</Text>

            <TouchableOpacity
              style={styles.publishButton}
              onPress={handleSaveStory}
            >
              <Text style={styles.publishText}>
                {isUpdate ? "Update Story" : "Publish your story"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Updated Successfully
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/(tabs)/feed");
              }}
            >
              <Text style={{ fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topImage: { width: "100%", height: 300 },

  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },

  subTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },

  form: { paddingHorizontal: 20 },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#000",
  },

  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },

  addButton: {
    backgroundColor: "#1082f5",
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1082f5",
    padding: 15,
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 15,
  },

  uploadText: { color: "white", marginLeft: 10 },

  warning: { flexDirection: "row", alignItems: "center" },

  warningText: { color: "orange", marginLeft: 5 },

  submitButton: {
    flexDirection: "row",
    backgroundColor: "#1082f5",
    padding: 15,
    justifyContent: "center",
    borderRadius: 8,
    margin: 20,
  },

  submitText: { color: "white", marginLeft: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },

  closeText: { fontSize: 18 },

  storyImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },

  storyTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },

  storyLocation: {
    color: "#666",
  },

  descText: {
    color: "#444",
    marginBottom: 10,
  },

  publishButton: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  publishText: {
    color: "white",
    fontWeight: "bold",
  },
});
