# ── Stage 1: Train the model ─────────────────────────────────────────────────
# dplyr + stringr are only needed here; they never land in the runtime image.
FROM rocker/r-ver:4.4 AS trainer

RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN install2.r --error dplyr stringr

WORKDIR /train

# These two layers are cached independently: the heavy training step only
# re-runs when flat-data-full.csv or train_model.R actually changes.
COPY flat-data-full.csv train_model.R ./
RUN Rscript train_model.R

# ── Stage 2: Runtime API ──────────────────────────────────────────────────────
# Only plumber (+ its deps) ends up in the final image.
# flat-data-full.csv and dplyr/stringr are not included.
FROM rocker/r-ver:4.4 AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl-dev \
    libcurl4-openssl-dev \
    libsodium-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

RUN install2.r --error plumber

WORKDIR /app

COPY --from=trainer /train/model.rds /train/factor_levels.rds ./
COPY api.R entrypoint.R ./

EXPOSE 8000
CMD ["Rscript", "entrypoint.R"]

