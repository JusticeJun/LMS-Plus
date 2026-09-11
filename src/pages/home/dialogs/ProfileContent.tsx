import { ProfileAvatar } from '../../../components/ui/ProfileAvatar';
import type { HomeData } from '../../../models/home';
import type { Surface } from '../types';
import { Icon } from '../../../components/ui/Icon';
import { login } from '../../../adapter/session';

export function ProfileContent({
  data,
  onOpen,
  onHome,
}: {
  data: HomeData;
  onOpen: (surface: Surface) => void;
  onHome: () => void;
}) {
  const guest = data.session.status === 'guest';
  return (
    <div className="lp-account">
      <ProfileAvatar session={data.session} large />
      <h3>
        {guest
          ? 'LMS+에 오신 것을 환영해요'
          : data.session.status === 'authenticated'
            ? (data.session.name ?? '내 프로필')
            : '계정 정보를 확인하고 있어요'}
      </h3>
      <p>
        {guest
          ? '학교 계정으로 로그인하고 나의 학습을 시작하세요.'
          : data.session.status === 'authenticated'
            ? 'Smart-LMS에 로그인되어 있어요.'
            : '로그인 상태가 확인되면 프로필이 표시됩니다.'}
      </p>
      {guest ? (
        <button className="lp-primary" onClick={login}>
          학교 계정으로 로그인
          <Icon name="login" />
        </button>
      ) : (
        <div className="lp-feature-grid">
          <button onClick={onHome}>
            <Icon name="book" />내 수강과목
          </button>
          <button onClick={() => onOpen('todos')}>
            <Icon name="check" />
            나의 To-do
          </button>
        </div>
      )}
    </div>
  );
}
