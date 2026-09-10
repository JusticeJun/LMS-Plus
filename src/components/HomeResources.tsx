import { homeResources } from '../adapter/links';
import { Icon } from './Icon';
import { LmsLink } from './LmsLink';

export function HomeResources() {
  return (
    <section className="lp-resources" aria-label="학습 지원 서비스">
      <div className="lp-resource-grid">
        {homeResources.map((item) => (
          <LmsLink key={item.id} className="lp-card lp-resource" href={item.href}>
            <span className="lp-resource-icon">
              <Icon name={item.icon} />
            </span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </span>
            <Icon name="arrow" />
          </LmsLink>
        ))}
      </div>
    </section>
  );
}
