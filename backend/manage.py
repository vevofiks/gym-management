import sys
import subprocess

def run_command(command):
    try:
        subprocess.check_call(command, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python manage.py [makemigrations|migrate]")
        sys.exit(1)

    action = sys.argv[1]

    if action == "makemigrations":
        # Default message if none provided
        message = "Auto-generated migration"
        if len(sys.argv) > 2:
            message = " ".join(sys.argv[2:])
        
        print(f"Generating migration with message: '{message}'...")
        run_command(f'alembic revision --autogenerate -m "{message}"')

    elif action == "migrate":
        print("Applying migrations...")
        run_command("alembic upgrade head")

    else:
        print(f"Unknown command: {action}")
        print("Available commands: makemigrations, migrate")

if __name__ == "__main__":
    main()