import { CardTitle } from '../../components/ui/CardTitle';
import { FeedState } from '../../components/ui/FeedState';
import { Icon } from '../../components/ui/Icon';
import { login } from '../../adapter/session';
import type { HomeData } from '../../models/home';

export function CoursesCard({
  data,
  search,
  onOpenCourse,
}: {
  data: Pick<HomeData, 'session' | 'courses'>;
  search: string;
  onOpenCourse: (id: string) => void;
}) {
  const guest = data.session.status === 'guest';
  const courses = data.courses.items.filter((course) =>
    course.name.toLocaleLowerCase().includes(search),
  );
  return (
    <section className="lp-card lp-courses" id="lp-courses">
      <div className="lp-card-heading">
        <CardTitle icon="book">내 수강과목</CardTitle>
        {data.courses.status === 'ready' && (
          <span className="lp-soft-pill">{data.courses.items.length}개 과목</span>
        )}
      </div>
      {guest ? (
        <div className="lp-login-state">
          <FeedState
            status="ready"
            icon="book"
            title="나의 강의실, 더 가까이"
            description="로그인하고 이번 학기 수강과목을 만나보세요."
          />
          <button className="lp-primary" onClick={login}>
            로그인하기
            <Icon name="arrow" />
          </button>
        </div>
      ) : courses.length ? (
        <div className="lp-course-list">
          {courses.map((course, index) => (
            <button
              className="lp-course-row"
              key={`${course.courseId}-${index}`}
              onClick={() => onOpenCourse(course.courseId)}
            >
              <strong>{course.name}</strong>
              <span>
                {[course.campus, course.section && `${course.section} 분반`]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      ) : (
        <FeedState
          status={data.courses.status}
          icon="book"
          title={
            search
              ? '검색 결과가 없어요'
              : data.courses.status === 'ready'
                ? '수강과목이 없어요'
                : '수강과목을 준비하고 있어요'
          }
          description={
            search
              ? '과목 이름을 다시 확인해 주세요.'
              : data.courses.status === 'ready'
                ? '현재 등록된 수강과목이 없습니다.'
                : '나의 강의실을 이곳에 모아 보여드릴게요.'
          }
        />
      )}
    </section>
  );
}
