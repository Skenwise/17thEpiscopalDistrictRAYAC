import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminLayout from '@/components/admin/AdminLayout';
import MembersAdmin from '@/components/admin/MembersAdmin';
import RSVPsAdmin from '@/components/admin/RSVPsAdmin';
import EnrollmentsAdmin from '@/components/admin/EnrollmentsAdmin';
import VolunteersAdmin from '@/components/admin/VolunteersAdmin';
import ResourcesAdmin from '@/components/admin/ResourcesAdmin';
import PrayerRequestsAdmin from '@/components/admin/PrayerRequestsAdmin';
import AdminsManager from '@/components/admin/AdminsManager';
import EventsAdmin from '@/components/admin/EventsAdmin';

type AdminSection = 'members' | 'rsvps' | 'enrollments' | 'volunteers' | 'resources' | 'prayers' | 'admins' | 'events';

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>('members');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="Checking access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'members': return <MembersAdmin />;
      case 'rsvps': return <RSVPsAdmin />;
      case 'enrollments': return <EnrollmentsAdmin />;
      case 'volunteers': return <VolunteersAdmin />;
      case 'resources': return <ResourcesAdmin />;
      case 'prayers': return <PrayerRequestsAdmin />;
      case 'admins': return <AdminsManager />;
      case 'events': return <EventsAdmin />;
      default: return <MembersAdmin />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </AdminLayout>
  );
}