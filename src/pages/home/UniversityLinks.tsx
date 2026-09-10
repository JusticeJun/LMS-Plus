import { assetUrl } from '../../assets';
import homepageImage from '../../assets/pknu-homepage-banner.png';
import portalImage from '../../assets/pknu-portal-banner.png';
import whalebeImage from '../../assets/pknu-whalebe-banner.png';
import { Icon } from '../../components/ui/Icon';

// Whalebe moved into the portal's 부경AI service. Do not use the retired domain.
const universityLinks = [
  {
    id: 'homepage',
    title: '대학교 홈페이지',
    description: '국립부경대학교',
    href: 'https://www.pknu.ac.kr/',
    image: homepageImage,
  },
  {
    id: 'portal',
    title: '포털시스템',
    description: '나의 대학 생활을 한곳에',
    href: 'https://portal.pknu.ac.kr/',
    image: portalImage,
  },
  {
    id: 'whalebe',
    title: '웨일비 · 비교과',
    description: '새로운 경험과 나의 가능성',
    href: 'https://pknuai.pknu.ac.kr/sso/index.jsp?returnurl=https%3A%2F%2Fpknuai.pknu.ac.kr%2Fweb%2FnonSbjt%2Fmain.do%3FmId%3D214',
    image: whalebeImage,
  },
] as const;

export function UniversityLinks() {
  return (
    <nav className="lp-university-links" aria-label="부경대학교 주요 서비스">
      {universityLinks.map((link) => (
        <a
          className="lp-university-link"
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.title} 새 창 열기`}
        >
          <img
            src={assetUrl(link.image)}
            alt=""
            width="2172"
            height="724"
            loading="lazy"
            decoding="async"
          />
          <span className="lp-university-link-copy">
            <strong>{link.title}</strong>
            <small>{link.description}</small>
          </span>
          <span className="lp-university-link-arrow">
            <Icon name="arrow" />
          </span>
        </a>
      ))}
    </nav>
  );
}
