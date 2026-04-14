import React, { useEffect, useState } from 'react';
import { collection, doc, writeBatch, getDocs, query, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { SQUADS, TOTAL_SEATS, FLOATER_SEATS_COUNT } from '../constants';
import { Seat, UserProfile, Booking } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Users, 
  Armchair, 
  Settings, 
  Search,
  UserCog,
  CalendarCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatDate } from '../lib/date-utils';

export const AdminPanel: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const demoSeats = JSON.parse(localStorage.getItem('demo_seats') || '[]');
        const demoBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
        setUsers(demoUsers);
        setSeats(demoSeats);
        setBookings(demoBookings);
      } else {
        const [usersSnap, seatsSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'seats')),
          getDocs(query(collection(db, 'bookings'), where('date', '==', formatDate(new Date()))))
        ]);
        setUsers(usersSnap.docs.map(d => d.data() as UserProfile));
        setSeats(seatsSnap.docs.map(d => d.data() as Seat).sort((a, b) => a.number - b.number));
        setBookings(bookingsSnap.docs.map(d => d.data() as Booking));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  const seedSeats = async () => {
    setLoading(true);
    try {
      const allSeats: Seat[] = [];
      let seatNum = 1;
      for (const squad of SQUADS) {
        for (let i = 0; i < 5; i++) {
          const seatId = `S${seatNum.toString().padStart(2, '0')}`;
          allSeats.push({ id: seatId, number: seatNum, type: 'fixed', squadId: squad.id });
          seatNum++;
        }
      }
      for (let i = 0; i < FLOATER_SEATS_COUNT; i++) {
        const seatId = `F${(i + 1).toString().padStart(2, '0')}`;
        allSeats.push({ id: seatId, number: seatNum, type: 'floater' });
        seatNum++;
      }

      if (isDemoMode) {
        localStorage.setItem('demo_seats', JSON.stringify(allSeats));
      } else {
        const batch = writeBatch(db);
        allSeats.forEach(seat => batch.set(doc(db, 'seats', seat.id), seat));
        await batch.commit();
      }
      setSeats(allSeats);
      toast.success('Seats initialized successfully!');
    } catch (error) {
      toast.error('Failed to seed seats');
    } finally {
      setLoading(false);
    }
  };

  const clearBookings = async () => {
    if (!confirm('Are you sure you want to clear ALL bookings?')) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        localStorage.removeItem('demo_bookings');
        setBookings([]);
      } else {
        const snapshot = await getDocs(collection(db, 'bookings'));
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        setBookings([]);
      }
      toast.success('All bookings cleared');
    } catch (e) {
      toast.error('Failed to clear bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (uid: string, newRole: 'admin' | 'employee') => {
    try {
      if (isDemoMode) {
        const updated = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
        localStorage.setItem('demo_users', JSON.stringify(updated));
        setUsers(updated);
      } else {
        await updateDoc(doc(db, 'users', uid), { role: newRole });
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      }
      toast.success('User role updated');
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const seedDemoUsers = () => {
    const demoUsers: UserProfile[] = [
      { uid: 'u1', name: 'Alice Smith', email: 'alice@example.com', squadId: 'alpha', batch: 1, role: 'employee' },
      { uid: 'u2', name: 'Bob Johnson', email: 'bob@example.com', squadId: 'beta', batch: 2, role: 'employee' },
      { uid: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', squadId: 'gamma', batch: 1, role: 'employee' },
      { uid: 'u4', name: 'Diana Prince', email: 'diana@example.com', squadId: 'delta', batch: 2, role: 'admin' },
      { uid: 'u5', name: 'Ethan Hunt', email: 'ethan@example.com', squadId: 'epsilon', batch: 1, role: 'employee' },
    ];
    localStorage.setItem('demo_users', JSON.stringify(demoUsers));
    setUsers(demoUsers);
    toast.success('Demo users seeded locally');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between glass p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Admin Control Center
          </h1>
          <p className="text-slate-400 text-sm">Manage users, seats, and system configuration</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="glass">
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh Data
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass p-1 bg-white/5 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2">
            <CalendarCheck className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="seats" className="gap-2">
            <Armchair className="w-4 h-4" /> Seat Management
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="w-4 h-4" /> System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass border-white/5">
              <CardHeader className="pb-2">
                <CardDescription>Total Registered Users</CardDescription>
                <CardTitle className="text-3xl font-bold text-indigo-400">{users.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass border-white/5">
              <CardHeader className="pb-2">
                <CardDescription>Seats Configured</CardDescription>
                <CardTitle className="text-3xl font-bold text-cyan-400">{seats.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass border-white/5">
              <CardHeader className="pb-2">
                <CardDescription>Bookings Today</CardDescription>
                <CardTitle className="text-3xl font-bold text-emerald-400">{bookings.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle>Today's Bookings ({formatDate(new Date())})</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No bookings for today yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Seat</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-medium">{booking.userName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
                              {booking.seatId}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 capitalize">{booking.type}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4 glass p-4 rounded-xl">
            <Search className="w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus-visible:ring-0 text-lg"
            />
          </div>

          <Card className="glass border-white/5">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Squad</th>
                      <th className="px-6 py-4">Batch</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{user.name}</span>
                            <span className="text-xs text-slate-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-white/5 border-white/10">
                            {SQUADS.find(s => s.id === user.squadId)?.name || user.squadId}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            Batch {user.batch}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            user.role === 'admin' ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                          )}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => updateUserRole(user.uid, user.role === 'admin' ? 'employee' : 'admin')}
                            className="hover:bg-indigo-500/10 text-indigo-400"
                          >
                            <UserCog className="w-4 h-4 mr-2" />
                            Toggle Admin
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seats" className="space-y-4">
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle>Seat Inventory</CardTitle>
              <CardDescription>Overview of all physical seats in the office</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Number</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Squad Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {seats.map((seat) => (
                      <tr key={seat.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">{seat.id}</td>
                        <td className="px-6 py-4">{seat.number}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            seat.type === 'floater' ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          )}>
                            {seat.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {seat.squadId ? (
                            <Badge variant="outline" className="border-white/10">
                              {SQUADS.find(s => s.id === seat.squadId)?.name || seat.squadId}
                            </Badge>
                          ) : (
                            <span className="text-slate-500 italic">None (Floater)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-400" />
                  Seat Initialization
                </CardTitle>
                <CardDescription>
                  Re-generate the default seat layout (40 fixed, 10 floater).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This will create 5 fixed seats for each of the 8 squads and 10 general floater seats. 
                    Existing seat configurations will be overwritten.
                  </p>
                </div>
                <Button onClick={seedSeats} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Initialize Seat Layout
                </Button>
                {isDemoMode && (
                  <Button onClick={seedDemoUsers} variant="outline" className="w-full mt-3 glass border-indigo-500/30 text-indigo-300">
                    <Users className="w-4 h-4 mr-2" />
                    Seed Demo Users
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-red-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Reset booking data for the entire organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-300/70 leading-relaxed">
                    Warning: This action cannot be undone. All current and future bookings will be permanently deleted.
                  </p>
                </div>
                <Button onClick={clearBookings} disabled={loading} variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
