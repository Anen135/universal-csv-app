import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Button,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const csvData = [
  ["2025-04-01", "Круассан", "20", "120.0", "2400.0", "5.0", "Нормально"],
  ["2025-04-01", "Хлеб ржаной", "10", "80.0", "800.0", "4.7", "Шедевр!"],
  ["2025-04-01", "Булочка с корицей", "14", "90.0", "1260.0", "5.0", "Хорошее тесто"],
  ["2025-04-01", "Пирожок с мясом", "15", "110.0", "1650.0", "4.4", "Хороший хлеб"],
  ["2025-04-01", "Эклер", "19", "130.0", "2470.0", "4.9", "Тают во рту"],
  ["2025-04-01", "Чизкейк", "17", "250.0", "4250.0", "5.0", "Чуть пересушен"],
  ["2025-04-01", "Маффин", "18", "100.0", "1800.0", "4.8", "Всегда беру"],
  ["2025-04-02", "Круассан", "17", "121.2", "2060.4", "4.9", "Чуть пересушен"],
  ["2025-04-02", "Хлеб ржаной", "12", "80.8", "969.6", "4.8", "Нормально"]
];

const modes = ['Продажи', 'Средний чек', 'Популярность', 'Отзывы'];
const sortOptions = ['По убыванию', 'По возрастанию'];

export default function GraphsScreen() {
  const [mode, setMode] = useState('Продажи');
  const [sortOrder, setSortOrder] = useState('По убыванию');

  // Дата фильтра
  const [startDate, setStartDate] = useState(new Date('2025-04-01'));
  const [endDate, setEndDate] = useState(new Date('2025-04-02'));
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Фильтрация по дате
  const filteredData = csvData.filter(([date]) => {
    const d = new Date(date);
    return d >= startDate && d <= endDate;
  });

  const aggregated = useMemo(() => {
    const result = {};
    filteredData.forEach(([date, product, qty, price, total, rating, comment]) => {
      if (!result[product]) {
        result[product] = {
          quantity: 0,
          total: 0,
          ratings: [],
          comments: {},
        };
      }
      result[product].quantity += parseFloat(qty);
      result[product].total += parseFloat(total);
      result[product].ratings.push(parseFloat(rating));
      result[product].comments[comment] = (result[product].comments[comment] || 0) + 1;
    });
    return result;
  }, [filteredData]);

  const chartData = useMemo(() => {
    let labels = Object.keys(aggregated);
    let values = labels.map(p => {
      switch (mode) {
        case 'Продажи':
          return aggregated[p].total;
        case 'Средний чек':
          return aggregated[p].total / aggregated[p].quantity;
        case 'Популярность':
          return aggregated[p].quantity;
        case 'Отзывы':
          const comments = aggregated[p].comments;
          const top = Object.entries(comments).sort((a, b) => b[1] - a[1])[0];
          return top ? top[1] : 0;
      }
    });

    if (sortOrder === 'По убыванию') {
      const combined = labels.map((label, i) => ({ label, value: values[i] }))
        .sort((a, b) => b.value - a.value);
      labels = combined.map(c => c.label);
      values = combined.map(c => c.value);
    } else {
      const combined = labels.map((label, i) => ({ label, value: values[i] }))
        .sort((a, b) => a.value - b.value);
      labels = combined.map(c => c.label);
      values = combined.map(c => c.value);
    }

    return {
      labels,
      datasets: [{ data: values }]
    };
  }, [aggregated, mode, sortOrder]);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>📊 Аналитика продаж</Text>

      {/* Выбор даты */}
      <View style={{ marginVertical: 10 }}>
        <Text>Фильтр по дате:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button title={`С: ${startDate.toISOString().slice(0, 10)}`} onPress={() => setShowStart(true)} />
          <Text style={{ marginHorizontal: 10 }}>—</Text>
          <Button title={`По: ${endDate.toISOString().slice(0, 10)}`} onPress={() => setShowEnd(true)} />
        </View>
        {showStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStart(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
        {showEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEnd(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      {/* Кнопки переключения режима */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
        {modes.map(m => (
          <TouchableOpacity
            key={m}
            style={{
              backgroundColor: mode === m ? '#2196F3' : '#E0E0E0',
              padding: 10,
              margin: 5,
              borderRadius: 5
            }}
            onPress={() => setMode(m)}
          >
            <Text style={{ color: mode === m ? '#fff' : '#000' }}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Сортировка */}
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={{
              backgroundColor: sortOrder === option ? '#4CAF50' : '#E0E0E0',
              padding: 10,
              marginRight: 10,
              borderRadius: 5
            }}
            onPress={() => setSortOrder(option)}
          >
            <Text style={{ color: sortOrder === option ? '#fff' : '#000' }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={500}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: () => '#000',
        }}
        verticalLabelRotation={-90}
      />
    </ScrollView>
  );
}
