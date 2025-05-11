import { useCsvReader } from '@/hooks/useCsvReader';
import { useEffect, useState } from 'react';
import { Button, Dimensions, ScrollView, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartData {
  labels: string[];
  datasets: { data: number[] }[];
  legend?: string[];
}

export default function HomeScreen() {
  const { csvData, error, pickCSV } = useCsvReader();
  const [chartData, setChartData] = useState<ChartData | null>(null);


  useEffect(() => {
    if (csvData) {
      const labels = csvData.data[csvData.headers[0]];
      const values = csvData.data[csvData.headers[1]].map(parseFloat);
      setChartData({ 
        labels, 
        datasets: [{ data: values }],
        legend: [csvData.headers[1]],
      });
      }
  }, [csvData]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button title="Загрузить CSV" onPress={pickCSV} />

      {chartData && (
        <>
          <Text style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>График по CSV</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '1',
                stroke: '#1e90ff',
              },
            }}
            bezier
          />
        </>
      )}
    </ScrollView>
  );
}
