#!/bin/bash

green="\e[0;32m"
rst="\e[0m"     # Text reset

prepare()
{
    echo -en $green$1$rst"\n"
}

prepare "Update web component"

cd ../sc-web/
grunt build
cd ../ui_components/series_add_component
grunt build
cd ../../ui_components/series_search_component
grunt build
cd ../../ui_components/search_film_by_cinocompany_and_year
grunt build

cd ../../scripts
