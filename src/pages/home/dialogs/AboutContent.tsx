import { Icon } from '../../../components/ui/Icon';
import logo from '../../../assets/pknu-logo.png?inline';

export function AboutContent() {
  return (
    <div className="lp-about">
      <img src={logo} alt="국립부경대학교" />
      <span className="lp-status-pill">LMS+</span>
      <h3>학습에 더 가까운 일상</h3>
      <p>
        필요한 정보를 찾아다니는 시간을 줄이고,
        <br />
        나의 대학 생활을 한눈에 살펴보세요.
      </p>
      <div className="lp-feature-grid">
        <div>
          <Icon name="calendar" />
          <strong>일정을 한눈에</strong>
          <p>학사일정과 마감일을 가까이</p>
        </div>
        <div>
          <Icon name="book" />
          <strong>강의실을 한곳에</strong>
          <p>수강과목으로 빠르게 이동</p>
        </div>
        <div>
          <Icon name="check" />
          <strong>할 일을 차례대로</strong>
          <p>나의 학습 흐름을 이어가기</p>
        </div>
      </div>
      <p className="lp-muted">
        LMS+는 비공식 확장 프로그램입니다. 학교 계정의 인증과 학습 기록은 Smart-LMS가 관리합니다.
      </p>
    </div>
  );
}
