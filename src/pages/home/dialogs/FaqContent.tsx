import { Icon } from '../../../components/ui/Icon';

export function FaqContent() {
  return (
    <div className="lp-faq">
      {[
        [
          'LMS+는 어떤 서비스인가요?',
          '국립부경대학교 Smart-LMS의 사용성을 개선하는 비공식 Chrome 확장 프로그램입니다.',
        ],
        [
          '학교 계정은 어디에서 로그인하나요?',
          '상단 로그인 버튼을 누르면 학교 Smart-LMS의 로그인 화면으로 이동합니다. LMS+는 비밀번호나 세션 쿠키를 별도로 저장하지 않습니다.',
        ],
        [
          '연동 준비 중은 무슨 뜻인가요?',
          '해당 정보의 연결이 아직 완료되지 않았다는 뜻입니다. 일정이나 과제가 없다는 의미는 아닙니다.',
        ],
        [
          '기존 LMS 화면도 사용할 수 있나요?',
          '화면 하단의 원본 LMS 보기를 누르면 기존 화면으로 돌아갈 수 있습니다. 새로고침하면 LMS+ 화면이 다시 적용됩니다.',
        ],
      ].map(([question, answer]) => (
        <details key={question}>
          <summary>
            {question}
            <Icon name="down" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
