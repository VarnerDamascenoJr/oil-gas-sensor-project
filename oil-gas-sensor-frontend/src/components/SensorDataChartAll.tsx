import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'Sensor Data Chart',
    },
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

interface SensorData {
  timestamp: string;
  value: number;
}



const SensoDataChartAll: React.FC = () => {
  const [allDataFromPeriod, setAllDataFromPeriod] = useState([])
  const [equipmentId, setEquipmentId] = useState('');
  const [period, setPeriod] = useState('');
  const [chartData, setChartData] = useState<{ labels: string[], datasets: any[] }>({ labels: [], datasets: [] });
  const [sChartData, setSChartData] = useState<number[]>();


  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get('http://localhost:8080/data/all-equipaments');
      setAllDataFromPeriod(result.data);
    };
  
    fetchData();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Make API call to get sensor data
    try {
      const response = await axios.get<SensorData[]>('http://localhost:8080/data/sensor-data', {
        params: { period, equipmentId  }
      });
      
      const responseAverageData = await axios.get<{ equipmentId: string; averageValue: number }[]>('http://localhost:8080/data/average', {
        params: { period, equipmentId }
      });

      
      const data = response.data;
      const averageDataRes = responseAverageData.data;
      console.log('This is the: ', averageDataRes)

      // Update chart data
      const labels = data.map((item: SensorData) => item.timestamp);
      const values = data.map((item: SensorData) => item.value);

      const averageValues = averageDataRes.map((item) => item.averageValue);
      setSChartData(averageValues);
     

      
      setChartData({
        labels,
        datasets: [
          {
            label: `Sensor Data for ${equipmentId}`,
            data: values,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            yAxisID: 'y',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };
  const handleEquipmentChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setEquipmentId(e.target.value);
  };
  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>
            Equipment ID:
            <select value={equipmentId} onChange={handleEquipmentChange}>
        <option value="">Select the Equipment</option>
        {allDataFromPeriod.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
          </label>
        </div>
        <div>
          <label>
            Period:
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">Select a period</option>
              <option value="24h">24 Hours</option>
              <option value="48h">48 Hours</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>
          </label>
        </div>
        <button type="submit">Generate Chart</button>
      </form>
      <h2>This is the average value: {sChartData}</h2>
      <Line options={options} data={chartData} />
      
    </div>
  );
};

export default SensoDataChartAll;