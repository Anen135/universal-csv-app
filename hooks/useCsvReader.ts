// useCsvReader.ts
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { useState } from 'react';
import { Platform } from 'react-native';

type CsvData = {
  headers: string[];
  data: { [key: string]: string[] };
};

export const useCsvReader = () => {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/*' });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        let content = '';
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          content = await response.text();
        } else {
          content = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
        }

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            const headers = results.meta.fields;
            const data: { [key: string]: string[] } = {};

            headers.forEach((header: string) => {
              data[header] = results.data.map((row: any) => row[header]);
            });

            setCsvData({ headers, data });
          },
          error: (err: any) => {
            console.error('Ошибка при парсинге:', err);
            setError('Ошибка при парсинге CSV');
          },
        });
      }
    } catch (err) {
      setError('Ошибка при загрузке файла');
      console.error(err);
    }
  };

  return {
    csvData,
    error,
    pickCSV,
  };
};
