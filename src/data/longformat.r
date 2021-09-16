library(tidyverse)

#
# Counties
#
counties <- read.csv("src/data/counties.csv") %>%
    gather(year, n, -Name) %>%
    mutate(
        year = as.numeric(str_replace(year, "X", ""))
    ) %>%
    rename(
        county = Name
    ) %>%
    filter(
        !(county %in% c("Null", "APO/FPO/CPO USA"))
    )

write.csv(counties, "dist/data/counties.csv", row.names=F)

#
# States
#
states <- read.csv('src/data/states.csv') %>%
    gather(year, n, -State) %>%
    mutate(
        year = as.numeric(str_replace(year, "X", ""))
    ) %>%
    rename(
        state = State
    )

write.csv(states, "dist/data/states.csv", row.names=F)
