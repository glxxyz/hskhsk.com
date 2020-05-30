/*
    Shanka HSK Flashcards - lang_dutch.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:		Axel Dessein
        Email:		axel_dessein@hotmail.com	
        Date:		22/01/2014
    
*/

/* Start of language definition */
var lang_dutch = function() { 

/* These strings describe the language of this file */
this. this_language                     = "Nederlands";
this. this_switch_language              = "Wijzig taal naar Nederlands";

/* These strings describe all currently supported languages */
this. lang_interface_language           = "Taal wijzigen";
this. lang_english_language             = "Engels";
this. lang_dutch_language               = "Nederlands";
this. lang_spanish_language             = "Spaans";
this. lang_german_language              = "Duitse";
this. lang_french_language              = "Frans";
this. lang_italian_language             = "Italiaans";

/* Strings to do with the running of the app*/
this. app_cancel_silences_error         = "('Cancel' silences future errors)";
this. app_exception_error               = "Uitzondering";
this. app_generic_error                 = "Fout";
this. app_initialising_message          = "<br /><i>Uw browser ondersteund HTML5.<br /><br />Loading...</i><br /><br /><br /><br />";
this. app_new_version_download_confirm  = "Een nieuwe versie van Shanka werd gedownload.Wilt u de app nu heropstarten?";
this. app_no_html5_message              = "<h3>Uw browser ondersteund HTML5 niet.Gelieve een moderne browser (Safari of Chrome) te gebruiken om deze app te gebruiken.</h3><br /><br /><br />";
this. app_nojavascript_error            = "JavaScript is uitgeschakeld. Gelieve JavaScript in te schakelen of een andere browser te gebruiken.";
this. app_offline_status                = "OFFLINE";
this. app_please_wait_a_moment          = "Een ogenblik geduld, a.u.b.";
this. app_support_see_message           = "Voor ondersteuning zie <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
this. app_was_reloaded_message          = "De app werd heropgestart";

/* Generic re-usable strings for buttons etc. */
this. gen_add_text                      = "Toevoegen";
this. gen_all_text                      = "Alle";
this. gen_cancel_text                   = "Annuleren";
this. gen_delete_text                   = "Verwijderen";
this. gen_duplicate_text                = "Duplicate";
this. gen_edit_all_text                 = "Bewerken";
this. gen_remove_text                   = "Verwijderen";
this. gen_save_text                     = "Opslaan";

/* Main page strings */
this. main_beginners_quickstart_label   = "Beginners' Quick Start";
this. main_browser_no_html5_error       = "Uw browser ondersteund HTML5 niet.Gelieve een moderne browser (Safari of Chrome) te gebruiken om deze app te gebruiken."
this. main_choose_option_begin_label    = "Kies één van onderstaande opties om te beginnen met leren.";
this. main_menu_help_label              = "Menu <b>&#8801;</b> en Help <b>?</b> bevinden zich in de hoeken bovenaan.";
this. main_setup_wizard_label           = "Installatiewizard";

/* Titles of all pages */
this. page_about_title                      = "About";
this. page_add_algorithm_title              = "Algoritme toevoegen";
this. page_add_category_title               = "Categorie toevoegen";
this. page_add_flashcard_title              = "Flashcard toevoegen";
this. page_add_lesson_title                 = "Les toevoegen";
this. page_add_question_title               = "Vraag toevoegen";
this. page_algo_shanka_title                = "Shanka Algoritme";
this. page_algorithms_title                 = "Algoritme";
this. page_card_info_title                  = "Card Info";
this. page_cards_title                      = "Flashcards";
this. page_categories_title                 = "Categorieën";
this. page_category_title                   = "Categorie";
this. page_edit_algorithm_title             = "Algoritme aanpassen";
this. page_edit_algorithms_title            = "Algoritme aanpassen";
this. page_edit_categories_title            = "Categorieën aanpassen";
this. page_edit_category_name_title         = "Categorie aanpassen";
this. page_edit_flashcard_title             = "Flashcard aanpassen";
this. page_edit_lesson_title                = "Les aanpassen";
this. page_edit_lessons_title               = "Lessen aanpassen";
this. page_edit_question_title              = "Vraag aanpasse";
this. page_edit_questions_title             = "Vragen aanpassen";
this. page_export_title                     = "Exporteren";
this. page_help_contents_title              = "Help Contents";
this. page_help_prefix_title                = "Help";
this. page_history_title                    = "Geschiedenis";
this. page_import_title                     = "Importeren";
this. page_initialising_title               = "Initialiseren";
this. page_lessons_title                    = "Lessen";
this. page_main_app_title                   = "Shanka 闪卡";
this. page_main_title                       = "Hoofdmenu";
this. page_maintenance_title                = "Onderhoud";
this. page_pleco_import_title               = "Pleco Import";
this. page_practice_title                   = "Oefenen";
this. page_progress_title                   = "Voortgang";
this. page_question_title                   = "Vraag";
this. page_questions_title                  = "Vragen";
this. page_queue_title                      = "Wachtrij";
this. page_settings_title                   = "Instellingen";
this. page_skritter_import_title            = "Skritter Import";
this. page_sticky_import_title              = "StickyStudy Import";
this. page_study_title                      = "Studeren";
this. page_wizard1_title                    = "Wizard 1/4";
this. page_wizard2_title                    = "Wizard 2/4";
this. page_wizard3_title                    = "Wizard 3/4";
this. page_wizard4_title                    = "Wizard 4/4";
this. page_wizard_title                     = "Wizard";

/* Study page */
this. study_edit_text                       = "Wijzigen";
this. study_field_question_name_calligraphy = "Kalligrafie";
this. study_field_question_name_cursive     = "Cursief";
this. study_field_question_name_definition  = "Definitie";
this. study_field_question_name_notes       = "Notities";
this. study_field_question_name_pinyin      = "Pinyin";
this. study_field_question_name_simplified  = "Vereenvoudigd";
this. study_field_question_name_traditional = "Traditioneel";
this. study_field_question_text_calligraphy = "Kalligrafie";
this. study_field_question_text_cursive     = "Cursief";
this. study_field_question_text_definition  = "Definitie";
this. study_field_question_text_input_draw  = "Tekenen";
this. study_field_question_text_input_type  = "Type";
this. study_field_question_text_notes       = "Notities";
this. study_field_question_text_pinyin      = "Pinyin";
this. study_field_question_text_simplified  = "Hanzi";
this. study_field_question_text_traditional = "Hanzi";
this. study_invalid_card_id_error           = "Ongeldige kaart-ID: ";
this. study_invalid_question_id_error       = "Ongeldige vraag-ID: ";
this. study_no_cards_questions_use_wizard_error = "Er zijn geen kaarten of vragen om te studeren. Gelieve gebruik te maken van Quick Start, de wizard of importeren";
this. study_practice_short_text             = "Oefen";
this. study_practice_text                   = "Oefenen";
this. study_search_no_results               = "Geen resultaten";
this. study_search_result_label             = "Resultaten";
this. study_sentence_label                  = "Zin";
this. study_show_answer_label               = "Toon antwoord";
this. study_study_text                      = "Studeer";

/* Wizard pages */
this. wizard_added_lesson_message       = "Toegevoegde les.";
this. wizard_added_question_message     = "Toegevoegde vraag.";
this. wizard_algorithm_name_advanced    = "Geavanceerd";
this. wizard_algorithm_name_beginner    = "Beginners";
this. wizard_algorithm_name_intermediate = "Intermediate";
this. wizard_algorithm_name_random      = "Willekeurig";
this. wizard_algorithm_name_randomreview = "Willekeurige beoordeling";
this. wizard_algorithm_name_review      = "Review";
this. wizard_both_characters_label      = "Beide";
this. wizard_calligraphy_label          = "Kalligrafie";
this. wizard_created_algorithm_message  = "Gemaakt algoritme.";
this. wizard_created_flashcards_format  = "{0} flashcards gemaakt.";
this. wizard_created_lesson_name        = "Wizard gemaakt";
this. wizard_cursive_label              = "Cursief";
this. wizard_definition_label           = "Definitie";
this. wizard_done_label                 = "Klaar!";
this. wizard_found_lesson_message       = "Les gevonden.";
this. wizard_found_question_message     = "Vraag gevonden.";
this. wizard_merged_flashcards_format   = "{0} flashcards samengevoegd.";
this. wizard_next_label                 = "Volgende";
this. wizard_pinyin_label               = "Pinyin";
this. wizard_reading_label              = "Reading Hanzi";
this. wizard_select_one_vocab_error     = "Gelieve minimum één woordenschatlijst te selecteren!";
this. wizard_select_something_learn_error = "Gelieve iets om te leren te selecteren!";
this. wizard_sentences_label            = "Zinnen";
this. wizard_simplified_characters_label = "Vereenvoudigd";
this. wizard_traditional_characters_label = "Traditioneel";
this. wizard_what_is_level_label        = "Wat is uw niveau voor deze woordenschat?";
this. wizard_what_want_learn_label      = "Wat wilt u leren?";
this. wizard_which_characters_label     = "Welke karakters wilt u leren?";
this. wizard_which_vocab_label          = "Welke woordenschatlijst(en) wilt u studeren?";
this. wizard_writing_label              = "Writing Hanzi";

/* Flashcard viewing and editing */
this. card_add_text                     = "Flashcard toevoegen";
this. card_delete_selected_confirm      = "Wilt u de geselecteerde flashcards verwijderen?";
this. card_deleted_format               = "{0} flashcards verwijdert.";
this. card_duplicate_selected_confirm   = "Wilt u de geselecteerde flashcards verdubbelen?";
this. card_duplicated_format            = "{0} flashcards verdubbelt.";
this. card_enabled_label                = "Ingeschakeld";
this. card_historical_bronze_label      = "Brons";
this. card_historical_forms_label       = "Historische vormen";
this. card_historical_greatseal_label   = "Groot Zegel";
this. card_historical_oracle_label      = "Orakel";
this. card_historical_smallseal_label   = "Klein zegel";
this. card_if_queued_must_be_enabled_error = "Als een flashcard in de wachtrij staat, moet het ook zijn ingeschakeld!";
this. card_must_have_at_least_simp_trad_error = "U moet minimum één vereenvoudigd of traditioneel karakter hebben!";
this. card_must_have_definition_error   = "U moet een definite hebben!";
this. card_queued_label                 = "In de wachtrij gezet";
this. card_related_flashcards_label     = "Gerelateerde flashcards";
this. card_remove_selected_confirm      = "Wilt u de geselecteerde flashcards uit deze categorie verwijderen?";
this. card_removed_format               = "{0} flashcards verwijdert.";
this. card_saved_message                = "Flashcard opgeslagen.";
this. card_stroke_order_label           = "Trekjesvolgorde";

/* Category list and edit name page */
this. category_all_name                 = "Alle";
this. category_uncategorised_name       = "Ongecategoriseerd";
this. category_delete_selected_confirm  = "Wilt u de geselecteerde categorieën verwijderen?";
this. category_deleted_format           = "{0} categories verwijdert";
this. category_duplicate_sel_confirm    = "Wilt u de geselecteerde categorieën verdubbelen?";
this. category_duplicated_format        = "{0} categories verdubbelt";
this. category_edit_name                = "Naam bewerken";
this. category_must_enter_name_error    = "U dient een naam voor deze categorie in te voeren!";
this. category_name_exists_error        = "Deze categorie naam bestaat al!";
this. category_name_label               = "Categorie naam";
this. category_new_name                 = "Nieuwe categorie";
this. category_saved_format             = "Categorie '{0}' opgeslagen";

/* Settings page */
this. settings_auto_advance_label       = "Automatisch vooruit";
this. settings_auto_queue_label         = "Automatisch in de wachtrij plaatsen van nieuwe flashcards";
this. settings_background_colour_label  = "Achtergrondkleur";
this. settings_background_guides_label  = "Background Gidsen";
this. settings_border_colour_label      = "Randkleur";
this. settings_brush_colour_label       = "Borstelkleur";
this. settings_brush_width_label        = "Borstelbreedte";
this. settings_each_enabled_rating_must_have_val_error = "Elk van de ingeschakelde cijfertoetsen moet een waarde hebben.";
this. settings_enable_tone_colours_label = "Enable Tone Colours";
this. settings_general_label            = "Algemene instellingen";
this. settings_grid_colour_label        = "Roosterkleur";
this. settings_guide_star_label         = "米 Ster";
this. settings_guide_grid_label         = "井 Rooster";
this. settings_guide_cross_label        = "十 Kruis";
this. settings_guide_bar_label          = "丨 Balk";
this. settings_guide_none_label         = "Geen gidsen";
this. settings_hanzi_input_label        = "Hanzi Teken Input";
this. settings_must_enable_two_buttons_error = "U moet ten minste twee cijfertoesten inschakelen";
this. settings_preferred_script_label   = "Voorkeurs script";
this. settings_rating_enabled_label     = "Ingeschakeld";
this. settings_ratings_label            = "Ratings";
this. settings_response_1_default       = "Geen idee";
this. settings_response_2_default       = "Fout";
this. settings_response_3_default       = "Zo zo";
this. settings_response_4_default       = "Juist";
this. settings_response_5_default       = "Gemakkelijk";
this. settings_saved_message            = "Instellingen opgeslagen.";
this. settings_simp_trad_label          = "Vereenvoudigd [Traditioneel]";
this. settings_simplified_label         = "Enkel vereenvoudigd";
this. settings_tone_1_label             = "Toon 1";
this. settings_tone_2_label             = "Toon 2";
this. settings_tone_3_label             = "Toon 3";
this. settings_tone_4_label             = "Toon 4";
this. settings_tone_5_label             = "Toon 5";
this. settings_tone_colours_label       = "Pinyin toonkleuren";
this. settings_tone_marks_label         = "Pinyin toontekens";
this. settings_trad_simp_label          = "Traditioneel [Vereenvoudigd]";
this. settings_traditional_label        = "Enkel traditioneel";

/* Maintenance page */
this. maintenance_app_cache_label       = "App Cache";
this. maintenance_erase_label           = "Erase";
this. maintenance_erase_local_label     = "Erase local data";
this. maintenance_installed_label       = "Installed";
// this. maintenance_latest_label          = "Latest";
this. maintenance_rebuild_label         = "Rebuild";
this. maintenance_rebuild_local_label   = "Rebuild local storage";
this. maintenance_refresh_label         = "Refresh";
this. maintenance_reload_label          = "Reload";
this. maintenance_reload_local_label    = "Reload local data";
this. maintenance_stand_alone_label     = "Standalone";
this. maintenance_storage_used_format   = "Using {0} characters of local storage";
this. maintenance_system_language_label = "System Language";
this. maintenance_update_label          = "Update";

/* Import page */
this. import_algorithms_label               = "Algoritmes";
this. import_chineasy_label                 = "Chineasy";
this. import_default_category_label         = "Default Categorie";
this. import_downloading_file_message       = "Bezig met downloaden van het importbestand, even geduld...";
this. import_flashcards_label               = "Flashcards";
this. import_generic_error                  = "Import error";
this. import_hsk1_label                     = "HSK 1 Woordenschat";
this. import_hsk2_label                     = "HSK 2 Woordenschat";
this. import_hsk3_label                     = "HSK 3 Woordenschat";
this. import_hsk4_label                     = "HSK 4 Woordenschat";
this. import_hsk5_label                     = "HSK 5 Woordenschat";
this. import_hsk6_label                     = "HSK 6 Woordenschat";
this. import_lessons_label                  = "Lessen";
this. import_parsing_data_message           = "Parseren van de importdata...";
this. import_paste_text_label               = "Plak tekst of een link (http://...) hier";
this. import_pleco_text_file_label          = "Pleco Text File";
this. import_pleco_xml_file_label           = "Pleco XML File";
this. import_progress_label                 = "Voortgang";
this. import_section_other                  = "Andere";
this. import_section_quick                  = "Vlug";
this. import_section_shanka                 = "Shanka";
this. import_settings_label                 = "Instellingen";
this. import_skritter_simp_label            = "Skritter (Vereenvoudigd)";
this. import_skritter_trad_label            = "Skritter (Traditioneel)";
this. import_stickystudy_label              = "StickyStudy";
this. import_timed_out_error                = "Importeren time-out!";

/* Export page */
this. export_beginning_message              = "Gaat exporteren...";
this. export_categories_label               = "Categorieën tot Export";
this. export_do_export_label                = "Exporteren";
this. export_download_filename              = "ShankaExport.txt";
this. export_download_filetext              = "Bestand downloaden";
this. export_export_format_label            = "Export Format";
this. export_other_label                    = "Andere";
this. export_success_message                = "Alle data werd geëxporteerd";

/* Question list and page */
this. question_answer_label             = "Antwoord";
this. question_auto_generate_label      = "Auto-genereren";
this. question_calligraphy_label        = "Kalligrafie";
this. question_components_label         = "Vraagcomponenten";
this. question_cursive_label            = "Cursief";
this. question_definition_label         = "Definitie";
this. question_delete_selected_confirm  = "Wilt u de geselecteerde vragen verwijderen?";
this. question_deleted_format           = "{0} vragen verwijderd";
this. question_display_label            = "Display";
this. question_duplicate_sel_confirm    = "Wilt u de geselecteerde vragen verdubbelen?";
this. question_duplicated_format        = "{0} vragen verdubbelt";
this. question_hanzi_touch_label        = "Hanzi Touchpad";
this. question_inputs_label             = "Inputs";
this. question_name_label               = "Vraag naam";
this. question_name_text_error          = "Uw vraag moet een naam en wat tekst hebben!";
this. question_new_name                 = "Nieuwe vraag";
this. question_notes_label              = "Notities";
this. question_pinyin_label             = "Pinyin";
this. question_saved_format             = "Vraag '{0}' opgeslagen";
this. question_simplified_label         = "Vereenvoudigde Hanzi";
this. question_stem_answer_error        = "Uw vraag moet ten minste een stam en een antwoord hebben!";
this. question_stem_label               = "Stam";
this. question_text_edit_label          = "Tekst bewerken";
this. question_text_label               = "Vraagtekst";
this. question_traditional_label        = "Traditionele Hanzi";
this. question_whats_the_format         = "What is de {0}?";
this. question_and_separator            = "en";

/* Lesson list and page */
this. lesson_delete_selected_confirm    = "Wilt u de geselecteerde lessen verwijderen?";
this. lesson_deleted_format             = "{0} lessen verwijdert";
this. lesson_duplicate_selected_confirm = "Wilt u de geselecteerde lessen verdubbelen?";
this. lesson_duplicated_format          = "{0} lessen verdubbelt";
this. lesson_must_include_1_cat_error   = "U moet ten minste één categorie invoegen!";
this. lesson_must_include_1_quest_error = "You must include at least one question!";
this. lesson_name_already_exist_error   = "Die les naam bestaat al!";
this. lesson_name_cant_be_empty_error   = "De les naam kan niet leeg zijn.!" 
this. lesson_name_label                 = "Les naam";
this. lesson_new_name                   = "Nieuwe les";
this. lesson_review_mode_name           = "(Review)";
this. lesson_reviewing_label            = "Herziening";
this. lesson_saved_format               = "Les '{0}' opgeslagen";

/* Algorithm list and page */
this. algorithm_adjustment_speed_positive_error         = "Aanpassing snelheid moet positief zijn!"
this. algorithm_any_element_probability_0_1_error       = "Any Element Probability must be between 0 and 1!";
this. algorithm_cannot_delete_last_error                = "Kan het laatste algoritme niet verwijderen";
this. algorithm_daily_correct_target_positive_int_error = "Daily Correct Target moet een positief geheel getal zijn!";
this. algorithm_daily_minutes_target_positive_int_error = "Daily Minutes Target moet een positief geheel getal zijn!";
this. algorithm_daily_new_target_positive_int_error     = "Daily New Target moet een positief geheel getal zijn!";
this. algorithm_default_knowledge_rate_0_1_error        = "Default Knowledge Rate moet tussen 0 and 1 zijn!";
this. algorithm_delete_selected_confirm                 = "Wilt u de geselecteerde algoritmes verwijderen?";
this. algorithm_duplicate_selected_confirm              = "Wilt u de geselecteerde algoritmes verdubbelen?";
this. algorithm_first_element_probability_0_1_error     = "First Element Probability moet tussen 0 and 1 zijn!";
this. algorithm_minimum_interval_postive_0_error        = "Minimum Interval moet positief of gelijk zijn aan nul!";
this. algorithm_minimum_unknown_card_positive_int_error = "Minimum Unknown Cards moeten een positief geheel getal zijn!";
this. algorithm_name_cant_be_empty_error                = "Algoritme naam kan niet leeg zijn!";
this. algorithm_threshold_knowledge_rate_0_1_error      = "Threshold Knowledge Rate moet tussen 0 and 1 zijn!";
this. algorithm_adjustment_speed        = "Aanpassing snelheid";
this. algorithm_any_element_probability = "Any Element Probability";
this. algorithm_choose_label            = "Kies een algoritme";
this. algorithm_current_label           = "Huidige";
this. algorithm_daily_correct_target    = "Dagelijks doel correct";
this. algorithm_daily_minutes_target    = "Dagelijks doel minuten";
this. algorithm_daily_new_target        = "Dagelijks doel nieuw";
this. algorithm_default_knowledge_rate  = "Default Knowledge Rate";
this. algorithm_deleted_format          = "{0} algoritmes verwijdert";
this. algorithm_duplicated_format       = "{0} algoritmes verdubbelt";
this. algorithm_first_element_prob      = "First Element Probability";
this. algorithm_history_today           = "Vandaag";
this. algorithm_history_yesterday       = "Gisteren";
this. algorithm_knowledge_rate_display  = "Kennis graad";
this. algorithm_knowledge_rate_trouble  = "Problemen";
this. algorithm_knowledge_rate_learned  = "Geleerd";
this. algorithm_knowledge_rate_learning = "Leren";
this. algorithm_minimum_interval        = "Minimale interval";
this. algorithm_minimum_unknown_cards   = "Minimale ongekende flashcards";
this. algorithm_name_label              = "Naal";
this. algorithm_new_name                = "Nieuw Algoritme";
this. algorithm_parameters              = "Parameters";
this. algorithm_saved_format            = "Algoritme '{0}' opgeslagen";
this. algorithm_study_settings          = "Studie instellingen";
this. algorithm_threshold_kn_rate       = "Threshold Knowledge Rate";

/* Local storage rebuild and load */
this. local_storage_cannot_save_ios     = "Kan niet worden opgeslagen in de lokale opslag. Uw schijfruimte kan overschreden zijn of u bevindt zich in een privé-sessie.";
this. local_storage_cannot_save_other   = "Kan niet worden opgeslagen in de lokale opslage, uw schijfruimte is overschreden.";
this. local_storage_erase_confirm       = "Wilt u de lokale opslage van gegevens verwijderen?";
this. local_storage_erased_message      = "Local storage data was nuked!";
this. local_storage_rebuild_confirm     = "Herbouw lokale opslag?";
this. local_storage_rebuilt_ok_message  = "De lokale opslag werd herbouwd - geen fouten gevonden!";
this. local_storage_errors_detected_resolved_error =
    "Fouten in de lokale opslag werden gevonden en opgelost.\n\n" +
    "U hebt waarschijnlijk ontbrekende of verbroken lessen, vragen, categorieën of kaarten.\n\n" +
    "Meer gedetailleerde informatie is beschikbaar in de JavaScript-console.";

/* Help pages */
this. help_contents_label = "Help";

this. help_main_page =
    "<h3>Voordat u begint...</h3>" +
        "<p>Voegt u eerst onze hoofdpagina (welkomstpagina) toe aan het startscherm van uw toestel.</p>" +
        "<p>Dit laat u toe de app te gebruiken zelfs als u offline bent. De app zal eveneens op een volledig scherm te zien zijn, zodat u meer ruimte krijgt om te studeren.</p>" +
        "<p>Voor iOS-systemen gaat dit als volgt: u klikt op het pictogram in het midden van de onderkant van uw scherm, dit lijkt op een doos met pijl naar boven, daarna kiest u voor 'Add to Home Screen'.</p>" +
        "<p>Vergelijkbare functionaliteit is beschikbaar op alle moderne webbrowsers op Windows, Android, Mac OS, Windows Mobile en Blackberry.</p>";

this. help_lessons =
    "<h3>Geselecteerde lessen</h3>" +
        "<p>Als u studeert zullen enkel vragen en categorieën van de lessen die u aanvinkte worden gebruikt.</p>";

this. help_card_info =
    "<h3>Categorieën</h3>" +
        "<p>Toont de categorieën, indien van toepassing, waartoe de huidige kaart is aangewezen.</p>" +
    "<h3>Gerelateerde flashcards</h3>" +
        "<p>Toont alle flashcards die tekens gemeen hebben met de huidige flashcard.</p>" +
    "<h3>Trekjesvolgorde</h3>" +
        "<p>Sommige (maar niet alle) karakters hebben hebben een trekjesvolgorde, voorzien door the Wikimedia Foundation.</p>" +
    "<h3>Historische vormen</h3>" +
        "<p>The Wikimedia Foundation verzamelde tal van representatieve historische vormen voor Chinese karakters. " +
        "Deze kunnen bijdragen aan het begrijpen van enkele pictogrammen.</p>";

this. help_practice =
    "<h3>Just Relax!</h3>" +
        "<p>Op deze oefenpagina kunt u achterover leunen en op een rustige wijze karakters leren, dewelke u maar wilt!.</p>" +
        "<p>Voer de karakters die u wilt leren in het tekstvak in.</p>" +
        "<p>Alle andere functies van de Studie-pagina is beschikbaar.</p>" +
    "<h3>Search</h3>" +
        "<p>U kunt zoeken via de hanzi en pinyin van alle flashcards door op het vergrootglas te klikken." +
        "Het zoekprogramma zoekt voor de karakters in het tekstvak en zal een lijst met resultaten weergeven. Als er slechts één resultaat is, zal het rechtstreeks naar die flashcard doorgaan.</p>";

this. help_study =
    "<p>Dit is de pagina waar u de meeste tijd zal doorbrengen, met het testen d.m.v. flashcards.</p>" +
    "<h3>Stem</h3>" +
        "<p>De stam van de vraag is de informatie die u krijgt.</p>" +
    "<h3>Answer</h3>" +
        "<p>Het antwoord is de informatie die u levert. Type of teken het antwoord, en klik nadien op 'Toon het antwoord' om te zien of u juist bent.</p>" +
    "<h3>Hanzi Input</h3>" +
        "<p>Als een hanzi input wordt weergegeven kan u zoveel tekens trekken als u maar wilt. Daarbovenop kunt u dit ook telkens herhalen." +
        "Door op de 下 toets te klikken ga je naar het volgende rooster, mocht u zich reeds op het laatste rooster bevinden, dan voegt deze knop een nieuw toe. U kan ook" +
        "op de roosters klikken om ze te seleteren. Andere controls laten u het kleur van uw pen kiezen, tonen/verbergen een 'overlay' van het karakter of laten u uw tekening hermaken., " +
        "U kunt het huidige rooster eveneens weer vrijmaken.</p>" +
    "<h3>Display</h3>" +
        "<p>Wat extra informatie, zoals notities waarop u niet wordt beoordeeld, kan ook naast het antwoord verschijnen.</p>" +
    "<h3>Beroordeling</h3>" +
        "<p>Beoordeel jezelf op elk deel van het antwoord, om te bepalen wanneer u de volgende keer zal worden getest op de huidige flashcard." +
        "U kunt dit meerdere keren tegelijk doen.</p>";

this. help_categories =
    "<p>Categories are sometimes called word lists in other systems. They help you to organise your flashcards, and to tell the app which flashcards you want to study.</p>" +
    "<p>A card can exist in multiple categories, or none at all in which case it is 'uncategorised'.</p>";

this. help_progress =
    "<p>De voortgangspagina toont hoeveel woorden u kent, hoe lang u studeerde, en hoeveel flashcards u hebt ingestudeerd, " +
    "elke dag dat u de app gebruikt.</p>";

this. help_history =
    "<p>De geschiedenis pagina toont u alle flashcards die u instudeerde, in de volgorde dat u ze instudeerde. " +
    "Elke flashcard zal maar een enkele keer in de lijst verschijnen.</p>";

this. help_import =
    "<p>Met deze pagina kunt u data importeren uit de ingebouwde woordenlijsten, of van een ander systeem.</p>";

this. help_export = "Export help" +
    "<p>Via exporteren maakt u een back-up van uw gegevens. U kan eveneens deze gegevens overplaatsen naar de Shanka app op een ander (flashcard) systeem.</p>" +
    "<h3>Export Result</h3>" +
        "<p>Kopieer de tekst in de Teksteditor en plak deze in een andere app. " +
        "U kunt ook op de \"Download file\" knop klikken.</p>";

this. help_settings =
    "<p>Met instellingen kunt u de app naar believen tweaken.</p>" +
    "<h3>Algemene instellingen</h3>" +
        "<p>Als auto voortgang is ingeschakeld, zal de volgende flashcard verschijnen zodra u de voorgaande hebt beoordeelt.</p>" +
    "<h3>Hanzi drawing input</h3>" +
        "<p>Deze instellingen bepalen het uiterlijk van de hanzi drawing input in de studeer- en oefenmodus.</p>" +
    "<h3>Achtergrondgidsen</h3>" +
        "<p>De vorm van de hanzi achtergrondgids kan hier worden geconfigureerd.</p>" +
    "<h3>Pinyin Toon Kleuren</h3>" +
        "<p>Indien ingeschakeld, zal dit de weergegeven kleuren voor elke lettergreep weergeven.</p>" +
    "<h3>Voorkeur schrift</h3>" +
        "<p>U kunt zelf beslissen of u liever vereenvoudigde, traditionele hanzi, of een combinatie van de twee wilt zien.</p>" +
    "<h3>Ratings</h3>" +
        "<p>Kies de namen die u wilt zien voor de beoordelingen in de studie-pagina, en alle die u niet wilt gebruiken.</p>";

this. help_queue =
    "<p>De wachtrij toont u alle woorden die u momenteel studeert, en laat u weten hoe goed u ze allemaal kent. " +
    "De woorden zijn geschatte volgorde waarin ze worden bestudeerd. De orde is wel willekeurig, zodat het niet voorspelbaar wordt.</p>";

this. help_algorithms =         
    "<h3>Shanka Algoritme</h3>" +
        "<p>Dit algoritme bepaalt de volgorde waarin de flashcards aan u worden getoond, en hoeveel nieuwe flashcards er worden toegevoegd..</p>" +
    "<h3>Studie instellingen</h3>" +
        "<p><li><b>Minimum Unknown Cards </b> - Als het aantal onbekende kaarten nder dit niveau valt, dan zullen nieuwe flashcards worden toegevoegd aan de wachtrij.</p>" +
        "<p><li><b>Daily Correct Target</b> - Dit is het minimum aantal kaarten die u per dag juist zou moeten hebben.</p>" +
        "<p><li><b>Daily New Target</b> - Dit is het aantal nieuwe kaarten om dagelijks toe te voegen.</p>" +
        "<p><li><b>Daily Minutes Target</b> - Dit is het studiedoel per dag, weergegeven in minuten.</p>" +
    "<h3>Parameters</h3>" +
        "<p><li><b>Default Knowledge Rate</b> - Kennisgraad <i><b>kn_rate</b></i> is hoe goed je elk stukje informatie in een flashcard kent. Nul is helemaal niet, één is perfect.</p>" +
        "<p><li><b>Threshold Knowledge Rate</b> - De kennisgraad waarbij elk stukje informatie zal worden gezien als gekend.</p>" +
        "<p><li><b>Adjustment Speed</b> - De snelheid waarbij de kennis voor elk stukje informatie zal evolueren naar nul/één als u vragen fout/goed beantwoord. " +
            "If this adjustment speed is <i><b>a</b></i>, then when a question is answered incorrectly, <i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " +
            "Als u een vraag juist beantwoord, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. If the five answer choices are numbered 1-5, then " +
            "answer 3 will not change the knowledge rate, answers 2 and 4 are wrong and right, and answers 1 and 5 count as two wrong or right answers respectively.</p>" +
        "<p><li><b>Any Element Probability</b> - The probability that the next flashcard will be randomly drawn from anywhere in the queue, instead of the front of the queue. " +
            "This setting allows even very old cards to be occasionally sprinkled into the studying. If you don't want this to happen, set the value to zero.</p>" +
        "<p><li><b>First Element Probability</b> - If this probability is <i><b>p</b></i>, and the first flashcard in the queue is number <i><b>0</b></i>, then flashcard " +
            "<i><b>n</b></i> will be chosen as the card to study with probability <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + 
            "As the sum for all flashcards in the queue will be slightly less than 1, the leftover probability is assigned to the first element.</p>" +
        "<p><li><b>Minimum Interval</b> - The minimum number of cards that must be shown before a card is repeated, even if it is always marked as unknown.</p>";

this. help_questions =     
    "<h3>Vraag naam</h3> " +
        "<p>Enkel gebruikt om de vraag in de vragenlijst te identificeren.</p> " +
    "<h3>Vraag tekst</h3> " +
        "<p>De tekst die bovenaan de kaart verschijnt, e.g. \"Wat is de pinyin transcriptie voor dit karakter?\"</p> " +
        "<p>Laat de auto-generate checkbox aangevinkt als u wil dat de app deze tekst creërt a.d.h. van de geselecteerde input, stam en antwoorden.</p> " +
    "<h3>Inputs</h3> " +
        "<p>Deze inputs worden weergegeven naast de vraag. Als je Chinees" +
        "typet in de edit box, dan kan je ofwel het pinyin het van je systeem gebruiken " +
        "ofwel IME ofwel via de handgeschreven input</p> " +
    "<h3>Stam</h3> " +
        "<p> De 'voorzijde' van de kaart, voor deze vraag.</p> " +
    "<h3>Antwoord</h3> " +
        "<p> Het deel op de 'achterzijde' van de kaart, waarop je wordt beoordeeld.</p> " +
    "<h3>Display</h3> " +
        "<p> Andere informatie op de 'achterzijde' van de kaart, zoals weergegven naast het antwoord.</p>";

this. help_maintenance = 
    "<h3>Reload</h3>" +
        "<p>Reloading zal de app heropstarten, gebruikmakende van de informatie in de lokale opslag. " +
        " Dit kan helpen mocht u in de problemen geraken, of als u per abuis verschillende malen de app draait.</p>" +
    "<h3>Standalone</h3>" +
        "<p>Deze date wordt gebruik bij het opsporen van problemen van de app. Het zou moeten 'true' zijn, als u deze app draait in" +
        "'de homescreen' of 'standalone' modus, en 'false' als u dit doet vanuit een web browser.</p>" +
    "<h3>Systeemtaal</h3>" +
        "<p>Dit is de taal, zoals aangegeven door uw systeem.</p>" +
    "<h3>App Cache</h3>" +
        "<p>Deze web app bewaart informatie over de flashcards etc. in de lokale opslage. De cache is hiervan afgezonderd, en" +
        "downloads de eigenlijke applicatie pagina's zodat u ze offline kunt gebruiken. Als de app cache status" +
        "UNCACHED is, dan zal het waarschijnlijk niet mogelijk zijn om offline toegang te krijgen tot de app. Om offline gebruik te waarborgen, moet je zorgen voor" +
        "een app cache status CACHED.</p>" +
    "<h3>Update Web App</h3>" +
        "<p>Om de laatste versie van deze app the installeren, klikt u 'Update Web App' als u merkt dat de laatste versie" +
        "anders is dan de huidige geïnstalleerde versie. U zou deze functie niet nodig hebben als u" +
        "de app updated bij het opstarten</p>" +
    "<h3>Lokale opslag</h3>" +
        "<p>Zie <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " +
        "om uw lokale opslagslimiet te berekenen, dit is meestal rond 2,5M afhankelijk van uw browser." +
        "Note: 1k=2<sup>10</sup>=1024 characters, 1M=2<sup>20</sup> characters. Meestal is 1 karakter = 2 bytes, dus" +
        "2.5M karakters = 5MB ruimte.</p>" +
    "<h3>Lokale data verwijderen</h3>" +
        "<p> Bij problemen kan u opteren om de lokale data te verwijderen. Als u uw huidige geschiedenis " +
        "wilt behouden, dient u eerst een backup van uw data te exporteren.</p>";

this. help_wizard =
    "<p>Gebruik deze wizard ter vereenvoudiging van het creëren van lessen.</p>" +
    "<p>U kan deze wizard meer dan eens gebruiken voor het creëren van meerdere lessen, om dan te kiezen welke les u wilt instuderen via het lessenvenster.</p>";
this. help_about = 
    "<h3>License</h3>" +
        "<p>You are free to copy, distribute, and modify this code, under a similar license " +
        "to this one. You must give the original author (me) credit in any dervied work. " +
        "You may not use any part of this code for any commercial purpose without obtaining " +
        "my permission.</p>" +
        "<p>Alan Davies 2014 <a href='mailto:alan@hskhsk.com'>alan@hskhsk.com</a></p>" +
        "<p>See <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a> for more information.</p>" +
    "<h3>Credits</h3>" +
        "<li>Customised version of the UI library <a href='http://maker.github.io/ratchet/'>Ratchet</a> provides the app's look and feel<br />" +
        "<li>Sidebar code is <a href='https://github.com/jakiestfu/Snap.js/'>Snap.js</a> by jakiestfu<br />" +        
        "<li>Initial app structure inspired by <a href='http://html5db.desalasworks.com/'>sqldb example</a> by Steven de Salas <br />" +
        "<li><a href='http://pieroxy.net/blog/pages/lz-string/index.html'>lz-string</a> compression routines by Pieroxy<br />" +
        "<li>Touchpaint control is a heavily modified version of the <a href='http://gregmurray.org/ipad/touchpaint/'>original by Greg Murray</a> <br />" +            
        "<li>Colour Picker is Jan Odvárko's <a href='http://jscolor.com/'>jscolor</a> <br />" +  
        "<li>Shanka algorithm inspired by Adam Nagy of Cybertron BT's now-defunct <a href='https://web.archive.org/web/20100424220218/http://memodrops.com/algorithm.html'>Memodrops</a>.<br />" +
        "<li>iPhone taps are more responsive thanks to <a href='https://github.com/ftlabs/fastclick'>FastClick</a><br />" +
        "<li>Standalone web app scrolling problems are fixed by <a href='https://github.com/jakiestfu/AppScroll.js/'>AppScroll</a><br />" +
        "<li><a href='http://commons.wikimedia.org/wiki/Commons:Stroke_Order_Project'>Stroke order animations</a> and " + 
            "<a href='http://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project'>Ancient Chinese Characters</a> " +
            "are provided by the <a href='http://commons.wikimedia.org/'>Wikimedia Foundation</a><br />" +
        "<li>Code was edited using <a href='http://notepad-plus-plus.org/'>Notepad++</a><br />" + 
        "<li>Website hosted using <a href='http://aws.amazon.com/'>Amazon Web Services</a><br />" + 
        "<li>Uploading and manipulating files on Amazon S3 is made a lot easier with NetSDK Software's <a href='http://s3browser.com/'>S3 Browser</a><br />" +
        "<li>Many problems were solved with the help of the comments and solutions on <a href='http://stackoverflow.com/'>Stack Overflow</a><br />"+
    "<h3>Thanks</h3>" +
        "<li>Many thanks to the Chinese Forums, Pleco, and Skritter user communities, and the many beta testers who have found bugs and suggested improvements.<br />" +
        "<li>Thank you also to the translators who are working on internationalising this app!";
        
// Progress page and progress displayed on main page
this. main_cards_learned_label  = "geleerd";
// this. main_cards_queued_label  = "in de wachtrij";
this. main_cards_total_label    = "gotaal";
this. progress_studied_label    = "studeerde";
this. progress_total_label      = "Gotaal";
this. progress_daily_label      = "Dagelijkse";
this. progress_today_label      = "Vandaag";
this. progress_seconds          = "seconden";
this. progress_minutes          = "minuten";
this. progress_hours            = "uren";
this. progress_days             = "dagen";
this. progress_weeks            = "weken";
this. progress_years            = "jaar";
this. progress_list_format      = "Studeerde {0} en {1} leerde kaarten in {2}";

/* Translated version of this section should be modified to show
 * which files have and haven't been translated */
this. language_unknown_error = "Unknown language code:";        
this. import_hsk1_label                     = "HSK 1 Words";
this. import_hsk2_label                     = "HSK 2 Words (Engels)";
this. import_hsk3_label                     = "HSK 3 Words (Engels)";
this. import_hsk4_label                     = "HSK 4 Words (Engels)";
this. import_hsk5_label                     = "HSK 5 Words (Engels)";
this. import_hsk6_label                     = "HSK 6 Words (Engels)";
this. import_hsk1_sentences_label           = "HSK 1 Zinnen";
this. import_hsk2_sentences_label           = "HSK 2 Zinnen";
this. import_hsk3_sentences_label           = "HSK 3 Zinnen";
this. import_chineasy_label                 = "Chineasy";
this. import_hsk1_category                  = "HSK 1";
this. import_hsk2_category                  = "HSK 2";
this. import_hsk3_category                  = "HSK 3";
this. import_hsk4_category                  = "HSK 4";
this. import_hsk5_category                  = "HSK 5";
this. import_hsk6_category                  = "HSK 6";
this. import_hsk1_sentences_category        = "HSK 1 句子";
this. import_hsk2_sentences_category        = "HSK 2 句子";
this. import_hsk3_sentences_category        = "HSK 3 句子";
this. import_chineasy_category              = "Chineasy";
this. import_hsk1_location                  = "lists/HSK 2012 L1 nl.txt";
this. import_hsk2_location                  = "lists/HSK 2012 L2.txt";
this. import_hsk3_location                  = "lists/HSK 2012 L3.txt";
this. import_hsk4_location                  = "lists/HSK 2012 L4.txt";
this. import_hsk5_location                  = "lists/HSK 2012 L5.txt";
this. import_hsk6_location                  = "lists/HSK 2012 L6.txt";
this. import_hsk1_sentences_location        = "lists/HSK 2012 Examples L1 nl.txt";
this. import_hsk2_sentences_location        = "lists/HSK 2012 Examples L2 nl.txt";
this. import_hsk3_sentences_location        = "lists/HSK 2012 Examples L3 nl.txt";
this. import_chineasy_location              = "lists/Chineasy nl.txt";
} /* End of language definition */
