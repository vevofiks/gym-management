from app.core.database import SessionLocal
from app.models.member import Member
from app.models.member_fee import MemberFee
from app.services.audit_service import log_activity
import sys


def backfill():
    db = SessionLocal()
    try:
        print("Starting backfill of audit logs...")

        # 1. Backfill Member Registrations
        members = db.query(Member).filter(Member.is_deleted == False).all()
        print(f"Found {len(members)} members.")
        for m in members:
            # Check if already logged (avoid duplicates if script run twice)
            from app.models.audit_log import AuditLog

            exists = (
                db.query(AuditLog)
                .filter(
                    AuditLog.type == "member_registration",
                    AuditLog.meta["member_id"].as_integer() == m.id,
                )
                .first()
            )

            if not exists:
                log_activity(
                    db,
                    tenant_id=m.tenant_id,
                    type="member_registration",
                    description=f"New member registered: {m.first_name} {m.last_name}",
                    meta={"member_id": m.id, "plan_id": m.plan_id},
                )

        # 2. Backfill Payments
        fees = db.query(MemberFee).all()
        print(f"Found {len(fees)} fee records.")
        for f in fees:
            # Get member info
            m = db.query(Member).filter(Member.id == f.member_id).first()
            if not m:
                continue

            exists = (
                db.query(AuditLog)
                .filter(
                    AuditLog.type == "payment",
                    AuditLog.meta["fee_id"].as_integer() == f.id,
                )
                .first()
            )

            if not exists:
                log_activity(
                    db,
                    tenant_id=f.tenant_id,
                    type="payment",
                    description=f"Payment of ₹{f.amount} received from {m.first_name} {m.last_name}",
                    meta={
                        "member_id": f.member_id,
                        "amount": float(f.amount),
                        "fee_id": f.id,
                    },
                    user_id=f.created_by,
                )

        print("✅ Backfill completed successfully.")

    except Exception as e:
        print(f"❌ Error during backfill: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    backfill()
