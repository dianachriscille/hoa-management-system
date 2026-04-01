# NFR Design Patterns — Unit 3: Maintenance Request Tracking

## 1. Real-Time WebSocket Pattern

### Pattern: NestJS Gateway + Redis Adapter (Multi-Instance)
**Addresses**: RT-01 to RT-05, PERF-M03
**Implementation**:
- NestJS `@WebSocketGateway()` with socket.io
- Redis adapter configured at bootstrap — all ECS instances share pub/sub channel
- JWT authentication on WebSocket handshake via `WsJwtGuard`
- Each authenticated user joins personal room: `user:{userId}`
- Status updates broadcast to room: `server.to('user:{userId}').emit('maintenance:status-update', payload)`

```typescript
// Gateway pattern
@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
export class MaintenanceGateway {
  @WebSocketServer() server: Server;

  broadcastStatusUpdate(userId: string, payload: StatusUpdateDto) {
    this.server.to(`user:${userId}`).emit('maintenance:status-update', payload);
  }
}

// Client auto-reconnect (socket.io default)
const socket = io(API_URL, {
  auth: { token: localStorage.getItem('accessToken') },
  reconnectionDelayMax: 30000,
  reconnectionAttempts: Infinity,
});
socket.on('reconnect', () => queryClient.invalidateQueries(['maintenance-requests']));
```

---

### Pattern: WebSocket Fallback to Push Notification
**Addresses**: REL-M01
**Implementation**:
- After broadcasting WebSocket event, always enqueue a push notification job in `maintenance-notifications` BullMQ queue
- Push notification serves as guaranteed delivery fallback for offline/disconnected residents
- No deduplication needed — resident sees both if online (WebSocket updates UI silently, push appears as notification)

---

## 2. Status Transition State Machine Pattern

### Pattern: Explicit State Machine with Transition Guard
**Addresses**: STAT-01 to STAT-08
**Implementation**:

```typescript
const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  Submitted:   ['Assigned'],
  Assigned:    ['InProgress', 'Submitted'],  // Submitted = reassign reset
  InProgress:  ['Resolved'],
  Resolved:    ['Closed', 'Submitted'],       // Submitted = reopen
  Closed:      [],                            // Terminal
};

function assertValidTransition(from: MaintenanceStatus, to: MaintenanceStatus, role: Role) {
  if (!VALID_TRANSITIONS[from].includes(to)) throw new BadRequestException(`Invalid transition: ${from} → ${to}`);
  // Role enforcement
  const pmOnly = ['Submitted→Assigned', 'Assigned→InProgress', 'InProgress→Resolved'];
  const residentOnly = ['Resolved→Closed', 'Resolved→Submitted'];
  if (pmOnly.includes(`${from}→${to}`) && role !== Role.PropertyManager) throw new ForbiddenException();
  if (residentOnly.includes(`${from}→${to}`) && role !== Role.Resident) throw new ForbiddenException();
}
```

---

## 3. Transactional Status Update Pattern

### Pattern: DB Transaction for Status + History
**Addresses**: REL-M04
**Implementation**:
- All status changes wrapped in TypeORM `QueryRunner` transaction
- Both `MaintenanceRequest` update and `StatusHistory` insert committed atomically
- On transaction failure: rollback, return 500, log error

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  await queryRunner.manager.update(MaintenanceRequestEntity, id, { status: newStatus });
  await queryRunner.manager.save(StatusHistoryEntity, historyEntry);
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

---

## 4. Internal Notes Filtering Pattern

### Pattern: Role-Based Response Filtering
**Addresses**: SEC-M02
**Implementation**:
- `RequestNote` records fetched with `isInternal` field
- In service layer: filter notes based on requesting user's role
- Resident role: return only notes where `isInternal = false`
- PropertyManager / BoardMember: return all notes
- Never expose `isInternal` field value to Resident in API response

---

## 5. Auto-Close Delayed Job Pattern

### Pattern: BullMQ Delayed Job with Idempotent Execution
**Addresses**: STAT-04, REL-M02
**Implementation**:
- On Resolved: enqueue job with `delay: 7 * 24 * 3600 * 1000` (7 days in ms)
- Job payload: `{ requestId }`
- On execution: check current status — only close if still `Resolved` (idempotent)
- On reopen/confirm: cancel job using `job.remove()` before status change
- 24h warning job: separate delayed job at 6 days — sends resident notification

---

## 6. S3 Photo Security Pattern

### Pattern: Pre-signed GET URLs with Short Expiry
**Addresses**: SEC-M03
**Implementation**:
- Photos stored in S3 with no public access
- On request detail fetch: generate pre-signed GET URLs (15-min expiry) for each photo key
- Frontend renders `<img src={presignedUrl} />` — URL expires after 15 min
- On page revisit: new pre-signed URLs generated automatically via API call
