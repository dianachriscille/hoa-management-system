# Infrastructure Design — Unit 2: Billing & Payments

## Shared Infrastructure (from Unit 1)
All compute, network, database, cache, storage, frontend, API Gateway, SES, IAM, and CI/CD resources are shared from Unit 1. No re-provisioning required.

Reference: `aidlc-docs/construction/shared-infrastructure.md`

---

## New Infrastructure for Unit 2

### AWS Secrets Manager — New Secrets

| Secret Name | Contents | Environment |
|---|---|---|
| `hoa-system/dev/maya-api-key` | Maya Business API public key | Dev |
| `hoa-system/dev/maya-secret-key` | Maya Business API secret key | Dev |
| `hoa-system/dev/maya-webhook-secret` | HMAC-SHA256 webhook signing secret | Dev |
| `hoa-system/prod/maya-api-key` | Maya Business API public key | Prod |
| `hoa-system/prod/maya-secret-key` | Maya Business API secret key | Prod |
| `hoa-system/prod/maya-webhook-secret` | HMAC-SHA256 webhook signing secret | Prod |

Values set manually in AWS Console after Terraform provisions the secret placeholders.

---

### AWS CloudWatch — New Custom Metrics & Alarms

| Resource | Type | Config |
|---|---|---|
| `BillingMayaErrors` | Custom metric namespace: `HOASystem/Billing` | Incremented on each Maya API failure |
| `BillingJobFailures` | Custom metric namespace: `HOASystem/Billing` | Incremented on each BullMQ job failure |
| `BillingMayaErrorAlarm` | CloudWatch Alarm | Threshold: > 5 in 10 min → SNS email |
| `BillingJobFailureAlarm` | CloudWatch Alarm | Threshold: > 0 in 5 min → SNS email |

---

### IAM Task Role — Additional Permissions

The ECS task role from Unit 1 needs one additional permission for Unit 2:

```hcl
# Added to existing ECS task role policy
{
  Effect   = "Allow"
  Action   = ["cloudwatch:PutMetricData"]
  Resource = "*"
  Condition = {
    StringEquals = { "cloudwatch:namespace" = "HOASystem/Billing" }
  }
}
```

---

### Maya Webhook Endpoint

- Route: `POST /billing/webhooks/maya`
- Marked `@Public()` in NestJS — bypasses JWT auth guard
- Protected by HMAC-SHA256 signature verification middleware instead
- No API Gateway changes needed — existing `ANY /{proxy+}` catch-all handles it
- Maya webhook URL configured in Maya merchant dashboard: `https://api.{domain}/billing/webhooks/maya`

---

## Terraform Changes (Unit 2)

All changes are additive — no existing Unit 1 resources modified.

```
infrastructure/modules/secrets/main.tf     ← add maya secrets
infrastructure/modules/monitoring/main.tf  ← add billing alarms + custom metrics
infrastructure/modules/iam/main.tf         ← add cloudwatch:PutMetricData permission
```

These are applied as part of the same Terraform workspace (dev/prod) — no new workspace needed.
