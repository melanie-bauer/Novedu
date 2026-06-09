"""
Weist allen Nutzern in der LiteLLM PostgreSQL-Tabelle ein neues Budget zu:
30 Cent pro Woche (budget_duration='7d', max_budget=0.30).
Verwendet dieselbe .env-Konfiguration wie migrate_users.py (PG_*).
"""

import os
import datetime
import psycopg2
from dotenv import load_dotenv

load_dotenv()

PG_CONFIG = {
    "host": os.getenv("PG_HOST"),
    "database": os.getenv("PG_DATABASE"),
    "user": os.getenv("PG_USER"),
    "password": os.getenv("PG_PASSWORD"),
    "port": int(os.getenv("PG_PORT", 5432)),
    "sslmode": os.getenv("PG_SSLMODE", "require"),
}

PG_TABLE_NAME = "LiteLLM_UserTable"

# 30 Cent pro Woche
MAX_BUDGET_CENTS = 0.30
BUDGET_DURATION = "7d"

# Reset immer Sonntag 23:59 (UTC)
RESET_WEEKDAY = 6  # Sonntag
RESET_HOUR = 23
RESET_MINUTE = 59


def next_sunday_2359_utc() -> datetime.datetime:
    """Nächsten Sonntag 23:59 UTC berechnen."""
    now = datetime.datetime.now(datetime.UTC)
    # Tage bis zum nächsten Sonntag (weekday: Mo=0, So=6)
    days_ahead = (RESET_WEEKDAY - now.weekday()) % 7
    next_sunday = now.date() + datetime.timedelta(days=days_ahead)
    candidate = datetime.datetime.combine(
        next_sunday,
        datetime.time(RESET_HOUR, RESET_MINUTE, 0),
        tzinfo=datetime.UTC,
    )
    # Falls heute schon Sonntag und 23:59 vorbei → nächste Woche
    if candidate <= now:
        candidate += datetime.timedelta(days=7)
    return candidate


def assign_budget_to_all_users():
    """Setzt für alle Nutzer: max_budget=0.30, budget_duration='7d', budget_reset_at=Sonntag 23:59 UTC."""
    conn = psycopg2.connect(**PG_CONFIG)
    cursor = conn.cursor()

    now = datetime.datetime.now(datetime.UTC)
    budget_reset_at = next_sunday_2359_utc()

    cursor.execute(
        f'''
        UPDATE "{PG_TABLE_NAME}"
        SET max_budget = %s, budget_duration = %s, budget_reset_at = %s
        WHERE 1=1
        ''',
        (MAX_BUDGET_CENTS, BUDGET_DURATION, budget_reset_at),
    )
    updated = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()
    return updated


if __name__ == "__main__":
    print("Setze Budget für alle Nutzer: 30 Cent pro Woche (7d)...")
    try:
        updated = assign_budget_to_all_users()
        print(f"Fertig. {updated} Nutzer aktualisiert.")
    except Exception as e:
        print(f"Fehler: {e}")
        raise
