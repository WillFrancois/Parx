# Parx Backend Set-up

In order to start the backend of Parx, you will need to install the necessary packages from the requirements.txt file and create a .env file.

## Package Installation

### Recommended: Python Virual Environment

To use a python virtual environment and install the necessary packages, use the following command:

- Linux: python -m venv ./env; source ./env/bin/activate; pip install -r requirements.txt
- Windows (cmd): python -m venv env & env/bin/activate.bat & pip install -r requirements.txt
- Windows (Powershell): python -m venv env & env/bin/Activate.ps1 & pip install -r requirements.txt
- Macintosh: python -m venv ./env && source ./env/bin/activate && pip install -r requirements.txt

### Alternative: Install locally

To install the packages locally, use the following command:

- All platforms: pip install -r requirements.txt

## .env File Set-up

The .env file in the backend must have the following properties:

- ADMIN_EMAIL: The username of the admin account in Pocketbase.
- ADMIN_PASSWORD: The password of the admin account in Pocketbase.
- PB_URL: The full url, including port, of the Pocketbase service.
- PEPPER: A server-side pepper for additional hashing before adding to the Pocketbase DB. Must be a valid generated BCrypt salt to work.

### Example .env file contents:

- ADMIN_EMAIL=testing@parx.site
- ADMIN_PASSWORD=testingparx
- PB_URL=http://localhost:8090
- PEPPER=$2a$04$K2lxuHGkylzKOIDTl5a47OVuGqWKAUdrooz17oMMu

## Running the Backend

To run the backend, use the command "flask run" to host the service locally.
