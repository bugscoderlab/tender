"""
Migration script to add approval_status column to tenders table
and set all existing tenders to 'approved' status
"""
from sqlalchemy import text
from database.connection import engine

def migrate():
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT COUNT(*) 
            FROM pragma_table_info('tenders') 
            WHERE name='approval_status'
        """))
        
        column_exists = result.scalar() > 0
        
        if not column_exists:
            print("Adding approval_status column...")
            conn.execute(text("""
                ALTER TABLE tenders 
                ADD COLUMN approval_status VARCHAR DEFAULT 'pending'
            """))
            conn.commit()
            print("Column added successfully")
        else:
            print("approval_status column already exists")
        
        # Update all existing tenders to approved
        print("Updating existing tenders to approved status...")
        conn.execute(text("""
            UPDATE tenders 
            SET approval_status = 'approved' 
            WHERE approval_status IS NULL OR approval_status = 'pending'
        """))
        conn.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
