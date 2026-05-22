import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple state for forms (in a real app, separate components)
  const [aircraft, setAircraft] = useState({ name: '', model: '', capacity: '' });
  const [flight, setFlight] = useState({ aircraft_id: '', origin: '', destination: '', departure_time: '', arrival_time: '', price: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleAddAircraft = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/aircrafts', aircraft);
      alert('Aircraft added!');
      setAircraft({ name: '', model: '', capacity: '' });
    } catch (e) { alert('Error adding aircraft'); }
  };

  const handleAddFlight = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/flights', flight);
      alert('Flight added!');
      setFlight({ aircraft_id: '', origin: '', destination: '', departure_time: '', arrival_time: '', price: '' });
    } catch (e) { alert('Error adding flight'); }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.users },
          { label: 'Total Flights', value: stats.flights },
          { label: 'Total Bookings', value: stats.bookings },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}` }
        ].map((stat, i) => (
          <div key={i} className="glass p-6 text-center">
            <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="glass p-6 h-96">
        <h3 className="text-xl font-bold mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.chartData}>
            <defs>
              <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="sum" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSum)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Management Forms */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-4">Add Aircraft</h3>
          <form onSubmit={handleAddAircraft} className="space-y-4">
            <input type="text" placeholder="Name (e.g. Boeing)" className="input-glass" required
              value={aircraft.name} onChange={e => setAircraft({...aircraft, name: e.target.value})} />
            <input type="text" placeholder="Model (e.g. 737)" className="input-glass" required
              value={aircraft.model} onChange={e => setAircraft({...aircraft, model: e.target.value})} />
            <input type="number" placeholder="Capacity" className="input-glass" required
              value={aircraft.capacity} onChange={e => setAircraft({...aircraft, capacity: e.target.value})} />
            <button type="submit" className="btn-primary w-full">Add Aircraft</button>
          </form>
        </div>

        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-4">Add Flight</h3>
          <form onSubmit={handleAddFlight} className="space-y-4">
            <input type="number" placeholder="Aircraft ID" className="input-glass" required
              value={flight.aircraft_id} onChange={e => setFlight({...flight, aircraft_id: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Origin" className="input-glass" required
                value={flight.origin} onChange={e => setFlight({...flight, origin: e.target.value})} />
              <input type="text" placeholder="Destination" className="input-glass" required
                value={flight.destination} onChange={e => setFlight({...flight, destination: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Departure</label>
                <input type="datetime-local" className="input-glass" required
                  value={flight.departure_time} onChange={e => setFlight({...flight, departure_time: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Arrival</label>
                <input type="datetime-local" className="input-glass" required
                  value={flight.arrival_time} onChange={e => setFlight({...flight, arrival_time: e.target.value})} />
              </div>
            </div>
            <input type="number" placeholder="Price" className="input-glass" required
              value={flight.price} onChange={e => setFlight({...flight, price: e.target.value})} />
            <button type="submit" className="btn-primary w-full">Add Flight</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
