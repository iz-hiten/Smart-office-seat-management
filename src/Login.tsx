import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { LogIn, User, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleDummyLogin = (isAdmin: boolean) => {
    loginAsDemo(isAdmin);
    toast.success(`Logged in as Dummy ${isAdmin ? 'Admin' : 'User'}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md glass text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <CardTitle className="text-3xl font-bold">HybridSeat</CardTitle>
          <CardDescription className="text-slate-400">
            Smart Office Seat Booking for Hybrid Teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-slate-400 mb-4">
            <p>• 50 Total Seats (40 Fixed, 10 Floater)</p>
            <p>• Automated Rotation Schedules</p>
            <p>• Real-time Availability</p>
          </div>
          
          <Button onClick={handleLogin} className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 transition-all">
            Sign in with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#020617] px-2 text-slate-500">Demo Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleDummyLogin(false)} 
              className="glass border-white/10 hover:bg-white/5"
            >
              <User className="w-4 h-4 mr-2" /> Dummy User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDummyLogin(true)} 
              className="glass border-white/10 hover:bg-white/5"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Dummy Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
