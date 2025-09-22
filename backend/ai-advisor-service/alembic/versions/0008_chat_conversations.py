# alembic/versions/0008_chat_conversations.py  (nuevo)
"""chat conversations + messages"""

from alembic import op
import sqlalchemy as sa

revision = "0008_chat_conversations"
down_revision = "0007_stats_defaults"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "chat_conversations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("student_id", sa.String(length=36), nullable=False),
        sa.Column("curriculum_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("idx_chat_conv_student", "chat_conversations", ["student_id"])
    op.create_index("idx_chat_conv_student_curr", "chat_conversations", ["student_id", "curriculum_id"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["chat_conversations.id"], ondelete="CASCADE"),
    )
    op.create_index("idx_chat_messages_conv", "chat_messages", ["conversation_id"])

def downgrade():
    op.drop_index("idx_chat_messages_conv", table_name="chat_messages")
    op.drop_table("chat_messages")
    op.drop_index("idx_chat_conv_student_curr", table_name="chat_conversations")
    op.drop_index("idx_chat_conv_student", table_name="chat_conversations")
    op.drop_table("chat_conversations")
