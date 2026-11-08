import { useAuth } from "@clerk/expo";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClothingForm from "@/components/clothing-form";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ImageUploader from "@/components/upload";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-img-picker";
import { useTheme } from "@/hooks/use-theme";
import {
    createClothing,
    isDuplicateClothingError,
} from "@/services/clothing-service";
import { ClothingInput } from "@/types/clothing";

export default function ModalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { userId } = useAuth();
  const { image, selectImage, takePhoto } = useImagePicker();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveItem = async (formData: ClothingInput) => {
    if (!image || saving) return;

    // The (app) group guard guarantees a signed-in user, but defend anyway.
    if (!userId) {
      setError("Couldn't save this item. Please try again.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await createClothing({
        userId,
        name: formData.name,
        category: formData.category,
        imgUri: image,
      });
      router.back();
    } catch (err) {
      if (isDuplicateClothingError(err)) {
        setError("You've already added this image.");
      } else {
        // The service already logs the underlying detail.
        setError("Couldn't save this item. Please try again.");
      }
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* exit button */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color={theme.text} />
      </Pressable>

      {/* content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <ImageUploader
            image={image}
            onSelectImage={selectImage}
            onTakePhoto={takePhoto}
          />
          {image && <ClothingForm onSubmit={saveItem} />}
          {error && (
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: 80,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.three,
    left: Spacing.three,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
