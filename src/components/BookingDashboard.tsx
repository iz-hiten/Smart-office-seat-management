import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Seat, Booking, UserProfile } from '../types';
import { SeatGrid } from '@/components/SeatGrid';
import { isDesignatedDay, formatDate, getNext7Days, canBookNextDay } from '../lib/date-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Info, LogOut, ShieldCheck, Armchair, Users } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';

export const BookingDashboard: React.FC = () => {
  const { profile, isDemoMode, logout } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [loading, setLoading] = useState(true);

  const next7Days = getNext7Days();

  useEffect(() => {
    // Fetch all seats once
    const fetchSeats = async () => {
      if (isDemoMode) {
        const saved = localStorage.getItem('demo_seats');
        if (saved) {
          setSeats(JSON.parse(saved));
        }
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'seats'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setLoading(false);
        return;
      }
      setSeats(snapshot.docs.map(d => d.data() as Seat).sort((a, b) => a.number - b.number));
    };
    fetchSeats();
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) {
      const saved = localStorage.getItem('demo_bookings');
      const allBookings = saved ? JSON.parse(saved) : [];
      setBookings(allBookings.filter((b: Booking) => b.date === selectedDate));
      setLoading(false);
      return;
    }

    // Real-time listener for bookings on selected date
    const q = query(collection(db, 'bookings'), where('date', '==', selectedDate));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Booking)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedDate, isDemoMode]);

  const handleSeatClick = async (seat: Seat) => {
    if (!profile) return;

    const existingBooking = bookings.find(b => b.seatId === seat.id);
    
    if (existingBooking) {
      if (existingBooking.userId === profile.uid) {
        // Cancel booking
        try {
          if (isDemoMode) {
            const saved = localStorage.getItem('demo_bookings');
            const allBookings = saved ? JSON.parse(saved) : [];
            const updated = allBookings.filter((b: Booking) => b.id !== existingBooking.id);
            localStorage.setItem('demo_bookings', JSON.stringify(updated));
            setBookings(updated.filter((b: Booking) => b.date === selectedDate));
          } else {
            await deleteDoc(doc(db, 'bookings', existingBooking.id!));
          }
          toast.success('Booking cancelled');
        } catch (e) {
          toast.error('Failed to cancel booking');
        }
      } else {
        toast.error('Seat already booked by ' + existingBooking.userName);
      }
      return;
    }

    // Booking Logic
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    const isToday = formatDate(bookingDate) === formatDate(today);
    const isTomorrow = formatDate(bookingDate) === formatDate(new Date(today.getTime() + 86400000));

    // 3 PM Rule for tomorrow
    if (isTomorrow && !canBookNextDay(today)) {
      toast.error('Booking for tomorrow opens after 3 PM');
      return;
    }

    const designated = isDesignatedDay(bookingDate, profile.batch);
    
    // Rule: Non-designated days can only book floaters
    if (!designated && seat.type === 'fixed') {
      toast.error('You can only book floater seats on non-designated days');
      return;
    }

    // Rule: Fixed seats are for specific squads (optional but good)
    if (designated && seat.type === 'fixed' && seat.squadId !== profile.squadId) {
      toast.error(`This seat is reserved for ${seat.squadId}`);
      return;
    }

    // Create Booking
    try {
      const newBooking: Booking = {
        id: isDemoMode ? Math.random().toString(36).substr(2, 9) : undefined,
        date: selectedDate,
        seatId: seat.id,
        userId: profile.uid,
        userName: profile.name,
        status: 'booked',
        type: designated ? 'designated' : 'floater'
      };

      if (isDemoMode) {
        const saved = localStorage.getItem('demo_bookings');
        const allBookings = saved ? JSON.parse(saved) : [];
        const updated = [...allBookings, newBooking];
        localStorage.setItem('demo_bookings', JSON.stringify(updated));
        setBookings(updated.filter((b: Booking) => b.date === selectedDate));
      } else {
        await addDoc(collection(db, 'bookings'), newBooking);
      }
      
      toast.success('Seat booked successfully!');
    } catch (e) {
      toast.error('Booking failed');
    }
  };

  const handleLogout = () => logout();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading seats...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            HybridSeat Dashboard
          </h1>
          <p className="text-slate-400 flex items-center gap-2 mt-1">
            Welcome back, <span className="text-slate-100 font-medium">{profile?.name}</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Batch {profile?.batch}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.role === 'admin' && (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </Badge>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-red-400">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              Your Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Current Batch</p>
              <p className="text-xl font-bold text-indigo-400">Batch {profile?.batch}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Designated Days</p>
              <p className="text-sm font-medium">
                {profile?.batch === 1 ? "Mon-Wed (W1), Thu-Fri (W2)" : "Thu-Fri (W1), Mon-Wed (W2)"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Office Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Available Today</p>
              <p className="text-xl font-bold text-emerald-400">{50 - bookings.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Floater Seats</p>
              <p className="text-xl font-bold text-cyan-400">10</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500/40 border border-indigo-500/60" />
                <span>Squad</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-500/60" />
                <span>Floater</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                <span>Yours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/5">
        <CardHeader className="border-b border-white/5 pb-0">
          <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-2 overflow-x-auto flex-nowrap w-full justify-start pb-4">
              {next7Days.map((date) => (
                <TabsTrigger 
                  key={formatDate(date)} 
                  value={formatDate(date)}
                  className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border-indigo-500/50 border border-transparent px-6 py-3 rounded-xl transition-all flex flex-col items-center min-w-[100px]"
                >
                  <span className="text-[10px] uppercase opacity-60 font-bold">{format(date, 'EEEE')}</span>
                  <span className="text-lg font-black">{format(date, 'dd')}</span>
                  <span className="text-[10px] uppercase opacity-60">{format(date, 'MMM')}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4 text-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="leading-relaxed">
              <span className="font-bold text-indigo-300">
                {format(new Date(selectedDate), 'EEEE, dd MMMM')}:
              </span>{' '}
              {isDesignatedDay(new Date(selectedDate), profile!.batch) 
                ? "This is your designated office day. You have priority for fixed seats in your squad area." 
                : "This is a non-designated day. You are welcome to use any available floater seat."}
            </p>
          </div>

          <div className="glass bg-black/20 rounded-3xl p-4 md:p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <Armchair className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold">Office Floor Plan</h2>
            </div>
            
            {seats.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No seats configured. Please contact admin.
              </div>
            ) : (
              <SeatGrid 
                seats={seats} 
                bookings={bookings} 
                userProfile={profile!} 
                onSeatClick={handleSeatClick} 
              />
            )}
          </div>

          {bookings.length > 0 && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold">Who's in the Office</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="glass bg-white/5 p-4 rounded-2xl border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                      {booking.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{booking.userName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-indigo-500/30 text-indigo-300">
                          Seat {booking.seatId}
                        </Badge>
                        <span className="text-[10px] text-slate-500 capitalize">{booking.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
