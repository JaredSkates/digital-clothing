import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  CATEGORIES,
  Category,
  SUB_CATEGORIES,
  SubCategory,
} from "@/constants/closet-item";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Host, Picker } from "@expo/ui";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

type ClothingFormProps = {
  onSubmit: (values: {
    name: string;
    category: Category;
    subCategory: SubCategory;
  }) => void;
  isSubmitting?: boolean;
};

export default function ClothingForm({
  onSubmit,
  isSubmitting,
}: ClothingFormProps) {
  const theme = useTheme();

  // Local form state (isolated from the database and image picker)
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [subCategory, setSubCategory] = useState<SubCategory | "">("");
  const subCategories = category ? SUB_CATEGORIES[category] : [];

  // Basic validation: ensure user typed a name and selected a category
  const canSubmit =
    name.trim() !== "" && category !== "" && subCategory !== "";

  const handleSubmit = () => {
    if (!canSubmit || !category || !subCategory) return;
    onSubmit({ name, category, subCategory });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Clothing Name Input */}
      <ThemedText type="smallBold" themeColor="textSecondary">
        Name
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.textSecondary,
            color: theme.text,
          },
        ]}
        placeholder="e.g. Navy wool blazer"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />

      {/* Category Picker Dropdown */}
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <Host matchContents ignoreSafeArea="all">
          <Picker
            selectedValue={category}
            onValueChange={(val) => {
              setCategory(val as Category);
              setSubCategory("");
            }}
          >
            <Picker.Item label="Select a category" value="" />
            {CATEGORIES.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={cat.label}
                value={cat.value}
              />
            ))}
          </Picker>
        </Host>
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Subcategory
        </ThemedText>
        <Host matchContents ignoreSafeArea="all">
          <Picker
            selectedValue={subCategory}
            onValueChange={(val) => setSubCategory(val as SubCategory)}
          >
            <Picker.Item label="Select a type" value="" />
            {subCategories.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
        </Host>
      </ThemedView>

      {/* Submit Action Button */}
      <Pressable
        disabled={!canSubmit || isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView
          type={canSubmit ? "primary" : "backgroundSelected"}
          style={styles.submit}
        >
          <ThemedText
            type="smallBold"
            themeColor={canSubmit ? "primaryText" : "textSecondary"}
          >
            {isSubmitting ? "Saving..." : "Save item"}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "stretch", gap: Spacing.three },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  submit: {
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: { opacity: 0.7 },
});
