import csv
import secrets
import string
import os

# Eingabe-CSV
input_file = "csv/input/UserList.csv"
# Ausgabe-CSV
output_file = "csv/output/teachers.csv"

def generate_random_password(length=16):
    chars = (
        string.ascii_letters +
        string.digits +
        string.punctuation.replace(',', '')
    )
    return ''.join(secrets.choice(chars) for _ in range(length))

# Prüfe, ob Ausgabeordner existiert, sonst erstelle ihn
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(input_file, newline='', encoding='utf-8-sig') as csv_in, \
     open(output_file, 'w', newline='', encoding='utf-8') as csv_out:

    reader = csv.DictReader(csv_in)
    # BOM- und Leerzeichen-sichere Header
    reader.fieldnames = [name.strip() for name in reader.fieldnames]

    fieldnames = ['Name', 'Email', 'Password', 'Role']
    writer = csv.DictWriter(csv_out, fieldnames=fieldnames)
    writer.writeheader()

    count = 0
    for row in reader:
        # BOM/Leerzeichen-sichere Keys
        row = {k.strip(): v for k, v in row.items()}

        upn = row['userPrincipalName'].strip().lower()
        display_name = row['displayName'].strip()

        # Filter: *.*@htl-leonding.ac.at, kein 'students'
        if ("@htl-leonding.ac.at" in upn and
            "students" not in upn and
            '.' in upn.split('@')[0]):

            password = generate_random_password(16)

            writer.writerow({
                'Name': display_name,
                'Email': row['userPrincipalName'],
                'Password': password,
                'Role': 'admin'
            })
            count += 1

print(f"{count} rows written to {output_file}")
