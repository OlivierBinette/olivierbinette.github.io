# Make census_state file
# 
# Dependencies:
#   us.1969_2017.19ages.adjusted.txt

# Import raw data
raw_data = read_delim("data/us.1969_2017.19ages.adjusted.txt", delim="\n", col_names=c("input"))

# Name columns according to https://seer.cancer.gov/popdata/popdic.html
census = raw_data %>% transmute(year = substr(input, 1, 4),
                                   state = substr(input, 5, 6),
                                   state_fips = substr(input, 7, 8),
                                   county_fips = substr(input, 9, 11),
                                   registry = substr(input, 12, 13),
                                   race = substr(input, 14, 14),
                                   origin = substr(input, 15,15),
                                   sex = substr(input, 16, 16),
                                   age = substr(input, 17, 18),
                                   pop = substr(input, 19, 27))

# Summarize by state
census_state = census %>% 
  group_by(year, state, race, sex) %>% 
  summarize(pop = sum(as.numeric(pop))) %>% 
  group_by()

# Change state abbreviations to full name
abbr = read_csv("data/state_abbreviations.csv", 
                col_names=c("state", "short", "abbr")
)
toFull <- function(str) {
  tolower((abbr %>% filter(abbr==str))[[1]])
}

census_state = census_state %>% 
  rowwise() %>% 
  mutate(state=toFull(state))


# Save result
write_rds(census_state, "data/census_state.tibble")

