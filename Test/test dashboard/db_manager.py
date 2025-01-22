import mysql.connector


class DBManager:
    def __init__(self, host="localhost", user="root", password="November_15", database="floodlert_db"):
        try:
            self.connection = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )
            self.cursor = self.connection.cursor(dictionary=True)
            print("Successfully connected to the database!")
        except mysql.connector.Error as e:
            print(f"Error connecting to the database: {e}")
            raise

    def test_connection(self):
        """Tests the connection to the database."""
        try:
            self.cursor.execute("SELECT DATABASE();")
            result = self.cursor.fetchone()
            if result:
                print(f"Connected to database: {result['DATABASE()']}")
        except mysql.connector.Error as e:
            print(f"Error testing the connection: {e}")

    def verify_admin_credentials(self, username, password):
        """Verifies admin login credentials."""
        query = "SELECT * FROM Admin WHERE Username = %s AND PasswordHash = %s"
        self.cursor.execute(query, (username, password))
        return self.cursor.fetchone()

    def close_connection(self):
        """Closes the database connection."""
        self.cursor.close()
        self.connection.close()