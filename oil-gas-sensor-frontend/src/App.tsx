import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const App: React.FC = () => {
  const [data, setData] = useState([]);

  const fetchData = async (period: string) => {
    const response = await axios.get(`/api/average?period=${period}`);
    setData(response.data);
  };

  useEffect(() => {
    fetchData('24h');
  }, []);

  return (
    <div>
      <h1>Sensor Data</h1>
      <button onClick={() => fetchData('24h')}>Last 24 hours</button>
      <button onClick={() => fetchData('48h')}>Last 48 hours</button>
      <button onClick={() => fetchData('1w')}>Last 1 week</button>
      <button onClick={() => fetchData('1m')}>Last 1 month</button>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default App;