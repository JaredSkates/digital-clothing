import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClothingForm from "@/components/clothing-form";
import { ThemedView } from "@/components/themed-view";
import ImageUploader from "@/components/upload";
import { Category, SubCategory } from "@/constants/closet-item";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-img-picker";
import { useTheme } from "@/hooks/use-theme";
import { NewClosetItem } from "@/lib/db/schema";

export default function ModalScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Hook handles the local image state completely
  const { localImgUri, selectImage, takePhoto } = useImagePicker();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveItem = async (formValues: {
    name: string;
    category: Category;
    subCategory: SubCategory;
  }) => {
    if (!localImgUri) return;

    try {
      setIsSubmitting(true);

      // TODO: Upload localImgUri to S3 and get back the permanent public HTTPS URL
      // const publicS3Url = await uploadToS3(localImgUri);
      const publicS3Url = localImgUri; // Temporary placeholder until S3 is integrated

      const payload: NewClosetItem = {
        name: formValues.name,
        category: formValues.category,
        subCategory: formValues.subCategory,
        imgUri: publicS3Url,
      };

      console.log("Ready for API/DB:", payload);
      router.back();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
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
            image={localImgUri}
            onSelectImage={selectImage}
            onTakePhoto={takePhoto}
          />

          {localImgUri && (
            <ClothingForm onSubmit={saveItem} isSubmitting={isSubmitting} />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  pressed: { opacity: 0.7 },
});
