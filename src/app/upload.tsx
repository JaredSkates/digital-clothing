import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required.",
        "Permission to access the media library is required.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ThemedView style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <ThemedView style={[styles.image, styles.placeholder]} />
        )}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={selectImage}
        >
          <ThemedView type="primary" style={styles.button}>
            <ThemedText type="small" themeColor="primaryText">
              Pick from gallery
            </ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={takePhoto}
        >
          <ThemedView type="backgroundElement" style={styles.button}>
            <ThemedText type="small">Take a photo</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: Spacing.three,
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: "dashed",
  },
  footer: {
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.two,
    alignItems: "center",
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
