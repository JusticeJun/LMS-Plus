import { CardTitle } from '../../components/ui/CardTitle';
import { Icon } from '../../components/ui/Icon';
import type { Surface } from './types';
export function QuickMenu({ onOpen }: { onOpen: (surface: Surface) => void }) {
  return (
    <section className="lp-card lp-quick">
      <div className="lp-card-heading">
        <CardTitle icon="grid">Quick Menu</CardTitle>
      </div>
      <div className="lp-quick-grid">
        <button onClick={() => onOpen('profile')}>
          <Icon name="user" />
          <strong>마이페이지</strong>
          <span>내 학습 정보</span>
        </button>
        <button onClick={() => onOpen('courses')}>
          <Icon name="book" />
          <strong>개설과목</strong>
          <span>강의 찾아보기</span>
        </button>
        <button onClick={() => onOpen('faq')}>
          <Icon name="help" />
          <strong>FAQ</strong>
          <span>자주 묻는 질문</span>
        </button>
      </div>
    </section>
  );
}
