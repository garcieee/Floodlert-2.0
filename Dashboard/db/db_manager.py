import mysql.connector

class DBManager:
    def __init__(self):
        try:
            self.conn = mysql.connector.connect(
                host="localhost",
                port=3306,
                user="root
                password="", # MySQL password
                database="floodlert_db"
            )
            self.cursor = self.conn.cursor(dictionary=True)
            print("Database connection successful.")
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            raise

    def validate_user(self, username, password):
        """
        Validate user credentials for both Admin and User.
        Returns:
            - "Admin" if the credentials match an Admin.
            - "User" if the credentials match a User.
            - None if no match is found.
        """
        try:
            query = """
            SELECT 'Admin' AS Role FROM Admin WHERE Username = %s AND Password = %s
            UNION
            SELECT 'User' AS Role FROM Users WHERE Username = %s AND Password = %s
            """
            print(f"Executing query for username: {username} and password: {password}")
            self.cursor.execute(query, (username, password, username, password))
            result = self.cursor.fetchone()
            print(f"Query result: {result}")  # Debug the result of the query

            return result['Role'] if result else None
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return None

    def close(self):
        self.cursor.close()
        self.conn.close()
        print("Database connection closed.")
