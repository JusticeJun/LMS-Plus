import { useState } from 'react';
import type { Session } from '../../models/session';
import { profileDisplayImageUrl, safeProfileImageUrl } from '../../adapter/session';
import { Icon } from './Icon';

type ProfileAvatarProps = { session: Session; large?: boolean };

export function ProfileAvatar({ session, large = false }: ProfileAvatarProps) {
  const photoUrl =
    session.status === 'authenticated' ? safeProfileImageUrl(session.photoUrl) : undefined;
  // A changed source mounts a fresh image and can recover from an earlier load error.
  return (
    <span className={large ? 'lp-large-avatar' : 'lp-avatar'}>
      <AvatarImage
        key={photoUrl ?? 'default'}
        photoUrl={profileDisplayImageUrl(photoUrl)}
        originalUrl={photoUrl}
      />
    </span>
  );
}

function AvatarImage({ photoUrl, originalUrl }: { photoUrl?: string; originalUrl?: string }) {
  const [useOriginal, setUseOriginal] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!photoUrl || failed) return <Icon name="user" />;
  return (
    <img
      src={useOriginal ? originalUrl : photoUrl}
      alt=""
      referrerPolicy="same-origin"
      onError={() => {
        if (!useOriginal && originalUrl && originalUrl !== photoUrl) setUseOriginal(true);
        else setFailed(true);
      }}
    />
  );
}
