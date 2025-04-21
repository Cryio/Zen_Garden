import React from 'react';
import { Card } from "@/components/ui/card";
import Garden3D from './components/Garden3D';
import { useAuth } from '@/context/AuthContext';

export default function Garden() {
  const { user } = useAuth();

  return (
    <div className="h-screen w-screen fixed top-0 left-0 p-4 bg-background">
      {/* 3D Garden Canvas */}
      <Card className="w-full h-full overflow-hidden rounded-none border-0">
        <Garden3D />
      </Card>
    </div>
  );
} 