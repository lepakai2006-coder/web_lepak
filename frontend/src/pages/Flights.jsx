import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { Plane, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const res = await api.get(`/flights?${searchParams.toString()}`);
        setFlights(res.data);
      } catch (error) {
        console.error('Failed to fetch flights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [location.search]);

  if (loading) return <div className="text-center mt-20 text-white">Loading flights...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-white">Available Flights</h2>
      
      {flights.length === 0 ? (
        <div className="glass p-8 text-center text-gray-300">
          No flights found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-6">
          {flights.map((flight, i) => (
            <motion.div 
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col md:flex-row items-center justify-between"
            >
              <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-400">{flight.origin}</div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center px-4 relative">
                    <div className="w-full h-[2px] bg-white/20 absolute top-1/2 -translate-y-1/2"></div>
                    <Plane className="text-blue-400 relative z-10 bg-background-dark/80 px-2 w-10 h-6" />
                    <div className="text-xs text-gray-500 mt-2">{flight.aircraft_name}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{new Date(flight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-400">{flight.destination}</div>
                  </div>
                </div>
              </div>
              
              <div className="md:ml-8 flex flex-row md:flex-col items-center justify-between w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div className="text-3xl font-bold text-white mb-2">${flight.price}</div>
                <Link to={`/booking/${flight.id}`} className="btn-primary whitespace-nowrap">
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flights;
