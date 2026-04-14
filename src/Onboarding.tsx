import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { SQUADS } from './constants';
import { Batch, Role } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const Onboarding: React.FC = () => {
  const { user, refreshProfile, isDemoMode } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [squadId, setSquadId] = useState('');
  const [batch, setBatch] = useState<Batch>(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !squadId) return;

    setSubmitting(true);
    try {
      const isDummyAdmin = sessionStorage.getItem('dummy_admin') === 'true';
      const profileData = {
        uid: user.uid,
        name,
        email: user.email || 'dummy@example.com',
        squadId,
        batch,
        role: (isDummyAdmin ? 'admin' : 'employee') as Role,
      };

      if (isDemoMode) {
        localStorage.setItem(`demo_profile_${user.uid}`, JSON.stringify(profileData));
        // Update demo_users list
        const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const existingIndex = demoUsers.findIndex((u: any) => u.uid === user.uid);
        if (existingIndex >= 0) {
          demoUsers[existingIndex] = profileData;
        } else {
          demoUsers.push(profileData);
        }
        localStorage.setItem('demo_users', JSON.stringify(demoUsers));
      } else {
        await setDoc(doc(db, 'users', user.uid), profileData);
      }

      sessionStorage.removeItem('dummy_admin');
      toast.success('Profile created successfully!');
      await refreshProfile();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to HybridSeat</CardTitle>
          <CardDescription>Complete your profile to start booking seats.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squad">Squad</Label>
              <Select onValueChange={setSquadId} required>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select your squad" />
                </SelectTrigger>
                <SelectContent>
                  {SQUADS.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id}>
                      {squad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select onValueChange={(v) => setBatch(Number(v) as Batch)} defaultValue="1">
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Batch 1 (Mon-Wed Week 1)</SelectItem>
                  <SelectItem value="2">Batch 2 (Thu-Fri Week 1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
