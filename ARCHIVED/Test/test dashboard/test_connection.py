from db_manager import DBManager

if __name__ == "__main__":
    try:
        db_manager = DBManager(host="localhost", user="root", password="November_15", database="floodlert_db")
        db_manager.test_connection()
    except Exception as e:
        print(f"Failed to connect to the database: {e}")