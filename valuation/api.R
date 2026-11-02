library(splines)

CURRENT_YEAR <- 2026L

VALID_DISTRICTS <- c(
  "Stare Miasto", "Grzeg\u00f3rzki", "Pr\u0105dnik Czerwony", "Pr\u0105dnik Bia\u0142y",
  "Krowodrza", "Zwierzyniec", "Bronowice", "\u0141obz\u00f3w",
  "D\u0119bniki", "Podg\u00f3rze", "Bie\u017can\u00f3w-Prokocim", "Swoszowice",
  "Wzg\u00f3rza Krzes\u0142awickie", "Nowa Huta", "Czy\u017cyny", "Mistrzejowice",
  "Bie\u0144czyce", "\u0141agiewniki-Borek Fa\u0142\u0119cki", "Podg\u00f3rze Duchackie"
)

model         <- readRDS("model.rds")
factor_levels <- readRDS("factor_levels.rds")

#* @post /predict
#* @serializer unboxedJSON
function(req) {
  body <- jsonlite::fromJSON(req$postBody)

  floor_num          <- as.numeric(body$floor)
  floors_in_building <- as.numeric(body$floorsInBuilding)
  build_year         <- as.numeric(body$buildYear)
  area               <- as.numeric(body$area)

  heating_raw    <- tolower(as.character(body$heating))
  heating_simple <- if (heating_raw %in% c("urban", "miejskie")) "Urban" else
                    if (heating_raw == "gas") "Gas" else "Other_Unknown"

  rooms_str <- as.character(body$rooms)
  if (!rooms_str %in% c("1", "2", "3", "4+")) {
    n <- suppressWarnings(as.integer(rooms_str))
    rooms_str <- if (!is.na(n) && n >= 4) "4+" else as.character(n)
  }

  new_obs <- data.frame(
    area_log        = log(area),
    rooms           = factor(rooms_str, levels = c("1", "2", "3", "4+")),
    floor_ratio     = (floor_num + 1) / (floors_in_building + 1),
    is_ground_floor = as.integer(floor_num == 0),
    is_top_floor    = as.integer(floor_num == floors_in_building & floor_num > 0),
    building_age    = as.numeric(CURRENT_YEAR - build_year),
    district        = factor(body$district, levels = VALID_DISTRICTS),
    market_type     = factor(body$market_type, levels = factor_levels$market_type),
    condition       = factor(body$condition,   levels = factor_levels$condition),
    offered_by      = factor(body$offered_by,  levels = factor_levels$offered_by),
    heating_simple  = factor(heating_simple,   levels = factor_levels$heating_simple),
    hasParking      = as.logical(body$hasParking),
    hasBalcony      = as.logical(body$hasBalcony),
    hasElevator     = as.logical(body$hasElevator),
    latitude        = as.numeric(body$lat),
    longitude       = as.numeric(body$lon),
    stringsAsFactors = FALSE
  )

  predicted_log   <- predict(model, newdata = new_obs)
  estimated_price <- exp(as.numeric(predicted_log))

  list(estimatedPrice = estimated_price)
}
