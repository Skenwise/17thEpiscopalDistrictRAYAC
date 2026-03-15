import { useState } from 'react';
import { useMember } from '@/hooks/useMember';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import PortalLayout from '@/components/PortalLayout';
import DashboardContent from '@/components/portal/DashboardContent';
import ProfileContent from '@/components/portal/ProfileContent';
import EventsContent from '@/components/portal/EventsContent';
import DirectoryContent from '@/components/portal/DirectoryContent';
import ResourcesContent from '@/components/portal/ResourcesContent';
import TrainingContent from '@/components/portal/TrainingContent';
import GivingContent from '@/components/portal/GivingContent';
import VolunteerContent from '@/components/portal/VolunteerContent';
import ReportsContent from '@/components/portal/ReportsContent';
import CommunityForumContent from '@/components/portal/CommunityForumContent';
import MediaContent from '@/components/portal/MediaContent';
import NotificationsContent from '@/components/portal/NotificationsContent';
import StoreContent from '@/components/portal/StoreContent';
import SettingsContent from '@/components/portal/SettingsContent';

type PortalSection = 'dashboard' | 'profile' | 'events' | 'directory' | 'resources' | 'training' | 'giving' | 'volunteer' | 'reports' | 'forum' | 'media' | 'notifications' | 'store' | 'settings';

function MembersPortalContent() {
  const [activeSection, setActiveSection] = useState<PortalSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardContent />;
      case 'profile': return <ProfileContent />;
      case 'events': return <EventsContent />;
      case 'directory': return <DirectoryContent />;
      case 'resources': return <ResourcesContent />;
      case 'training': return <TrainingContent />;
      case 'giving': return <GivingContent />;
      case 'volunteer': return <VolunteerContent />;
      case 'reports': return <ReportsContent />;
      case 'forum': return <CommunityForumContent />;
      case 'media': return <MediaContent />;
      case 'notifications': return <NotificationsContent />;
      case 'store': return <StoreContent />;
      case 'settings': return <SettingsContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <PortalLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </PortalLayout>
  );
}

export default function MembersPortalPage() {
  return (
    <MemberProtectedRoute messageToSignIn="Sign in to access the members portal">
      <MembersPortalContent />
    </MemberProtectedRoute>
  );
}