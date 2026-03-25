alter table public.users
add column if not exists points integer not null default 0;

alter table public.applications
add column if not exists attended_at timestamptz,
add column if not exists attendance_marked_by text,
add column if not exists points_awarded_at timestamptz;

create or replace function public.confirm_attendance_and_award_points(
  target_post_id text,
  target_application_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_is_admin boolean := false;
  post_record posts%rowtype;
  award_points integer := 0;
  processed_application_ids text[];
  awarded_count integer := 0;
begin
  if caller_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select exists(
    select 1
    from users
    where id::uuid = caller_id and role = 'admin'
  ) into caller_is_admin;

  select *
  into post_record
  from posts
  where id = target_post_id;

  if not found then
    raise exception '게시글 정보를 찾을 수 없습니다.';
  end if;

  if post_record.author_id::uuid <> caller_id and not caller_is_admin then
    raise exception '참여 확인 권한이 없습니다.';
  end if;

  if post_record.due_date is null then
    raise exception '봉사 진행일이 설정되지 않았습니다.';
  end if;

  if (post_record.due_date at time zone 'Asia/Seoul')::date > (now() at time zone 'Asia/Seoul')::date then
    raise exception '봉사 진행일 이후에만 참여 확인할 수 있습니다.';
  end if;

  if target_application_ids is null or array_length(target_application_ids, 1) is null then
    raise exception '참여 확인할 신청자를 선택해 주세요.';
  end if;

  if post_record.volunteer_hours is null or post_record.volunteer_hours < 1 then
    raise exception '봉사 시간이 올바르지 않습니다.';
  end if;

  award_points := post_record.volunteer_hours * 2;

  with updated_applications as (
    update applications
    set
      attended_at = now(),
      attendance_marked_by = caller_id::text,
      points_awarded_at = now()
    where post_id = target_post_id
      and id = any(target_application_ids)
      and status = 'approved'
      and attended_at is null
      and points_awarded_at is null
    returning id, user_id
  ), updated_users as (
    update users
    set points = coalesce(points, 0) + award_points
    where id in (select user_id from updated_applications)
    returning id
  )
  select array_agg(id), count(*)
  into processed_application_ids, awarded_count
  from updated_applications;

  if processed_application_ids is null or array_length(processed_application_ids, 1) is null then
    return jsonb_build_object(
      'awardedCount', 0,
      'awardedPoints', award_points
    );
  end if;

  return jsonb_build_object(
    'awardedCount', awarded_count,
    'awardedPoints', award_points
  );
end;
$$;

grant execute on function public.confirm_attendance_and_award_points(text, text[]) to authenticated;
