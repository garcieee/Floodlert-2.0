from PyQt5.QtSql import QSqlDatabase

# List available drivers to confirm QMYSQL is there
print("Available drivers:", QSqlDatabase.drivers())

# Try to establish the database connection
db = QSqlDatabase.addDatabase("QMYSQL")
db.setHostName("localhost")
db.setDatabaseName("floodlert_db")  # Replace with your actual database name
db.setUserName("root")  # Replace with your actual username
db.setPassword("November_15")  # Replace with your actual password

if db.open():
    print("Database connected successfully!")
else:
    print(f"Database connection failed: {db.lastError().text()}")