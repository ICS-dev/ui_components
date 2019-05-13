SearchFilmByAgeLimitAndcountryComponent = {
    ext_lang: 'search_film_by_country_and_age_limit_code',
    formats: ['format_search_film_by_country_and_age_limit_json'],
    struct_support: true,

    factory: function (sandbox) {
        return new setSearchFilmByAgeLimitAndcountryViewerWindow(sandbox);
    }
};

var setSearchFilmByAgeLimitAndcountryViewerWindow = function (sandbox) {

    var self = this;
    this.sandbox = sandbox;
    this.sandbox.container = sandbox.container;

    var inputcountry = '#series-tools-' + sandbox.container + " #series_country-input"

    var inputSeasons = '#series-tools-' + sandbox.container + " #series_episodes-input"

    var buttonFind = '#series-tools-' + sandbox.container + " #button-find-series";

    var keynodes = ['ui_search_film_by_country_and_age_limit_in_memory'];

    $('#' + sandbox.container).prepend('<div class="inputBox" id="series-tools-' + sandbox.container + '"></div>');
    $('#series-tools-' + sandbox.container).load('static/components/html/search_film_by_country_and_age_limit_component.html', function () {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonSearch = idf[keynodes['ui_search_film_by_country_and_age_limit_in_memory']];

                $(buttonFind).html(buttonSearch);
                $(buttonFind).click(function () {
                    var countryString = $(inputcountry).val();

                    var age_limitString = $(inputSeasons).val();
                    
                    console.log("Film find " + countryString);
                    console.log("Film find age_limit string" + age_limitString);

                    if (countryString && age_limitString) {
                        var searchParams = {
                            country: countryString.toString(),
                            age_limit: age_limitString.toString()
                        };

                        findFilms(searchParams);
                    }
                });
            });
        });
    });

    this.applyTranslation = function (namesMap) {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonLoad = idf[keynodes['ui_search_film_by_country_and_age_limit_in_memory']];

                $(buttonFind).html(buttonLoad);
            });
        });
    };
    this.sandbox.eventApplyTranslation = $.proxy(this.applyTranslation, this);
};

SCWeb.core.ComponentManager.appendComponentInitialize(SearchFilmByAgeLimitAndcountryComponent);

function findFilms(searchParams) {
    console.log(searchParams);
    
    SCWeb.core.Server.resolveScAddr([searchParams.country, searchParams.age_limit], function (keynodes) {
        //addr = 'Project_1';
        addr1 = keynodes[searchParams.country];
        addr2 = keynodes[searchParams.age_limit];
        console.log("addr1", addr1);
        console.log("addr2", addr2);
        console.log("arguments", SCWeb.core.Arguments._arguments);
        // Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
        SCWeb.core.Server.resolveScAddr(["ui_menu_file_for_finding_films_by_country_and_age_limit"], function (data) {
            // Get command of ui_menu_view_full_semantic_neighborhood
            var cmd = data["ui_menu_file_for_finding_films_by_country_and_age_limit"];
            console.log("cmd", cmd);
            // Simulate click on ui_menu_view_full_semantic_neighborhood button
            SCWeb.core.Main.doCommand(cmd, [addr2, addr1], function (result) {
                // waiting for result
                if (result.question != undefined) {
                    // append in history
                    consonle.log(result.question);
                    SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                }
            });
        });
    });
}
