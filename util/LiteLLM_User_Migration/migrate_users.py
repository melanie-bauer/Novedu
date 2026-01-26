import sqlite3
import psycopg2
import os
import datetime
from dotenv import load_dotenv


load_dotenv()  

SQLITE_DB_PATH = os.path.join("data", "webui.db")

PG_CONFIG = {
    "host": os.getenv("PG_HOST"),
    "database": os.getenv("PG_DATABASE"),
    "user": os.getenv("PG_USER"),
    "password": os.getenv("PG_PASSWORD"),
    "port": int(os.getenv("PG_PORT", 5432)),
    "sslmode": "require"
}

PG_TABLE_NAME = "LiteLLM_UserTable"


def fetch_users_from_sqlite():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM user")
    users = cursor.fetchall()
    conn.close()
    return users

def migrate_users_to_postgres(users):
    conn = psycopg2.connect(**PG_CONFIG)
    cursor = conn.cursor()
    inserted = 0

    for user_id, email in users:
        cursor.execute(f'SELECT 1 FROM "{PG_TABLE_NAME}" WHERE user_id = %s', (user_id,))
        if cursor.fetchone():
            continue 

        cursor.execute(f'SELECT user_id FROM "{PG_TABLE_NAME}" WHERE user_email = %s', (email,))
        result = cursor.fetchone()
        if result:
            existing_id = result[0]
            if existing_id != user_id:
                cursor.execute(f'''
                    UPDATE "{PG_TABLE_NAME}"
                    SET user_id = %s
                    WHERE user_email = %s
                ''', (user_id, email))
                print(f"{inserted}: Benutzer-ID aktualisiert für {email} (alt: {existing_id}, neu: {user_id})")
                inserted += 1
                continue

        query_insert = f'''
            INSERT INTO "{PG_TABLE_NAME}" (
                user_id, user_alias, team_id, sso_user_id, organization_id, password, teams, user_role,
                max_budget, spend, user_email, models, metadata, max_parallel_requests, tpm_limit, rpm_limit,
                budget_duration, budget_reset_at, allowed_cache_controls, model_spend, model_max_budget,
                created_at, updated_at, object_permission_id, policies
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        '''
        now = datetime.datetime.now(datetime.UTC)
        budget_reset = datetime.datetime(2026, 2, 1)

        cursor.execute(query_insert, (
            user_id, None, None, None, None, None, '{}', 'internal_user_viewer',
            15, 0, email, '{no-default-models}', '{}', None, None, None,
            '30d', budget_reset, '{}', '{}', '{}',
            now, now, None, '{}'
        ))
        inserted += 1
        print(f"{inserted}: Neuer Benutzer eingefügt: {email}")

    conn.commit()
    cursor.close()
    conn.close()
    return inserted


if __name__ == "__main__":
    print("Lade Benutzer aus SQLite...")
    users = fetch_users_from_sqlite()
    print(f"{len(users)} Benutzer gefunden.")

    print("Starte Migration zu PostgreSQL...")
    inserted_count = migrate_users_to_postgres(users)
    print(f"Migration abgeschlossen. Neue Benutzer eingefügt: {inserted_count}")
