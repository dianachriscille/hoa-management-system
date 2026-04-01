# Tech Stack Decisions — Unit 3: Maintenance Request Tracking

## Inherited from Unit 1 & 2
All prior tech stack decisions apply: NestJS, TypeScript, React, Vite, TypeORM, BullMQ, Winston, AWS stack, Terraform.

## Maintenance-Specific Additions

| Concern | Decision | Rationale |
|---|---|---|
| WebSocket server | socket.io (NestJS Gateway) | Built-in NestJS WebSocket support; auto-reconnect, rooms, namespaces |
| WebSocket Redis adapter | `@socket.io/redis-adapter` | Required for multi-instance ECS broadcasting via shared Redis pub/sub |
| WebSocket client | `socket.io-client` (already in frontend deps) | Matches server; handles auto-reconnect with exponential backoff |
| BullMQ queues added | `maintenance-auto-close`, `maintenance-notifications` | Separate queues for auto-close jobs and notification dispatch |
| Analytics queries | TypeORM QueryBuilder with raw SQL for aggregations | GROUP BY + AVG calculations more efficient via raw SQL than ORM |
| Request number sequence | PostgreSQL sequence `maintenance_request_seq` | Atomic, no race conditions |
