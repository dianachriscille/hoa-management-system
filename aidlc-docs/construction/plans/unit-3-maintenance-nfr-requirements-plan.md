# NFR Requirements Plan — Unit 3: Maintenance Request Tracking

## Inherited from Unit 1
All base NFRs apply: < 500ms p95, 50 concurrent sessions, RDS, Redis, ECS auto-scaling, CloudWatch, DPA 2012, TLS, encryption at rest.

## Maintenance-Specific Questions

### Question 1
What is the acceptable latency for real-time WebSocket status updates to reach the resident's browser?

A) < 1 second end-to-end (from PM saves status to resident sees update)
B) < 3 seconds end-to-end
C) Near real-time is preferred but not strictly required — polling fallback acceptable
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
Should the WebSocket connection support reconnection if the resident's browser loses connectivity?

A) Yes — auto-reconnect with exponential backoff (socket.io handles this by default)
B) No — resident must manually refresh the page
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
How long should maintenance request data and photos be retained?

A) Indefinitely — all requests and photos kept forever
B) 3 years — then archived or deleted
C) 1 year — same as resident data retention policy
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Execution Checklist

- [x] Step 1: Generate nfr-requirements.md
- [x] Step 2: Generate tech-stack-decisions.md
