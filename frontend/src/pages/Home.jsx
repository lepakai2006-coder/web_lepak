import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const origin = formData.get('origin');
    const dest = formData.get('destination');
    const date = formData.get('date');
    navigate(`/flights?origin=${origin}&destination=${dest}&date=${date}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="z-10 w-full max-w-5xl px-4 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Elevate Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Travel Experience
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Book premium flights worldwide with our modern, secure, and seamless booking platform.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <form onSubmit={handleSearch} className="glass p-6 md:p-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="origin"
                placeholder="From (e.g. JFK)" 
                className="input-glass pl-10"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="destination"
                placeholder="To (e.g. LHR)" 
                className="input-glass pl-10"
              />
            </div>
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="date" 
                name="date"
                className="input-glass pl-10"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2 md:w-auto w-full">
              <Search className="w-5 h-5" />
              <span>Search Flights</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
