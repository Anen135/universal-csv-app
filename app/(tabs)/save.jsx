import storage from "@/hooks/storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CsvImportScreen() {
  const [data, setData] = useState("");

  useEffect(() => {
    console.log("Инициализация: создаем таблицу (если не web)");
    storage.createTable();
  }, []);

  const handlePickCSV = async () => {
    try {
      console.log("Открытие диалога выбора CSV...");
      const file = await DocumentPicker.getDocumentAsync({ type: "text/csv" });

      if (file.canceled) {
        console.log("Выбор файла отменён.");
        return;
      }

      console.log("Файл выбран:", file.assets?.[0]?.uri);

      let fileContent = "";

      if (Platform.OS === "web") {
        console.log("Web: читаем через fetch и FileReader");
        fileContent = await readFileWeb(file);
      } else {
        console.log("Native: читаем через FileSystem");
        fileContent = await FileSystem.readAsStringAsync(file.assets[0].uri);
      }

      console.log("Файл прочитан. Длина:", fileContent.length);

      await storage.saveRawCSV(fileContent);
      Alert.alert("CSV сохранён как текст");
    } catch (error) {
      console.error("Ошибка при импорте CSV:", error);
    }
  };

  const readFileWeb = async (file) => {
    return new Promise((resolve, reject) => {
      fetch(file.assets[0].uri)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log("FileReader завершён");
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsText(blob);
        })
        .catch(reject);
    });
  };

  const loadFromStorage = async () => {
    console.log("Загружаем CSV из хранилища...");
    await storage.getRawCSV((csv) => {
      console.log("CSV получен:", csv.slice(0, 100));
      setData(csv);
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Импорт CSV" onPress={handlePickCSV} />
      <Button title="Загрузить CSV" onPress={loadFromStorage} />
      <ScrollView style={styles.scroll}>
        <Text selectable style={styles.text}>{data}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    marginTop: 50,
  },
  scroll: {
    marginTop: 20,
    flex: 1,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
});
