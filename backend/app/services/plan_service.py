from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, List, Tuple
from decimal import Decimal
import json

from app.models.membership_plan import MembershipPlan
from app.models.member import Member
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


def create_plan(db: Session, plan_data, tenant_id: int) -> MembershipPlan:
    """Create a new membership plan for a gym."""
    # Check if plan name already exists for this tenant
    existing_plan = (
        db.query(MembershipPlan)
        .filter(
            and_(
                MembershipPlan.tenant_id == tenant_id,
                MembershipPlan.name == plan_data.name,
                MembershipPlan.is_active == True,
            )
        )
        .first()
    )

    if existing_plan:
        raise UserAlreadyExistsException(
            f"Plan '{plan_data.name}' already exists for this gym"
        )

    # Convert features list to JSON string
    features_json = json.dumps(plan_data.features) if plan_data.features else None

    db_plan = MembershipPlan(
        tenant_id=tenant_id,
        name=plan_data.name,
        description=plan_data.description,
        duration_days=plan_data.duration_days,
        price=plan_data.price,
        features=features_json,
    )

    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    # Parse features JSON back to list for response
    if db_plan.features:
        try:
            db_plan.features = json.loads(db_plan.features)
        except json.JSONDecodeError:
            db_plan.features = []

    logger.info(
        f"Created plan: {db_plan.name} (ID: {db_plan.id}) for tenant {tenant_id}"
    )
    return db_plan


def get_plan_by_id(
    db: Session, plan_id: int, tenant_id: int, is_active: bool = True
) -> Optional[MembershipPlan]:
    """Get plan by ID with tenant validation."""
    print("Get id", plan_id)
    print("Get tenant id", tenant_id)
    print("Get is active", is_active)
    plan = (
        db.query(MembershipPlan)
        .filter(
            and_(
                MembershipPlan.id == plan_id,
                MembershipPlan.tenant_id == tenant_id,
            )
        )
        .first()
    )

    # Parse features JSON if exists
    if plan and plan.features:
        try:
            plan.features = json.loads(plan.features)
        except json.JSONDecodeError:
            plan.features = []

    return plan


def get_plans_by_tenant(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
) -> Tuple[List[MembershipPlan], int]:
    """Get all plans for a tenant with pagination."""
    query = db.query(MembershipPlan).filter(MembershipPlan.tenant_id == tenant_id)

    if active_only:
        query = query.filter(MembershipPlan.is_active == True)

    total = query.count()
    plans = (
        query.order_by(MembershipPlan.created_at.desc()).offset(skip).limit(limit).all()
    )

    # Parse features JSON for all plans
    for plan in plans:
        if plan.features:
            try:
                plan.features = json.loads(plan.features)
            except json.JSONDecodeError:
                plan.features = []

    return plans, total


def update_plan(
    plan_id: int, plan_update, tenant_id: int, db: Session
) -> Optional[MembershipPlan]:
    """Update plan details."""
    print("This is the plan id", plan_id)
    print("This is the plan update", plan_update)
    print("This is the tenant id", tenant_id)
    plan = get_plan_by_id(db, plan_id, tenant_id, plan_update.is_active)
    print("This is the plan", plan)
    if not plan:
        return None

    # Check if new name conflicts with existing plan
    if plan_update.name and plan_update.name != plan.name:
        existing = (
            db.query(MembershipPlan)
            .filter(
                and_(
                    MembershipPlan.tenant_id == tenant_id,
                    MembershipPlan.name == plan_update.name,
                    MembershipPlan.is_active == plan_update.is_active,
                    MembershipPlan.id != plan_id,
                )
            )
            .first()
        )

        if existing:
            raise UserAlreadyExistsException(
                f"Plan '{plan_update.name}' already exists"
            )

    # Update fields
    update_data = plan_update.model_dump(exclude_unset=True)

    # Handle features separately (convert to JSON)
    if "features" in update_data and update_data["features"] is not None:
        update_data["features"] = json.dumps(update_data["features"])

    for field, value in update_data.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    # Parse features back to list
    if plan.features:
        try:
            plan.features = json.loads(plan.features)
        except json.JSONDecodeError:
            plan.features = []

    logger.info(f"Updated plan: {plan.name} (ID: {plan.id})")
    return plan


def delete_plan(db: Session, plan_id: int, tenant_id: int) -> bool:
    """Soft delete a plan."""
    plan = get_plan_by_id(db, plan_id, tenant_id)
    if not plan:
        return False

    # Check if any members are using this plan
    members_count = (
        db.query(func.count(Member.id))
        .filter(and_(Member.plan_id == plan_id, Member.is_active == True))
        .scalar()
    )

    if members_count > 0:
        raise ValueError(
            f"Cannot delete plan. {members_count} active members are using this plan."
        )

    db.delete(plan)
    db.refresh(plan)
    db.commit()

    logger.info(f"Deleted plan: {plan.name} (ID: {plan.id})")
    return True


def get_plan_statistics(db: Session, plan_id: int, tenant_id: int) -> Optional[dict]:
    """Get statistics for a plan."""
    plan = get_plan_by_id(db, plan_id, tenant_id)
    if not plan:
        return None

    # Count total members
    total_members = (
        db.query(func.count(Member.id))
        .filter(and_(Member.plan_id == plan_id, Member.is_active == True))
        .scalar()
        or 0
    )

    # Count active members
    active_members = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.plan_id == plan_id,
                Member.is_active == True,
                Member.status == "active",
            )
        )
        .scalar()
        or 0
    )

    # Calculate total revenue (total_members * plan price)
    total_revenue = Decimal(total_members) * plan.price

    return {
        "plan_id": plan.id,
        "plan_name": plan.name,
        "total_members": total_members,
        "active_members": active_members,
        "total_revenue": total_revenue,
    }
