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

    var seasonsCheckbox = '#series-tools-' + sandbox.container + " #episodes-checkbox"
    var inputSeasons = '#series-tools-' + sandbox.container + " #series_episodes-input"

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

                    var seasonsChecked = $(seasonsCheckbox).is(':checked');
                    var episodesString = $(inputSeasons).val();

                    var keywordsChecked = $(keywordsCheckbox).is(':checked');
                    var keywordsString = $(inputKeywords).val();

                    if ((keywordsString.length != 0 && keywordsChecked) || yearChecked || seasonsChecked) {
                        var searchParams = {
                            needsSearchYear: yearChecked,
                            year: yearString.toString(),
                            needsSearchSeasons: seasonsChecked,
                            seasons: episodesString.toString(),
                            needsSearchKeywords: keywordsChecked,
                            keywordsToSearch: keywordsString,
                        };

                        findSeries(searchParams);
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
    let seriesNodes = [];

    SCWeb.core.Server.resolveScAddr(['concept_series', 'nrel_creation_year', 'nrel_number_of_seasons', 'nrel_description'], function (keynodes) {
        let conceptSeries = keynodes['concept_series'];
        let nrelYear = keynodes['nrel_creation_year'];
        let nrelSeasons = keynodes['nrel_number_of_seasons'];
        var nrelDescription = keynodes['nrel_description'];

        let promise = window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
            conceptSeries,
            sc_type_arc_pos_const_perm,
            sc_type_node,
        ]).done(function (result) {
            for (let i = 0; i < result.length; ++i) {
                seriesNodes.push(result[i][2]);
            }
            console.log("Found all series:");
            console.log(seriesNodes);
        }).done(function () {
            let promises = [];
            let promises2 = [];
            let foundYears = [];

            if (searchParams.needsSearchYear) {
                console.log("Needs year searching...")
                for (let i = 0; i < seriesNodes.length; ++i) {
                    let ser = seriesNodes[i];
                    promises.push(window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                        ser,
                        sc_type_const,
                        sc_type_link,
                        sc_type_arc_pos_const_perm,
                        nrelYear
                    ]).done(function (result) {
                        promises2.push(window.sctpClient.get_link_content(result[0][2]).done(function (yearStr) {
                            if (yearStr == searchParams.year) {
                                foundYears.push(result[0][0]);
                                console.log(result[0][0] + " mathes year, adding to copyList...")
                            }
                        }));
                    }));
                }
            }
            console.log(promises)
            console.log(promises2);
            $.when.apply($, promises).done(function () {
                console.log(promises2);
                $.when.apply($, promises2).done(function () {
                    if (searchParams.needsSearchYear) {
                        seriesNodes = seriesNodes.filter(item => foundYears.includes(item));
                        console.log("Filtered years");
                        console.log(seriesNodes);
                    }
                }).done(function () {
                    let promisesSer = [];
                    let promises2Ser = [];
                    let foundSeasons = []

                    if (searchParams.needsSearchSeasons) {
                        console.log("Needs seasons search...")
                        for (let i = 0; i < seriesNodes.length; ++i) {
                            let ser = seriesNodes[i];
                            console.log("Series (in seasons) sc_addr: " + ser);
                            promisesSer.push(window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                                ser,
                                sc_type_const,
                                sc_type_link,
                                sc_type_arc_pos_const_perm,
                                nrelSeasons
                            ]).then(function (result2) {
                                console.log("Series iterator done")
                                promises2Ser.push(window.sctpClient.get_link_content(result2[0][2]).done(function (seasonsStr) {
                                    console.log("Link content: " + seasonsStr)
                                    if (+seasonsStr >= +searchParams.seasons) {
                                        foundSeasons.push(result2[0][0]);
                                        console.log(result2[0][0] + " mathes seasons, adding to copyList...")
                                    }
                                }));
                            }, function() {console.log("ERROR")}));
                        }
                    }

                    console.log("Near $.when in series")
                    $.when.apply($, promisesSer).done(function () {
                        console.log("promises1 good")
                        console.log(promises2Ser)

                        $.when.apply($, promises2Ser).done(function () {
                            console.log("promises2 good")
                            if (searchParams.needsSearchSeasons) {
                                seriesNodes = seriesNodes.filter(item => foundSeasons.includes(item));
                                console.log("Filtered seasons");
                                console.log(seriesNodes);
                            }
                        }).done(function () {
                            let promises = [];
                            let promises2 = [];
                            let foundKeywords = [];

                            if (searchParams.needsSearchKeywords) {
                                console.log("Needs keywords search...")

                                for (let i = 0; i < seriesNodes.length; ++i) {
                                    let ser = seriesNodes[i];
                                    console.log("Series (in keywords) sc_addr: " + ser);
                                    promises.push(window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                                        ser,
                                        sc_type_const,
                                        sc_type_link,
                                        sc_type_arc_pos_const_perm,
                                        nrelDescription
                                    ]).done(function (result3) {
                                        promises2.push(window.sctpClient.get_link_content(result3[0][2]).done(function (descrStr) {
                                            console.log(descrStr);
                                            console.log(searchParams.keywordsToSearch);
                                            if( searchParams.keywordsToSearch.split(', ').some(keyword => descrStr.includes(keyword) )) {
                                                foundKeywords.push(result3[0][0]);
                                                console.log(result3[0][0] + " mathes keywords, adding to copyList...")
                                            }
                                        }));
                                    }));
                                }
                            }

                            $.when.apply($, promises).done(function () {
                                $.when.apply($, promises2).done(function () {
                                    if (searchParams.needsSearchKeywords) {
                                        seriesNodes = seriesNodes.filter(item => foundKeywords.includes(item));
                                        console.log("Filtered keywords");
                                        console.log(seriesNodes);
                                    }
                                }).done(function () {
                                    console.log("Showing " + seriesNodes);
                                    if (seriesNodes.length == 0) {
                                        return;
                                    }
                                    let kont;
                                    let crNodePromise = window.sctpClient.create_node(sc_type_const).done(function (kontur) {
                                        kont = kontur;
                                        for (let i = 0; i < seriesNodes.length; ++i) {
                                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, kontur, seriesNodes[i]);
                                        }
                                    });

                                    $.when(crNodePromise).done(function () {
                                        SCWeb.core.Main.doDefaultCommand([kont]);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
