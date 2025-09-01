## 💡 About

This is the Backend of the Money Tracker App. It contains all the application logic, including API routes, database interactions, and server-side functionality.

### 🧱 Built With

1. Python
2. Flask
3. DynamoDB

### ⚙️ Local Setup

1. Install MongoDB

2. Setup virtual env in backend root:
   ```shell
   python -m venv venv
   ```
3. To activate the virtual environment:

   - On Windows:

   ```bash
   .\venv\Scripts\activate
   ```

   - On macOS/Linux:

   ```bash
   source venv/bin/activate
   ```

   To install the Python dependencies specified in your `requirements.txt` file, use the following command:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env in backend root. Follow template.env

## 👟 Usage

### 🏠 Local Usage

1. Run local MongoDB

2. Run backend: after activate venv:

   and then in backend root:

   ```bash
   flask run
   ```
