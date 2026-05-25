package data

type GenericChart struct {
	ID         ID       `json:"_id" bson:"_id"`
	Key        string   `json:"key" bson:"key"`
	ComputedAt Date     `json:"computed_at" bson:"computed_at"`
	GroupKey   GroupKey `json:"group_key" bson:"group_key"`
	Values     Count    `json:"values" bson:"values"`
}

type AreaStats struct {
	ID         ID       `json:"_id" bson:"_id"`
	Key        string   `json:"key" bson:"key"`
	ComputedAt Date     `json:"computed_at" bson:"computed_at"`
	GroupKey   GroupKey `json:"group_key" bson:"group_key"`
	Values Area `json:"values" bson:"values"`
}

type PriceStats struct {
	ID         ID       `json:"_id" bson:"_id"`
	Key        string   `json:"key" bson:"key"`
	ComputedAt Date     `json:"computed_at" bson:"computed_at"`
	GroupKey   GroupKey `json:"group_key" bson:"group_key"`
}

type Area struct {
	Count int `json:"count" bson:"count"`
	AvgArea float64 `json:"avg_area" bson:"avg_area"`
	MedArea float64 `json:"med_area" bson:"med_area"`
}

type Count struct {
	Count int `json:"count" bson:"count"`
}

type GroupKey struct {
	Period string `json:"period" bson:"period"`
}