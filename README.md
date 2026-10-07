# Apartment Recommender

A data-driven web application for discovering apartments in Kraków based on price, location, property characteristics, and nearby points of interest.

The project combines automated web data ingestion, MongoDB storage, ETL processing, geospatial enrichment, a Go API, and an interactive frontend.

## Project Background

The original scraper was started by [TheRealSeber](https://github.com/TheRealSeber).

I forked the project, fixed and extended the existing scraper, and developed the data ingestion and ETL workflows that support the current application.

The application frontend and the complete Go API were developed by [mgra04](https://github.com/mgra04).

This project is a collaborative data product built on top of an existing scraping foundation and extended with data engineering, data processing, API, and frontend functionality.

## What the Application Does

The application collects apartment listings from the Otodom marketplace, transforms and enriches the data, and exposes it through an interactive map-based interface.

Users can search and filter listings by:

- Total price
- Price per square meter
- Area
- Number of rooms
- District
- Building type
- Construction year
- Property condition
- Market type
- Nearby points of interest

## My Contribution

My work focused primarily on the scraper, data ingestion layer, MongoDB data workflows, and ETL pipeline.

I was responsible for:

- Forking, fixing, and extending the original scraper
- Maintaining the apartment listing ingestion workflow
- Parsing structured listing data from marketplace pages
- Extracting property, building, agency, and localization information
- Modeling listing data for MongoDB
- Implementing listing deduplication using marketplace identifiers
- Tracking listing activity and previously seen listings
- Adding ETL processing-state management
- Building the raw-to-clean MongoDB data workflow
- Implementing batch and bulk database operations
- Adding MongoDB indexes for filtering and geospatial queries
- Integrating OpenStreetMap points of interest
- Preparing geographic enrichment and nearby-POI aggregation
- Handling incomplete, malformed, or failed listing extractions
- Preparing data for consumption by the API and frontend application

This work reflects my interests in:

- Data Engineering
- Data Analysis
- Data Science
- ETL and ELT Pipelines
- Data Quality
- NoSQL Data Modeling
- Geospatial Data Processing
- Analytics Applications

## Collaborators

### Original scraper

The initial scraper was created by [TheRealSeber](https://github.com/TheRealSeber).

I forked the project and continued its development by fixing issues, extending the data model, improving the ingestion process, and adding ETL and data-enrichment functionality.

### Frontend and API

The frontend and the complete Go API were developed by [mgra04](https://github.com/mgra04).

Their contribution included:

- Building the interactive map-based user interface
- Implementing apartment filtering forms
- Structuring the frontend application and routes
- Integrating frontend data fetching
- Developing the complete Go REST API
- Implementing MongoDB-backed API handlers
- Implementing filtering and map-data endpoints
- Integrating Redis for temporary filter sessions
- Connecting the frontend with the processed apartment data
- Contributing to the overall user experience and application architecture

The collaboration connected the data ingestion and ETL workflows with a usable web application.

## Data Pipeline

```text
Otodom marketplace
        |
        v
Listing scraper
        |
        v
Raw MongoDB collection
        |
        v
ETL pipeline
        |
        +--> Cleaning and normalization
        +--> Deduplication and state tracking
        +--> Data transformation
        +--> Geographic enrichment
        +--> POI aggregation
        |
        v
Clean MongoDB collection
        |
        v
Go REST API
        |
        v
Interactive frontend
```

## Data Ingestion

The ingestion layer collects listing information from search result pages and individual apartment pages.

The scraper:

1. Generates marketplace search requests using configured parameters.
2. Extracts listing URLs and metadata from search result pages.
3. Visits individual listing pages.
4. Parses structured JSON embedded in the page.
5. Extracts property, building, agency, and geographic attributes.
6. Checks whether the listing already exists in MongoDB.
7. Inserts new listings or updates existing listing state.
8. Handles parsing failures, incomplete data, network problems, and retries.

The ingested data includes:

- Marketplace listing identifier
- Title and listing URL
- Price and price per square meter
- Area and number of rooms
- Rent and additional property attributes
- Building type, floor count, and construction year
- Market type and construction status
- City, district, street, latitude, and longitude
- Agency or developer information
- Scraping and listing timestamps
- Listing activity state
- ETL processing state

## ETL Pipeline

The ETL component transforms raw listing documents into a cleaned and query-ready representation.

The pipeline includes:

- Data cleaning
- Field normalization
- Data type conversion
- Missing-value handling
- Categorical value standardization
- Nested document transformation
- Listing processing-state management
- Batch loading into a clean MongoDB collection
- Geographic enrichment
- Nearby point-of-interest aggregation

Raw and transformed data are stored separately:

```text
listings          -> raw ingested listings
listings_clean    -> transformed and query-ready listings
pois              -> categorized points of interest
```

Separating raw and clean collections makes it possible to reprocess data and compare transformed records with their original source documents.

The ETL workflow uses MongoDB batch and bulk operations to reduce database overhead when processing larger collections.

## Geospatial Enrichment

The project uses geographic data from OpenStreetMap to enrich apartment listings with information about nearby points of interest.

The POI workflow:

- Loads POI data from JSON and GeoJSON sources
- Extracts geographic coordinates
- Categorizes POIs such as shops, schools, transport, and services
- Stores POIs as GeoJSON Point objects
- Creates MongoDB geospatial indexes
- Calculates POI counts within configurable distance ranges
- Adds location-based features to apartment records

This creates a foundation for location-aware apartment analysis and future recommendation models.

## MongoDB Data Model

The data model separates the main property concepts into reusable documents and embedded structures.

Important entities include:

- **Listings** — apartment and property information
- **Agencies** — estate agency information
- **Buildings** — building type, floor count, and construction year
- **Localization** — city, district, street, and coordinates
- **Points of interest** — categorized geographic reference data
- **Clean listings** — ETL-processed records used by the application

Listing lifecycle and processing metadata include:

- `etl_processed`
- `is_active`
- `last_seen_at`
- `scraped_at`

## Technology Stack

### Data ingestion and ETL

- Python
- BeautifulSoup
- Requests and custom network services
- MongoEngine
- PyMongo
- Pandas
- NumPy
- GeoJSON
- Geospatial processing
- MongoDB bulk and batch operations

### Backend API

The Backend API uses:

- Go
- MongoDB Go Driver
- Redis
- REST API
- HTTP routing

The API provides endpoints for:

- Map-based listing retrieval
- Individual listing lookup
- Filter limit retrieval
- Apartment filtering
- Temporary filter sessions
- Backend health checks

### Frontend
The Frontend UI uses:

- TypeScript
- React
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS
- Interactive map components

### Infrastructure

- Docker
- Docker Compose
- Nginx
- Render-compatible deployment configuration

## Repository Structure

```text
.
├── backend/          # Go REST API developed by mgra04
├── data/             # Supporting data and data-processing resources
├── etl/              # Cleaning, transformation, enrichment, and loading
├── frontend/         # Frontend developed by mgra04
├── listing-scraper/  # Scraper and MongoDB ingestion layer
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── requirements_etl.txt
```

## Running the Application

### Requirements

- Python 3.11+
- Node.js and npm
- Go
- MongoDB
- Redis
- Docker Desktop, recommended

### Run with Docker Compose

```bash
docker compose up --build
```

The application exposes:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

To stop the application:

```bash
docker compose down
```

### Run the scraper

Install the main Python dependencies:

```bash
pip install -r requirements.txt
```

Configure the MongoDB connection and crawler settings, then run the ingestion entry point from the `listing-scraper` directory.

### Run the ETL pipeline

Install the ETL dependencies:

```bash
pip install -r requirements_etl.txt
```

Configure the MongoDB connection and run the ETL pipeline from the `etl` directory.

## Engineering Highlights

This project demonstrates experience with:

- Extending and maintaining an existing data collection system
- Web scraping and structured data extraction
- Data ingestion into MongoDB
- NoSQL data modeling
- ETL pipeline design
- Data cleaning and normalization
- Batch and bulk database operations
- Processing-state management
- Deduplication and listing lifecycle tracking
- Geospatial data enrichment
- MongoDB indexing
- Collaborative software development
- Building data workflows that support a production-style application

## Potential Future Improvements

Possible next steps include:

- Implementing a production recommendation model
- Adding automated data-quality reports
- Introducing scheduled ingestion and ETL workflows
- Adding workflow orchestration
- Adding pipeline monitoring and metrics
- Expanding coverage beyond Kraków
- Adding automated schema validation
- Adding unit and integration tests for transformations
- Tracking historical price and availability changes
- Creating exploratory analyses of the Kraków property market

## Attribution and Disclaimer

This project builds on the original scraper created by [TheRealSeber](https://github.com/TheRealSeber).

The frontend and complete Go API were developed by [mgra04](https://github.com/mgra04).

The project is intended for educational and portfolio purposes. When collecting data from external websites, users should respect the website's terms of service, rate limits, robots.txt policies, and applicable laws.
