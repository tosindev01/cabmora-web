import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  type CreatorStudioProfileDto,
  DEFAULT_STUDIO_PROFILE,
  loadPublicCreatorStudioProfile,
} from '@/features/account/data';
import { CreatorLandingRenderer } from '@/features/account/components/CreatorLandingRenderer';

export default function CreatorLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<CreatorStudioProfileDto>({
    ...DEFAULT_STUDIO_PROFILE,
    slug: slug || DEFAULT_STUDIO_PROFILE.slug,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadPublicCreatorStudioProfile(slug || DEFAULT_STUDIO_PROFILE.slug)
      .then((loaded) => {
        if (active) {
          setProfile(loaded);
          document.title = `${loaded.studio_name} — ${loaded.specialization} | Cabmora`;
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-noir text-canvas flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
          <div className="font-serif text-[18px] text-gold">Loading Studio Portfolio…</div>
        </div>
      </div>
    );
  }

  return <CreatorLandingRenderer profile={profile} />;
}

