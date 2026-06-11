# Otodom Scraper

**Otodom Scraper** is a simple python module, which is capable of scraping **thousands of listings within a minutes** from the polish property marketplace site otodom.pl (over 30 parameters included), as well as running an ETL pipeline on the data, and aggregating it. The ETL module runs a geo aggregation too - using POIs data downloaded from OpenStreetMap it identifies POIs near each flat in given ranges.

Integrated with **MongoDB** gives a powerfull combo in managing found listings. It is possible to extract data to the both **CSV** and **JSON** file.

**Every module has a well-written documentatation** to make possibly future changes developer-friendly.

## Setup

1. Ensure you have Python 3.11+ installed on your machine.
2. Clone repository:

```bash
git clone https://github.com/Brozi/Otodom-Scraper.git
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Prepare settings.json - open the example file and everything should be clear

## Usage

You can run **Crawler** with the following code:

```python
# main.py

from crawler import Crawler

crawler =  Crawler()
crawler.start()
crawler.to_csv_file("listings.csv")
```

There is also a method `to_json_file` which can save listings to JSON format. During the extraction of the data informational logs are going to be printed. **Crawler internally connects with MongoDB, host MUST BE defined in settings.json**

If you would like to **save the listings from the database** you can run following code:

```python
# main.py

from services import PropertyService, ExportService
from services import connect_to_database

connect_to_database(host="mongodb://localhost:27017/otodomscraper")
ExportService.db_to_json_file("properties.json", include_agencies=True)
```

For more details of the functions read the source code as everything have docstrings and is written in **KISS** convention, so it should be understandable :)

## Contributing

Pull requests are welcome. Please stick to **conventional commits** before pushing any changes. For major changes, please open an issue first to discuss what you would like to change.

## Docker (frontend + backend)

This repository now includes Docker setup for:

- `backend` (Go API) exposed on `http://localhost:4000`
- `frontend` (Vite static build served by Nginx) exposed on `http://localhost:3000`

### Requirements

1. Install Docker Desktop.
2. Ensure `backend/.env` exists and contains required variables (`MONGODB_URI`, `REDIS_ADDR`, etc.).

### Run

```bash
docker compose up --build
```

### Stop

```bash
docker compose down
```

### Notes

- Frontend API base URL is configurable via `VITE_API_URL` during image build.
- `docker-compose.yml` sets it to `http://localhost:4000` by default.
