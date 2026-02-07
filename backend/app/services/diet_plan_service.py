from sqlalchemy.orm import Session
from app.models.diet_plan import DietPlanTemplate, DietPlanAssignment
from app.models.member import Member
from app.schemas.diet_plan import (
    DietPlanTemplateCreate,
    DietPlanTemplateUpdate,
    DietPlanAssignmentCreate,
)
from datetime import datetime
from typing import List, Optional


class DietPlanService:
    """Service for managing diet plan templates and assignments"""

    def create_template(
        self, db: Session, tenant_id: int, user_id: int, data: DietPlanTemplateCreate
    ) -> DietPlanTemplate:
        """Create a new diet plan template"""
        # Check subscription limits
        from app.services.subscription_service import get_current_subscription

        subscription = get_current_subscription(db, tenant_id)
        if not subscription or not subscription.plan:
            raise ValueError("No active subscription found")

        # Count existing active templates
        template_count = (
            db.query(DietPlanTemplate)
            .filter(
                DietPlanTemplate.tenant_id == tenant_id,
                DietPlanTemplate.is_active == True,
            )
            .count()
        )

        # Check limit (skip if unlimited)
        max_templates = subscription.plan.max_diet_templates
        if max_templates != -1 and template_count >= max_templates:
            raise ValueError(
                f"Template limit reached. Your {subscription.plan.name} plan "
                f"allows {max_templates} diet plan template(s). "
                f"Upgrade to Pro for unlimited templates."
            )

        # Convert meals to dict format for JSON storage
        meals_dict = [meal.dict() for meal in data.meals]

        template = DietPlanTemplate(
            tenant_id=tenant_id,
            created_by=user_id,
            name=data.name,
            category=data.category,
            description=data.description,
            meals=meals_dict,
            instructions=data.instructions,
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        return template

    def list_templates(
        self,
        db: Session,
        tenant_id: int,
        category: Optional[str] = None,
        active_only: bool = True,
    ) -> List[DietPlanTemplate]:
        """List all diet plan templates for a gym"""
        query = db.query(DietPlanTemplate).filter(
            DietPlanTemplate.tenant_id == tenant_id
        )

        if active_only:
            query = query.filter(DietPlanTemplate.is_active == True)

        if category:
            query = query.filter(DietPlanTemplate.category == category)

        return query.order_by(DietPlanTemplate.created_at.desc()).all()

    def get_template(
        self, db: Session, tenant_id: int, template_id: int
    ) -> Optional[DietPlanTemplate]:
        """Get a specific diet plan template"""
        return (
            db.query(DietPlanTemplate)
            .filter(
                DietPlanTemplate.id == template_id,
                DietPlanTemplate.tenant_id == tenant_id,
            )
            .first()
        )

    def update_template(
        self,
        db: Session,
        tenant_id: int,
        template_id: int,
        data: DietPlanTemplateUpdate,
    ) -> Optional[DietPlanTemplate]:
        """Update a diet plan template"""
        template = self.get_template(db, tenant_id, template_id)
        if not template:
            return None

        update_data = data.dict(exclude_unset=True)

        # Convert meals to dict if provided
        if "meals" in update_data and update_data["meals"]:
            update_data["meals"] = [meal.dict() for meal in update_data["meals"]]

        for field, value in update_data.items():
            setattr(template, field, value)

        template.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(template)
        return template

    def delete_template(self, db: Session, tenant_id: int, template_id: int) -> bool:
        """Soft delete a diet plan template"""
        template = self.get_template(db, tenant_id, template_id)
        if not template:
            return False

        template.is_active = False
        db.commit()
        return True

    def assign_to_member(
        self, db: Session, tenant_id: int, user_id: int, data: DietPlanAssignmentCreate
    ) -> DietPlanAssignment:
        """Assign a diet plan to a member"""
        assignment = DietPlanAssignment(
            tenant_id=tenant_id,
            template_id=data.template_id,
            member_id=data.member_id,
            assigned_by=user_id,
            notes=data.notes,
        )
        db.add(assignment)
        db.commit()

        # Send via WhatsApp if requested
        if data.send_whatsapp:
            self.send_diet_plan_whatsapp(db, assignment)

        db.refresh(assignment)
        return assignment

    def send_diet_plan_whatsapp(self, db: Session, assignment: DietPlanAssignment):
        """Send diet plan to member via WhatsApp"""
        from app.services.whatsapp_service import whatsapp_service
        from loguru import logger
        import asyncio

        template = assignment.template
        member = assignment.member
        gym = member.tenant

        # Format diet plan message
        message = self.format_diet_plan_message(template, member, gym, assignment.notes)

        # Send via WhatsApp (non-blocking)
        try:
            asyncio.create_task(
                whatsapp_service.send_diet_plan(
                    db=db,
                    tenant_id=gym.id,
                    phone_number=member.phone_number,
                    member_name=f"{member.first_name} {member.last_name}",
                    diet_plan_name=template.name,
                    diet_plan_content=message,
                    gym_name=gym.name,
                )
            )

            # Update assignment
            assignment.sent_via_whatsapp = True
            assignment.whatsapp_sent_at = datetime.utcnow()
            db.commit()

            logger.info(
                f"Diet plan '{template.name}' sent to {member.first_name} {member.last_name} via WhatsApp"
            )
        except Exception as e:
            logger.error(f"Failed to send diet plan via WhatsApp: {e}")
            # Don't raise - we still want to save the assignment

    def format_diet_plan_message(
        self,
        template: DietPlanTemplate,
        member,
        gym,
        custom_notes: Optional[str] = None,
    ) -> str:
        """Format diet plan as WhatsApp message"""
        message = f"""🥗 {template.name} - {gym.name}

Hi {member.first_name}! 👋

Your personalized diet plan is ready:

"""
        # Add meals
        for meal in template.meals:
            message += f"⏰ {meal['time']} - {meal['name']}\n"
            for item in meal["items"]:
                message += f"  • {item}\n"
            message += "\n"

        # Add custom notes if provided
        if custom_notes:
            message += f"📝 Custom Notes:\n{custom_notes}\n\n"

        # Add instructions
        if template.instructions:
            message += f"📝 Instructions:\n{template.instructions}\n\n"
        message += f"For questions, contact: {gym.phone_number if hasattr(gym, 'phone_number') else 'your gym'}\n"
        message += "Stay healthy! 💪"

        return message

    def get_member_diet_plans(
        self, db: Session, tenant_id: int, member_id: int
    ) -> List[DietPlanAssignment]:
        """Get all diet plans assigned to a member"""
        return (
            db.query(DietPlanAssignment)
            .filter(
                DietPlanAssignment.tenant_id == tenant_id,
                DietPlanAssignment.member_id == member_id,
            )
            .order_by(DietPlanAssignment.assigned_at.desc())
            .all()
        )


# Create singleton instance
diet_plan_service = DietPlanService()
