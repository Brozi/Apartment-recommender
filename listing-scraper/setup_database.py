from etl.services import connect_to_database

def initialize_database(raw_col='Properties'):
    client = connect_to_database()

    raw_collection = client[raw_col]

    print("Building partial index for ETL queue...")

    raw_collection.create_index(
        [('etl_processed', 1)],
        partialFilterExpression={'etl_processed': {'$ne': True}},
    )

    print("Database initialization complete.")

if __name__ == "__main__":
    initialize_database()
