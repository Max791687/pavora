-- Restore backend service_role grants without expanding client/anonymous privileges.
grant select on public.pv_app_admins to service_role;
grant select on public.profiles, public.posts, public.reels, public.content_reports, public.pv_user_presence to service_role;
grant select,insert on public.pv_admin_audit to service_role;
grant select,insert,update on public.pv_recovery_requests to service_role;
grant select,insert,update on public.pv_content_moderation to service_role;
grant update on public.content_reports to service_role;
grant usage,select on sequence public.pv_admin_audit_id_seq to service_role;
