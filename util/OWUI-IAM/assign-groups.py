import os
import sqlite3
import csv
import time

CSV_FOLDER = "csv/input/groups"
DB_FILE = "webui.db"

PERMISSIONS_STRING = '{"workspace": {"models": false, "knowledge": false, "prompts": false, "tools": false, "models_import": false, "models_export": false, "prompts_import": false, "prompts_export": false, "tools_import": false, "tools_export": false}, "sharing": {"models": false, "public_models": false, "knowledge": false, "public_knowledge": false, "prompts": false, "public_prompts": false, "tools": false, "public_tools": false, "notes": false, "public_notes": false}, "chat": {"controls": true, "valves": true, "system_prompt": true, "params": true, "file_upload": true, "delete": true, "delete_message": true, "continue_response": true, "regenerate_response": true, "rate_response": true, "edit": true, "share": true, "export": true, "stt": true, "tts": true, "call": true, "multiple_models": true, "temporary": true, "temporary_enforced": false}, "features": {"api_keys": false, "notes": true, "channels": true, "folders": true, "direct_tool_servers": false, "web_search": true, "image_generation": true, "code_interpreter": true, "memories": true}, "settings": {"interface": true}}'

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

def generate_id():
    return cursor.execute("""
        SELECT lower(
            hex(substr(randomblob(16), 1, 4)) || '-' ||
            hex(substr(randomblob(16), 5, 2)) || '-' ||
            hex(substr(randomblob(16), 7, 2)) || '-' ||
            hex(substr(randomblob(16), 9, 2)) || '-' ||
            hex(substr(randomblob(16), 11, 6))
        )
    """).fetchone()[0]

for filename in os.listdir(CSV_FOLDER):
    if not filename.endswith(".csv"):
        continue

    group_name = filename.replace(".csv", "").upper()
    now = int(time.time())

    # Check if group exists
    cursor.execute('SELECT ID FROM "GROUP" WHERE NAME = ?', (group_name,))
    row = cursor.fetchone()

    if row:
        group_id = row[0]
    else:
        group_id = generate_id()
        cursor.execute("""
            INSERT INTO "GROUP"
            (ID, USER_ID, NAME, DESCRIPTION, DATA, PERMISSIONS, META, CREATED_AT, UPDATED_AT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            group_id,
            'fd9cdd72-818d-4719-aaed-8c5615a6dab5',
            group_name,
            "",                 # description
            "{}",               # data
            PERMISSIONS_STRING, # exact string
            "null",             # meta
            now,                # created_at
            now                 # updated_at
        ))
        print(f"✅ Group created: {group_name}")

    # Process CSV
    with open(os.path.join(CSV_FOLDER, filename), newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            user_mail = row.get("mail")
            if not user_mail:
                continue

            # Case-insensitive user lookup
            cursor.execute(
                "SELECT ID FROM USER WHERE LOWER(EMAIL) = ?",
                (user_mail.lower(),)
            )
            user = cursor.fetchone()

            if not user:
                print(f"⚠️ User does not exist: {user_mail}")
                continue

            user_id = user[0]

            # Check membership
            cursor.execute("""
                SELECT COUNT(*)
                FROM GROUP_MEMBER
                WHERE USER_ID = ? AND GROUP_ID = ?
            """, (user_id, group_id))

            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO GROUP_MEMBER (ID, GROUP_ID, USER_ID)
                    VALUES (?, ?, ?)
                """, (generate_id(), group_id, user_id))
                print(f"➕ {user_mail} added to {group_name}")

conn.commit()
conn.close()

print("🎉 All CSVs processed successfully.")
