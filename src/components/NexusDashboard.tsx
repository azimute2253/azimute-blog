// NexusDashboard — V2 integration wrapper
// Receives userId + userEmail from Astro server-side and renders NexusApp
import { NexusApp } from 'nexus-data';

interface Props {
  userId: string;
  userEmail: string;
}

export default function NexusDashboard({ userId, userEmail }: Props) {
  return <NexusApp userId={userId} userEmail={userEmail} />;
}
