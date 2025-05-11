import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const CSV_FILENAME = "csv_data.txt";
const CSV_KEY = "raw_csv_text";

const storage = {
  createTable: () => {
    if (Platform.OS === "web") {
      console.log("Web: createTable — localStorage инициализирован");
    } else {
      console.log("Native: createTable — файловая система используется");
    }
  },

  saveRawCSV: async (csvText) => {
    if (Platform.OS === "web") {
      localStorage.setItem(CSV_KEY, csvText);
    } else {
      const fileUri = FileSystem.documentDirectory + CSV_FILENAME;
      await FileSystem.writeAsStringAsync(fileUri, csvText, { encoding: FileSystem.EncodingType.UTF8 });
    }
  },

  getRawCSV: async (callback) => {
    if (Platform.OS === "web") {
      const result = localStorage.getItem(CSV_KEY);
      callback(result || "");
    } else {
      try {
        const fileUri = FileSystem.documentDirectory + CSV_FILENAME;
        const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
        callback(content);
      } catch (error) {
        console.warn("Не удалось прочитать CSV с устройства:", error);
        callback("");
      }
    }
  }
};

export default storage;
