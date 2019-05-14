#!/bin/bash

green="\e[0;32m"
rst="\e[0m"     # Text reset

prepare()
{
    echo -en $green$1$rst"\n"
}

prepare "Update web component"

cd ../sc-web/
npm install
grunt build
cd ../ui_components/series_add_component
npm install
grunt build
cd ../../ui_components/series_search_component
npm install
grunt build
cd ../../ui_components/search_film_by_cinocompany_and_year
npm install
grunt build
cd ../../ui_components/search_festival_by_year_and_country
npm install
grunt build
cd ../../ui_components/search_cinocompanies_by_country_and_year
npm install
grunt build
cd ../../ui_components/search_film_by_producer_and_year
npm install
grunt build
cd ../../ui_components/search_series_by_company_and_year
npm install
grunt build
cd ../../ui_components/search_film_by_genre_and_actor
npm install
grunt build
cd ../../ui_components/search_film_by_country_and_age_limit
npm install
grunt build
cd ../../ui_components/search_video_sequences_by_age_limit_and_country
npm install
grunt build
cd ../../ui_components/search_films_by_actor_and_production_year
npm install
grunt build

cd ../../scripts
