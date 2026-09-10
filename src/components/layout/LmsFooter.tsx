import logo from '../../assets/pknu-logo.png?inline';
import { Icon } from '../ui/Icon';

type LmsFooterProps = { onAbout: () => void; onHelp: () => void; onRestore: () => void };

export function LmsFooter({ onAbout, onHelp, onRestore }: LmsFooterProps) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <img src={logo} alt="국립부경대학교" />
          <span>비공식 Smart-LMS 확장 프로그램</span>
        </div>
        <div className="lp-footer-links">
          <button onClick={onAbout}>LMS+ 소개</button>
          <button onClick={onHelp}>이용 안내</button>
          <button onClick={onRestore}>
            원본 LMS 보기
            <Icon name="external" />
          </button>
        </div>
        <span className="lp-footer-motto">Beyond the Ocean, Toward a Better Tomorrow</span>
      </div>
    </footer>
  );
}
