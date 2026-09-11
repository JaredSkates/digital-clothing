import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";

export default function ImageUploader() {
  const theme = useTheme();
  const [image, setImage] = useState<string | null>(null);

  // Both pickers below end up calling setImage() with the file's URI.
  // That URI is the thing you'll want to send to your DB. It lives in the
  // `image` state right here.

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
      aspect: [4, 3],
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
      Alert.alert(
        "Permission required",
        "Permission to access the camera is required.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.imageContainer}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <ThemedView
              style={[
                styles.image,
                styles.placeholder,
                { borderColor: theme.textSecondary },
              ]}
            />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: Spacing.three,
  },
  placeholder: {
    borderWidth: 2,
    borderStyle: "dashed",
  },
  footer: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.two,
    alignItems: "center",
    borderRadius: Spacing.three,
    minWidth: "100%",
    width: 200,
  },
  pressed: {
    opacity: 0.7,
  },
});
