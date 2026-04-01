# Deployment Architecture — Unit 3: Maintenance Request Tracking

## Deployment Model
Unit 3 is deployed as part of the same NestJS monolith and React SPA. One new infrastructure component added: WebSocket API Gateway.

## Deployment Steps for Unit 3

```
1. Add MaintenanceModule to AppModule imports
2. Register MaintenanceGateway (socket.io) in NestJS bootstrap
3. Configure @socket.io/redis-adapter with shared ElastiCache Redis
4. Add maintenance feature routes to React Router
5. Run new TypeORM migrations (maintenance tables)
6. Apply Terraform changes (WebSocket API Gateway, ECS port 3001, CloudWatch alarms)
7. Deploy via GitHub Actions CI/CD pipeline
```

## WebSocket Architecture

```
Browser (socket.io-client)
    |
    | wss://api.{domain}/socket.io/
    v
AWS API Gateway (WebSocket API)
    |
    | VPC Link → port 3001
    v
ECS Fargate (NestJS — socket.io server)
    |
    | Redis pub/sub (@socket.io/redis-adapter)
    v
AWS ElastiCache Redis (shared from Unit 1)
    |
    | All ECS instances subscribe to same channel
    | → broadcast to user:{userId} room on any instance
```

## Database Migrations (Unit 3)

```
backend/src/database/migrations/
└── 1720915400000-CreateMaintenanceTables.ts
    Creates: maintenance_request, status_history, request_photo, request_note tables
    Creates: PostgreSQL sequence maintenance_request_seq
```

## BullMQ Queue Schedule

```
Redis (ElastiCache — shared)
├── Queue: maintenance-auto-close
│   └── Delayed jobs: enqueued on Resolved (delay = 7 days)
│   └── Warning jobs: enqueued on Resolved (delay = 6 days)
└── Queue: maintenance-notifications
    └── On-demand: enqueued on every status change
```
