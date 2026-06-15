import csv
import secrets
import string
import glob
import os

# Ordner mit CSVs
input_folder = "csv/input/groups"
output_file = "csv/output/users.csv"

def generate_random_password(length=16):
    chars = string.ascii_letters + string.digits + string.punctuation.replace(',', '')
    return ''.join(secrets.choice(chars) for _ in range(length))

# CSV-Dateien finden
csv_files = glob.glob(os.path.join(input_folder, "*.csv"))

fieldnames = ['Name', 'Email', 'Password', 'Role']
total_count = 0

with open(output_file, 'w', newline='', encoding='utf-8') as csv_out:
    writer = csv.DictWriter(csv_out, fieldnames=fieldnames)
    writer.writeheader()

    for file in csv_files:
        with open(file, newline='', encoding='utf-8-sig') as csv_in:
            reader = csv.DictReader(csv_in)
            headers = {h.strip().lower(): h for h in reader.fieldnames}  # Case-insensitive mapping

            for row in reader:
                name = row.get(headers.get('displayname', ''), '').strip()
                email = row.get(headers.get('mail', ''), '').strip()

                if not name or not email:
                    continue  # Überspringe leere Zeilen

                password = generate_random_password(16)

                writer.writerow({
                    'Name': name,
                    'Email': email,
                    'Password': password,
                    'Role': 'user'
                })
                total_count += 1

print(f"{total_count} users written to {output_file} from {len(csv_files)} CSV files.")
