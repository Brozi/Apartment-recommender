library(dplyr)
library(stringr)
library(splines)

CURRENT_YEAR <- 2026L

VALID_DISTRICTS <- c(
  "Stare Miasto", "Grzeg\u00f3rzki", "Pr\u0105dnik Czerwony", "Pr\u0105dnik Bia\u0142y",
  "Krowodrza", "Zwierzyniec", "Bronowice", "\u0141obz\u00f3w",
  "D\u0119bniki", "Podg\u00f3rze", "Bie\u017can\u00f3w-Prokocim", "Swoszowice",
  "Wzg\u00f3rza Krzes\u0142awickie", "Nowa Huta", "Czy\u017cyny", "Mistrzejowice",
  "Bie\u0144czyce", "\u0141agiewniki-Borek Fa\u0142\u0119cki", "Podg\u00f3rze Duchackie"
)

cat("[train_model] Reading flat-data-full.csv...\n")
df <- read.csv("flat-data-full.csv", stringsAsFactors = FALSE)

df_clean <- df %>%
  mutate(
    price            = as.numeric(price),
    buildYear        = suppressWarnings(as.numeric(na_if(tolower(buildYear), "unknown"))),
    floorsInBuilding = suppressWarnings(as.numeric(na_if(tolower(floorsInBuilding), "unknown"))),
    rooms            = as.numeric(str_extract(rooms, "\\d+")),
    floor_clean      = tolower(trimws(floor)),

    floor_num = case_when(
      floor_clean == "ground floor"                  ~ 0,
      floor_clean == "basement"                      ~ -1,
      floor_clean == "attic"                         ~ as.numeric(floorsInBuilding),
      floor_clean %in% c("unknown", "10+", "")       ~ NA_real_,
      str_detect(floor_clean, "^\\['\\d+'\\]$")      ~ as.numeric(str_extract(floor_clean, "\\d+")),
      str_detect(floor_clean, "^-?\\d+$")            ~ as.numeric(floor_clean),
      TRUE                                           ~ NA_real_
    )
  ) %>%
  filter(
    district %in% VALID_DISTRICTS,
    area >= 15, area <= 100,
    price >= 400000, price <= 1500000,
    (price / area) >= 5000, (price / area) <= 25000,
    buildYear >= 1900, buildYear <= 2028,
    !is.na(floorsInBuilding),
    !is.na(rooms),
    !is.na(floor_num)
  ) %>%
  mutate(
    log_price       = log(price),
    area_log        = log(area),
    building_age    = CURRENT_YEAR - buildYear,
    floor_ratio     = (floor_num + 1) / (floorsInBuilding + 1),
    is_ground_floor = as.integer(floor_num == 0),
    is_top_floor    = as.integer(floor_num == floorsInBuilding & floor_num > 0),

    heating_simple = case_when(
      tolower(heating) %in% c("urban", "miejskie") ~ "Urban",
      tolower(heating) == "gas"                    ~ "Gas",
      TRUE                                         ~ "Other_Unknown"
    )
  ) %>%
  mutate(
    district       = factor(district, levels = VALID_DISTRICTS),
    market_type    = as.factor(market_type),
    offered_by     = as.factor(offered_by),
    condition      = as.factor(condition),
    heating_simple = as.factor(heating_simple),
    rooms = factor(
      ifelse(rooms >= 4, "4+", as.character(as.integer(rooms))),
      levels = c("1", "2", "3", "4+")
    ),
    hasParking  = as.logical(hasParking),
    hasBalcony  = as.logical(hasBalcony),
    hasElevator = as.logical(hasElevator),
    latitude    = as.numeric(latitude),
    longitude   = as.numeric(longitude)
  ) %>%
  select(-otodom_id, -hasStorage, -floor, -floor_clean, -floorsInBuilding, -buildYear, -heating)

cat(sprintf("[train_model] df_clean: %d observations\n", nrow(df_clean)))

model_screen <- lm(
  log_price ~ area_log + rooms + floor_ratio + building_age +
    district + market_type + condition + latitude + longitude,
  data = df_clean
)
cooks_d   <- cooks.distance(model_screen)
threshold <- 4 / nrow(df_clean)
n_removed <- sum(cooks_d >= threshold)
df_clean  <- df_clean[cooks_d < threshold, ]
cat(sprintf("[train_model] Removed %d outliers. Remaining: %d\n", n_removed, nrow(df_clean)))

set.seed(42)
train_idx  <- sample(seq_len(nrow(df_clean)), size = 0.8 * nrow(df_clean))
train_data <- df_clean[train_idx, ]

cat(sprintf("[train_model] Training on %d observations...\n", nrow(train_data)))

model_flat_final <- lm(
  log_price ~ area_log * rooms +
    floor_ratio + is_ground_floor + is_top_floor +
    ns(building_age, df = 4) +
    district + market_type * condition + offered_by + heating_simple +
    hasParking + hasBalcony + hasElevator +
    poly(latitude, 2) + poly(longitude, 2) + latitude:longitude,
  data = train_data
)

cat(sprintf("[train_model] Adj. R\u00b2 = %.4f\n", summary(model_flat_final)$adj.r.squared))

factor_levels <- list(
  market_type    = levels(train_data$market_type),
  offered_by     = levels(train_data$offered_by),
  condition      = levels(train_data$condition),
  heating_simple = levels(train_data$heating_simple)
)

saveRDS(model_flat_final, "model.rds")
saveRDS(factor_levels,    "factor_levels.rds")
cat("[train_model] model.rds and factor_levels.rds saved.\n")
