SeriesSearchComponent = {
    ext_lang: 'series_search_code',
    formats: ['format_series_search_json'],
    struct_support: true,

    factory: function (sandbox) {
        return new setViewerWindow1(sandbox);
    }
};

var setViewerWindow1 = function (sandbox) {

    var self = this;
    this.sandbox = sandbox;
    this.sandbox.container = sandbox.container;

    var yearCheckbox = '#series-tools-' + sandbox.container + " #year-checkbox"
    var inputYear = '#series-tools-' + sandbox.container + " #series_year-input"

    var episodesCheckbox = '#series-tools-' + sandbox.container + " #episodes-checkbox"
    var inputEpisodes = '#series-tools-' + sandbox.container + " #series_episodes-input"

    var keywordsCheckbox = '#series-tools-' + sandbox.container + " #keywords-checkbox"
    var inputKeywords = '#series-tools-' + sandbox.container + " #series_keywords-input"

    var buttonFind = '#series-tools-' + sandbox.container + " #button-find-series";

    var keynodes = ['ui_series_search_in_memory'];

    $('#' + sandbox.container).prepend('<div class="inputBox" id="series-tools-' + sandbox.container + '"></div>');
    $('#series-tools-' + sandbox.container).load('static/components/html/series_search_component-main-page.html', function () {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonSearch = idf[keynodes['ui_series_search_in_memory']];

                $(buttonFind).html(buttonSearch);
                $(buttonFind).click(function () {
                    var yearChecked = $(yearCheckbox).is(':checked');
                    var yearString = $(inputYear).val();

                    var episodesChecked = $(episodesCheckbox).is(':checked');
                    var episodesString = $(inputEpisodes).val();

                    var keywordsChecked = $(keywordsCheckbox).is(':checked');
                    var keywordsString = $(inputKeywords).val();

                    if ((keywordsString.length != 0 && keywordsChecked) || yearChecked || episodesChecked) {
                        var searchParams = {
                            needsSearchYear: yearChecked,
                            year: yearString.toString(),
                            needsSearchEpisodes: episodesChecked,
                            episodes: episodesString.toString(),
                            needsSearchKeywords: keywordsChecked,
                            keywordsToSearch: keywordsString,
                        };

                        let userSeries = findSeries(searchParams);
                        showSeries(userSeries);
                    }
                });
            });
        });
    });

    this.applyTranslation = function (namesMap) {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonLoad = idf[keynodes['ui_series_search_in_memory']];

                $(buttonFind).html(buttonLoad);
            });
        });
    };
    this.sandbox.eventApplyTranslation = $.proxy(this.applyTranslation, this);
};

SCWeb.core.ComponentManager.appendComponentInitialize(SeriesSearchComponent);

function findSeries(searchParams) {
    var needsSearchYear = searchParams.needsSearchYear;
    var seriesYear = searchParams.year;
    var needsSearchEpisodes = searchParams.needsSearchEpisodes;
    var seriesSeasons = searchParams.episodes;
    var needsSearchKeywords = searchParams.needsSearchKeywords;
    var keywordsToSearch = searchParams.keywordsToSearch;

    var seriesNodes = [];
    SCWeb.core.Server.resolveScAddr(['concept_series', 'nrel_creation_year', 'nrel_number_of_seasons', 'nrel_description'], function (keynodes) {
        var conceptSeries = keynodes['concept_series'];
        var nrelYear = keynodes['nrel_creation_year']
        var nrelSeasons = keynodes['nrel_number_of_seasons']
        var nrelDescription = keynodes['nrel_description']

        window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
            conceptSeries,
            sc_type_arc_pos_const_perm,
            sc_type_node,
        ]).done(function (res) {
            for (var i = 0; i < res.length; ++i) {
                seriesNodes.push(res[i][2]);
            }
            console.log("Found all series:")
            console.log(seriesNodes);
        }).then(function () {
            var seriesCopy = []
            if (needsSearchYear) {
                console.log("NEEDS YEAR")
                for (var i = 0; i < seriesNodes.length; ++i) {
                    var ser = seriesNodes[i];
                    console.log("Series sc_addr: " + ser);
                    console.log("Starting iteration to find sc_links...");

                    window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                        ser,
                        sc_type_const,
                        sc_type_link,
                        sc_type_arc_pos_const_perm,
                        nrelYear
                    ]).done(function(res2) {
                        window.sctpClient.get_link_content(res2[0][2]).done(function (yearStr) {
                            console.log("Getting " + res2[0][2] + " content: " + yearStr)
                            if (yearStr == seriesYear) {
                                seriesCopy.push(res2[0][0]);
                                console.log(res2[0][0] + " mathes, adding to copyList...")
                            }
                        });
                    });
                    function sleep(ms) {
                        ms += new Date().getTime();
                        while (new Date() < ms){}
                        console.log("Sleeping")
                        }
                    sleep(1000);
                        
                }
                console.log("Ended iteration ")
                seriesNodes = seriesCopy;
                seriesCopy = [];
            }
            console.log("After finding year")
            console.log(seriesNodes);
        }).then(function () {
            if (needsSearchEpisodes) {
                console.log("NEEDS EPISODES")
                for (ser in seriesNodes) {
                    window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                        ser,
                        sc_type_const,
                        sc_type_node,
                        sc_type_arc_pos_const_perm,
                        nrelSeasons
                    ]).done(function (res2) {
                        var seasons = [];
                        for (r in res2) { seasons.push(res2[r][2]); }
                        window.sctpClient.resolveIdentifiers(seasons, function (idf) {
                            for (q in idf) {
                                if (idf[q] == seriesSeasons) {
                                    seriesCopy.push(res2[r][0]);
                                }
                            }
                        });
                    });
                }
                seriesNodes = seriesCopy;
                seriesCopy = [];
            }
        }).then(function () {
            if (needsSearchKeywords) {
                console.log("NEEDS KEYWORDS")
                for (ser in seriesNodes) {
                    window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                        ser,
                        sc_type_const,
                        sc_type_node,
                        sc_type_arc_pos_const_perm,
                        nrelDescription
                    ]).done(function (res2) {
                        var descriptions = [];
                        for (r in res2) { descriptions.push(res2[r][2]); }
                        window.sctpClient.resolveIdentifiers(descriptions, function (idf) {
                            for (q in idf) {
                                if (idf[q].contains(keywordsToSearch.split(', '))) {
                                    seriesCopy.push(res2[r][0]);
                                }
                            }
                        });
                    });
                }
                seriesNodes = seriesCopy;
                seriesCopy = [];
            }
        });
    });

    console.log("SHOULD BE SECOND");
    console.log(seriesNodes);
    return seriesNodes;
}

function showSeries(userSeries) {

    if (userSeries.length == 0) {
        return;
    }

    console.log("IN SHOW")
    console.log(userSeries);

    var kont;

    window.sctpClient.create_node(sc_type_const).done(function (kontur) {
        kont = kontur;
        for (ser in userSeries) {
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, kontur, ser);
        }

    });
    SCWeb.core.Main.doDefaultCommand([kont]);
}