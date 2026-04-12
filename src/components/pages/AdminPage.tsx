import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import MembersAdmin from '@/components/admin/MembersAdmin';
import RSVPsAdmin from '@/components/admin/RSVPsAdmin';
import EnrollmentsAdmin from '@/components/admin/EnrollmentsAdmin';
import VolunteersAdmin from '@/components/admin/VolunteersAdmin';
import ResourcesAdmin from '@/components/admin/ResourcesAdmin';
import PrayerRequestsAdmin from '@/components/admin/PrayerRequestsAdmin';
import AdminsManager from '@/components/admin/AdminsManager';
import EventsAdmin from '@/components/admin/EventsAdmin';
import TrainingsAdmin from '@/components/admin/TrainingsAdmin';
import VolunteerAdmin from '@/components/admin/VolunteerAdmin';
import StoreAdmin from '@/components/admin/StoreAdmin';
import ForumAdmin from '@/components/admin/ForumAdmin';
import ReportsAdmin from '@/components/admin/ReportsAdmin';

type AdminSection = 'dashboard' | 'members' | 'rsvps' | 'enrollments' | 'volunteers' | 'resources' | 'prayers' | 'admins' | 'events' | 'trainings' | 'volunteer' | 'store' | 'forum' | 'reports';

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><LoadingSpinner message="Checking access..." /></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard />;
      case 'members': return <MembersAdmin />;
      case 'rsvps': return <RSVPsAdmin />;
      case 'enrollments': return <EnrollmentsAdmin />;
      case 'volunteers': return <VolunteersAdmin />;
      case 'resources': return <ResourcesAdmin />;
      case 'prayers': return <PrayerRequestsAdmin />;
      case 'admins': return <AdminsManager />;
      case 'events': return <EventsAdmin />;
      case 'trainings': return <TrainingsAdmin />;
      case 'volunteer': return <VolunteerAdmin />;
      case 'store': return <StoreAdmin />;
      case 'forum': return <ForumAdmin />;
      case 'reports': return <ReportsAdmin />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </AdminLayout>
  );
}
