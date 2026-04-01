# Unit of Work Dependencies — HOA Management System

## Dependency Matrix

| Unit | Depends On | Can Parallel With |
|---|---|---|
| Unit 1 — Foundation | None (first unit) | — |
| Unit 2 — Billing | Unit 1 | — |
| Unit 3 — Maintenance | Unit 1 | Units 4, 5 |
| Unit 4 — Amenity Booking | Unit 1, Unit 2 (BullMQ) | Units 3, 5 |
| Unit 5 — Document Repository | Unit 1 | Units 3, 4 |
| Unit 6 — Communication | Units 1–5 complete | — |
| Unit 7 — Security & Access | Units 1, 6 complete | Unit 8 |
| Unit 8 — Analytics | Units 1–7 complete | Unit 7 |

---

## Development Sequence

```
PHASE 1
+------------------+     +------------------+
|   Unit 1         |---->|   Unit 2         |
|   Foundation     |     |   Billing        |
+------------------+     +------------------+
        |
        v
PHASE 2 (Units 3, 4, 5 can overlap after Unit 1 + 2 complete)
+------------------+  +------------------+  +------------------+
|   Unit 3         |  |   Unit 4         |  |   Unit 5         |
|   Maintenance    |  |   Amenity        |  |   Documents      |
+------------------+  +------------------+  +------------------+
        |                     |                     |
        +---------------------+---------------------+
                              |
                              v
PHASE 3
+------------------+
|   Unit 6         |
|   Communication  |
+------------------+
        |
        v
PHASE 4 (Units 7 and 8 can overlap)
+------------------+  +------------------+
|   Unit 7         |  |   Unit 8         |
|   Security       |  |   Analytics      |
+------------------+  +------------------+
```

---

## Critical Path

The critical path through the system is:

**Unit 1 → Unit 2 → Unit 3/4/5 → Unit 6 → Unit 7 → Unit 8**

Unit 1 (Foundation) is the single most critical unit — all other units depend on it. It must be completed and stable before any other unit begins.

---

## Shared Infrastructure Dependencies

All units share the following infrastructure provisioned in Unit 1:

| Infrastructure | Provisioned In | Used By |
|---|---|---|
| AWS VPC + Networking | Unit 1 | All units |
| AWS RDS (PostgreSQL) | Unit 1 | All units |
| AWS ElastiCache (Redis) | Unit 1 | Units 1, 2, 3, 6 |
| AWS S3 | Unit 1 | Units 1, 3, 5, 7, 8 |
| AWS ECS (Fargate) | Unit 1 | All units |
| AWS CloudFront + S3 (Frontend) | Unit 1 | All units |
| AWS API Gateway | Unit 1 | All units |
| AWS SES | Unit 1 | Units 1, 2, 3, 4 |
| BullMQ (Redis-backed) | Unit 2 | Units 2, 4, 6 |
| WebSocket (ECS) | Unit 3 | Units 3, 7 |
| FCM / AWS SNS (Push) | Unit 6 | Units 2, 3, 4, 6, 7 |
| Twilio / AWS SNS (SMS) | Unit 6 | Unit 6 |

---

## Integration Points Between Units

| From Unit | To Unit | Integration |
|---|---|---|
| Unit 2 (Billing) | Unit 1 (Resident) | Fetch resident profiles for invoice generation |
| Unit 3 (Maintenance) | Unit 1 (File) | S3 pre-signed URLs for photo uploads |
| Unit 4 (Amenity) | Unit 2 (BullMQ) | Booking reminder scheduled jobs |
| Unit 6 (Communication) | Unit 1 (Resident) | Fetch all resident device tokens for push dispatch |
| Unit 7 (Security) | Unit 1 (Resident) | Resident identity lookup for gate guard |
| Unit 8 (Analytics) | Units 2–7 | Aggregate data from all modules for dashboards |
