import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await api.get(`/flights/${id}`);
        setFlight(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (flight.booked_seats?.includes(seat)) return;
    
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
      const newPassengers = { ...passengers };
      delete newPassengers[seat];
      setPassengers(newPassengers);
    } else {
      setSelectedSeats([...selectedSeats, seat]);
      setPassengers({ ...passengers, [seat]: '' });
    }
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) return alert('Select at least one seat');
    
    const passengerData = selectedSeats.map(seat => ({
      seat,
      name: passengers[seat] || 'Guest'
    }));

    try {
      await api.post('/bookings', {
        flight_id: id,
        total_price: flight.price * selectedSeats.length,
        passengers: passengerData
      });
      alert('Booking successful!');
      navigate('/dashboard');
    } catch (error) {
      alert('Booking failed');
    }
  };

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;
  if (!flight) return <div className="text-center mt-20 text-white">Flight not found</div>;

  // Generate seat map (e.g., 10 rows, 4 seats per row: A, B, C, D)
  const rows = 10;
  const cols = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6">
        <h2 className="text-2xl font-bold mb-6">Select Seats</h2>
        <div className="flex flex-col items-center bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="w-full max-w-sm mb-8 text-center text-gray-400 text-sm">Front of Aircraft</div>
          
          <div className="grid gap-4">
            {Array.from({ length: rows }).map((_, rIndex) => (
              <div key={rIndex} className="flex gap-4">
                {cols.map((col, cIndex) => {
                  const seatNumber = `${rIndex + 1}${col}`;
                  const isBooked = flight.booked_seats?.includes(seatNumber);
                  const isSelected = selectedSeats.includes(seatNumber);
                  
                  return (
                    <React.Fragment key={seatNumber}>
                      <button
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatNumber)}
                        className={`w-10 h-10 rounded-t-lg border transition-all ${
                          isBooked ? 'bg-red-500/50 border-red-500 cursor-not-allowed' :
                          isSelected ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                          'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {seatNumber}
                      </button>
                      {cIndex === 1 && <div className="w-6"></div> /* Aisle */}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="glass p-6">
          <h2 className="text-2xl font-bold mb-4">Flight Details</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong className="text-white">Route:</strong> {flight.origin} ➔ {flight.destination}</p>
            <p><strong className="text-white">Date:</strong> {new Date(flight.departure_time).toLocaleDateString()}</p>
            <p><strong className="text-white">Price per seat:</strong> ${flight.price}</p>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="glass p-6">
            <h2 className="text-2xl font-bold mb-4">Passenger Details</h2>
            <div className="space-y-4">
              {selectedSeats.map(seat => (
                <div key={seat}>
                  <label className="block text-sm text-gray-300 mb-1">Passenger for Seat {seat}</label>
                  <input
                    type="text"
                    className="input-glass"
                    value={passengers[seat]}
                    onChange={(e) => setPassengers({ ...passengers, [seat]: e.target.value })}
                    placeholder="Full Name"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="text-xl">
                Total: <span className="font-bold text-white">${flight.price * selectedSeats.length}</span>
              </div>
              <button onClick={handleBook} className="btn-primary">Confirm Booking</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Booking;
