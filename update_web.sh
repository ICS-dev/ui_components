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
cd ../../ui_components/search_cinocompanies_by_country_and_year
npm install
grunt build

cd ../../scripts
