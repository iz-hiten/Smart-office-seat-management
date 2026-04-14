import React from 'react';
import { Seat, Booking, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Armchair, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SeatGridProps {
  seats: Seat[];
  bookings: Booking[];
  userProfile: UserProfile;
  onSeatClick: (seat: Seat) => void;
}

export const SeatGrid: React.FC<SeatGridProps> = ({ seats, bookings, userProfile, onSeatClick }) => {
  const getSeatStatus = (seatId: string) => {
    const booking = bookings.find((b) => b.seatId === seatId);
    if (booking) {
      return { status: 'booked', user: booking.userName, userId: booking.userId };
    }
    return { status: 'available' };
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-4 md:gap-6">
      {seats.map((seat) => {
        const { status, user, userId } = getSeatStatus(seat.id);
        const isUserSeat = userId === userProfile.uid;
        const isFloater = seat.type === 'floater';
        const isSquadSeat = seat.squadId === userProfile.squadId;

        return (
          <motion.button
            key={seat.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSeatClick(seat)}
            className={cn(
              "relative flex flex-col items-center justify-center aspect-square p-2 rounded-xl transition-all duration-300",
              "border backdrop-blur-md group",
              status === 'available' 
                ? "bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20" 
                : isUserSeat 
                  ? "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "bg-red-500/10 border-red-500/20 opacity-70 cursor-not-allowed"
            )}
            title={status === 'booked' ? `Booked by ${user}` : `Seat ${seat.id}`}
          >
            <div className="relative">
              <Armchair className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-colors duration-300",
                status === 'available' 
                  ? isFloater ? "text-cyan-400" : isSquadSeat ? "text-indigo-400" : "text-slate-500"
                  : isUserSeat ? "text-emerald-400" : "text-red-400"
              )} />
              {status === 'booked' && (
                <div className={cn(
                  "absolute -top-1 -right-1 rounded-full p-0.5 border",
                  isUserSeat ? "bg-emerald-500 border-emerald-400" : "bg-red-500 border-red-400"
                )}>
                  <UserIcon className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            <span className={cn(
              "text-[9px] font-bold mt-1 tracking-tight transition-colors",
              status === 'available' ? "text-slate-400 group-hover:text-slate-200" : "text-slate-300"
            )}>
              {seat.id}
            </span>

            {isFloater && status === 'available' && (
              <div className="absolute top-1 right-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
            )}
            
            {status === 'booked' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-xl">
                <span className="text-[8px] font-bold text-white px-1 text-center leading-tight">
                  {user?.split(' ')[0]}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
