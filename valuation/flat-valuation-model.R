# --- 1. PREPARATION & LIBRARIES ---

install.packages("dplyr")
install.packages("stringr")
install.packages("car")
install.packages("rlang")
install.packages("lmtest")
install.packages("caret")

library(dplyr)
library(stringr)
library(car)
library(rlang)
library(lmtest)
library(splines)

df <- read.csv("flat-data-full.csv", stringsAsFactors = FALSE)

summary(df)

unique(df$district)
unique(df$floor)
unique(df$floorsInBuilding)
unique(df$heating)

hist(df$price)
hist(df$area)

CURRENT_YEAR <- 2026

VALID_DISTRICTS <- c(
  "Stare Miasto", "Grzegórzki", "Prądnik Czerwony", "Prądnik Biały",
  "Krowodrza", "Zwierzyniec", "Bronowice", "Łobzów",
  "Dębniki", "Podgórze", "Bieżanów-Prokocim", "Swoszowice",
  "Wzgórza Krzesławickie", "Nowa Huta", "Czyżyny", "Mistrzejowice",
  "Bieńczyce", "Łagiewniki-Borek Fałęcki", "Podgórze Duchackie"
)


# --- 2. DATA CLEANING & FEATURE ENGINEERING ---

df_clean <- df %>%
  mutate(
    price            = as.numeric(price),
    buildYear        = suppressWarnings(as.numeric(na_if(tolower(buildYear), "unknown"))),
    floorsInBuilding = suppressWarnings(as.numeric(na_if(tolower(floorsInBuilding), "unknown"))),
    rooms            = as.numeric(str_extract(rooms, "\\d+")),
    floor_clean      = tolower(trimws(floor)),
    
    floor_num = case_when(
      floor_clean == "ground floor"                                  ~ 0,
      floor_clean == "basement"                                      ~ -1,
      floor_clean == "attic"                                         ~ as.numeric(floorsInBuilding),
      floor_clean %in% c("unknown", "10+", "")                       ~ NA_real_,
      str_detect(floor_clean, "^\\['\\d+'\\]$")                      ~ as.numeric(str_extract(floor_clean, "\\d+")),
      str_detect(floor_clean, "^-?\\d+$")                            ~ as.numeric(floor_clean),
      TRUE                                                           ~ NA_real_
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
    log_price = log(price),
    area_log  = log(area),
    building_age = CURRENT_YEAR - buildYear,
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
    hasParking     = as.logical(hasParking),
    hasBalcony     = as.logical(hasBalcony),
    hasElevator    = as.logical(hasElevator)
  ) %>%
  
  select(-otodom_id, -hasStorage, -floor, -floor_clean, -floorsInBuilding, -buildYear, -heating)

cat(sprintf("df_clean: %d observations, %d variables\n", nrow(df_clean), ncol(df_clean)))

# --- 3. OUTLIER DETECTION & HANDLING ---

model_outlier_screen <- lm(
  log_price ~ area_log + rooms + floor_ratio + building_age +
    district + market_type + condition + latitude + longitude,
  data = df_clean
)

cooks_d  <- cooks.distance(model_outlier_screen)
threshold <- 4 / nrow(df_clean)
n_removed <- sum(cooks_d >= threshold)
df_clean  <- df_clean[cooks_d < threshold, ]
cat(sprintf("Removed %d outliers (Cook's D ≥ 4/n = %.5f). Remaining: %d observations.\n",
            n_removed, threshold, nrow(df_clean)))

summary(df_clean)

# --- 4. DATA SPLIT & EVALUATION FUNCTION ---

set.seed(42)
train_indices <- sample(seq_len(nrow(df_clean)), size = 0.8 * nrow(df_clean))
train_data <- df_clean[train_indices, ]
test_data  <- df_clean[-train_indices, ]

eval_model <- function(model, test_data, label = "") {
  pred_log   <- predict(model, newdata = test_data)
  pred_price <- exp(pred_log)
  rmse <- sqrt(mean((test_data$price - pred_price)^2, na.rm = TRUE))
  mae  <- mean(abs(test_data$price - pred_price), na.rm = TRUE)
  mape <- mean(abs((test_data$price - pred_price) / test_data$price), na.rm = TRUE) * 100
  r2   <- summary(model)$adj.r.squared
  
  cat(sprintf(
    "\n[%s] Adj.R2=%.4f | RMSE=%s | MAE=%s | MAPE=%.2f%%\n",
    label, r2,
    format(round(rmse), big.mark = ",", scientific = FALSE),
    format(round(mae),  big.mark = ",", scientific = FALSE),
    mape
  ))
}

# --- 5. FINAL MODEL TRAINING & DIAGNOSTICS ---

model_flat_final <- lm(
  log_price ~ area_log * rooms +
    floor_ratio + is_ground_floor + is_top_floor +
    ns(building_age, df = 4) +
    district + market_type * condition + offered_by + heating_simple +
    hasParking + hasBalcony + hasElevator +
    poly(latitude, 2) + poly(longitude, 2) + latitude:longitude,
  data = train_data
)

summary(model_flat_final)
eval_model(model_flat_final, test_data, "Final Flat Model")
vif(model_flat_final, type = "predictor")

par(mfrow = c(2, 2))
plot(model_flat_final)

bptest(model_flat_final)


# --- 6. EXPORT MODEL PARAMETERS FOR GO IMPLEMENTATION ---

library(jsonlite)

# Build the augmented knot vector exactly as ns() does internally
ns_ba        <- ns(train_data$building_age, df = 4)
Aknots_ba    <- sort(c(rep(attr(ns_ba, "Boundary.knots"), 4L), attr(ns_ba, "knots")))

# Compute the 2nd-derivative constraint matrix at both boundary knots,
# then derive the QR-based transform that enforces natural boundary conditions.
# (This replicates what predict.ns() does when evaluating on new data.)
const_ba     <- splineDesign(Aknots_ba, attr(ns_ba, "Boundary.knots"), 4L, 2L)
const_ba     <- const_ba[, -1L, drop = FALSE]   # drop first col (intercept = FALSE)
qr_ba        <- qr(t(const_ba))
Q_ba         <- qr.Q(qr_ba, complete = TRUE)
ns_transform <- Q_ba[, -(1:2), drop = FALSE]     # (K+3) x (K+1) matrix

# Orthogonal polynomial coefs for lat / lon
poly_lat <- poly(train_data$latitude,  2)
poly_lon <- poly(train_data$longitude, 2)

model_export <- list(
  coefficients   = as.list(coef(model_flat_final)),
  ns_building_age = list(
    Aknots    = as.numeric(Aknots_ba),
    transform = unname(as.matrix(ns_transform))
  ),
  poly_latitude = list(
    alpha = as.numeric(attr(poly_lat, "coefs")$alpha),
    norm2 = as.numeric(attr(poly_lat, "coefs")$norm2)
  ),
  poly_longitude = list(
    alpha = as.numeric(attr(poly_lon, "coefs")$alpha),
    norm2 = as.numeric(attr(poly_lon, "coefs")$norm2)
  )
)

write(
  toJSON(model_export, pretty = TRUE, auto_unbox = TRUE),
  file.path(dirname(rstudioapi::getActiveDocumentContext()$path), "model_params.json")
)
cat("model_params.json exported.\n")

# --- Verification test case ---
# Run this after export to verify the Go implementation gives the same result.
test_obs <- test_data[1, ]
r_pred   <- as.numeric(exp(predict(model_flat_final, newdata = test_obs)))
cat(sprintf("\nVerification – test_data[1,]:\n  R predicted price: %.0f PLN\n\n", r_pred))
cat("Input values for Go verification:\n")
print(test_obs[, c("district", "rooms", "area", "building_age", "floor_ratio",
                    "is_ground_floor", "is_top_floor", "condition", "market_type",
                    "offered_by", "heating_simple", "hasParking", "hasBalcony",
                    "hasElevator", "latitude", "longitude")])
