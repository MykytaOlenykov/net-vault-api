-- This is an empty migration.
INSERT INTO "public"."roles" (id, name, description)
VALUES (gen_random_uuid(), 'Administrator', 'Full system access'),
(gen_random_uuid(), 'Operator', 'Device management access'),
(gen_random_uuid(), 'Viewer', 'Read-only access'),
(gen_random_uuid(), 'Auditor', 'Audit and review access');