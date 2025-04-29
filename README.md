# logos

# FRONTEND


# BACKEND

# 1. Setup virtual environment for python
# python -m venv .venv

# 2. Activate virtual environment
# .venv\Scripts\activate For Windows
# .venv/bin/activate For MAC OS
# .venv/source/activate For Linux

# 3a. Install dependencies
# If you don't have pip-tools installed, then install it first
# pip install pip-tools
# pip-sync requirements.txt

# 4a. Run the server with fastapi
# fastapi run main:app --reload

# 4b. Run the server with uvicorn
# uvicorn main:app --reload

# 4c. Run the server with gunicorn
# gunicorn main:app --reload

# 3b. Updating dependencies
# If you installed a new dependency(ies), then you need to update the requirements.txt file
# pip-compile requirements.in (this will create a new requirements.txt file)
# requirements.in has all the main dependencies and requirements.txt has all the dependencies including the sub-dependencies

# 5. 