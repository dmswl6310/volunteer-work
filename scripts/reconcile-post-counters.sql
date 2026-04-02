-- 출시 직전 1회 실행 권장
-- posts.current_participants 와 posts.scraps 를 실제 관계 테이블 기준으로 다시 맞춥니다.

update public.posts p
set current_participants = coalesce(approved_counts.approved_count, 0)
from (
  select post_id, count(*)::integer as approved_count
  from public.applications
  where status = 'approved'
  group by post_id
) approved_counts
where p.id = approved_counts.post_id;

update public.posts
set current_participants = 0
where id not in (
  select distinct post_id
  from public.applications
  where status = 'approved'
);

update public.posts p
set scraps = coalesce(scrap_counts.scrap_count, 0)
from (
  select post_id, count(*)::integer as scrap_count
  from public.post_scraps
  group by post_id
) scrap_counts
where p.id = scrap_counts.post_id;

update public.posts
set scraps = 0
where id not in (
  select distinct post_id
  from public.post_scraps
);
