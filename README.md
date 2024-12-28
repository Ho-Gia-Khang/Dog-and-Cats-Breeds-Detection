# Dogs-and-Cats-Breeds-Detection

# # To run server, please run these commands:

# create virtual environment

```bash
python -m venv env
```

# access to virtual env

```bash
source env/bin/activate # In mac
env/Scripts/activate.bat # In CMD
env/Scripts/Activate.ps1 # In Powershell
```

# install all necessary modules

```bash
pip install -r requirements.txt
```

# run the server on port 8000

```bash
uvicorn main:app --host localhost --port 8000
```
