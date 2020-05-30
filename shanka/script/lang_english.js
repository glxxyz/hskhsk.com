/*
    Shanka HSK Flashcards - lang_english.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:
        Email:
        Date:
    
*/

/* Start of language definition */
lang_english = function() { 

/* These strings describe the language of this file */
this. this_language                     = "English";
this. this_switch_language              = "Switch Language to English";

/* These strings describe all currently supported languages */
this. lang_interface_language           = "Switch Language";
this. lang_english_language             = "English";
this. lang_spanish_language             = "Spanish";
this. lang_french_language              = "French";
this. lang_italian_language             = "Italian";

/* Strings to do with the running of the app*/
this. app_cancel_silences_error         = "('Cancel' silences future errors)";
this. app_exception_error               = "Exception";
this. app_generic_error                 = "Error";
this. app_initialising_message          = "<br /><i>Your web browser supports HTML5.<br /><br />Loading...</i><br /><br /><br /><br />";
this. app_new_version_download_confirm  = "A new version of Shanka has been downloaded. Reload the app now?";
this. app_no_html5_message              = "<h3>Your web browser doesn't support HTML5. Please use a modern web browser (Safari or Chrome) to run this app.</h3><br /><br /><br />";
this. app_nojavascript_error            = "Your web browser does not have JavaScript enabled. Please enable JavaScript or use a different browser.";
this. app_offline_status                = "OFFLINE";
this. app_please_wait_a_moment          = "Please wait a moment...";
this. app_support_see_message           = "For support see <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
this. app_was_reloaded_message          = "App was reloaded!";

/* Generic re-usable strings for buttons etc. */
this. gen_add_text                      = "Add";
this. gen_all_text                      = "All";
this. gen_cancel_text                   = "Cancel";
this. gen_delete_text                   = "Delete";
this. gen_duplicate_text                = "Duplicate";
this. gen_edit_all_text                 = "Edit All";
this. gen_remove_text                   = "Remove";
this. gen_save_text                     = "Save";

/* Main page strings */
this. main_beginners_quickstart_label   = "Beginners' Quick Start";
this. main_browser_no_html5_error       = "Your web browser doesn't support HTML5. Please use a modern web browser (Safari or Chrome) to run this app."
this. main_cards_learned_label          = "learned";
// this. main_cards_queued_label           = "queued";
this. main_cards_total_label            = "total";
this. main_choose_option_begin_label    = "Choose an option below to begin studying Chinese!";
this. main_menu_help_label              = "Menu <b>&#8801;</b> and Help <b>?</b> are in the top corners.";
this. main_setup_wizard_label           = "Setup Wizard";

/* Titles of all pages */
this. page_about_title                      = "About";
this. page_add_algorithm_title              = "Add Algorithm";
this. page_add_category_title               = "Add Category";
this. page_add_flashcard_title              = "Add Flashcard";
this. page_add_lesson_title                 = "Add Lesson";
this. page_add_question_title               = "Add Question";
this. page_algo_shanka_title                = "Shanka Algorithm";
this. page_algorithms_title                 = "Algorithms";
this. page_card_info_title                  = "Card Info";
this. page_cards_title                      = "Flashcards";
this. page_categories_title                 = "Categories";
this. page_category_title                   = "Category";
this. page_edit_algorithm_title             = "Edit Algorithm";
this. page_edit_algorithms_title            = "Edit Algorithms";
this. page_edit_categories_title            = "Edit Categories";
this. page_edit_category_name_title         = "Edit Category";
this. page_edit_flashcard_title             = "Edit Flashcard";
this. page_edit_lesson_title                = "Edit Lesson";
this. page_edit_lessons_title               = "Edit Lessons";
this. page_edit_question_title              = "Edit Question";
this. page_edit_questions_title             = "Edit Questions";
this. page_export_title                     = "Export";
this. page_help_contents_title              = "Help Contents";
this. page_help_prefix_title                = "Help";
this. page_history_title                    = "History";
this. page_import_title                     = "Import";
this. page_initialising_title               = "Initialising";
this. page_lessons_title                    = "Lessons";
this. page_main_app_title                   = "Shanka 闪卡";
this. page_main_title                       = "Main Page";
this. page_maintenance_title                = "Maintenance";
this. page_pleco_import_title               = "Pleco Import";
this. page_practice_title                   = "Practice";
this. page_progress_title                   = "Progress";
this. page_progress_title                   = "Progress";
this. page_question_title                   = "Question";
this. page_questions_title                  = "Questions";
this. page_queue_title                      = "Queue";
this. page_settings_title                   = "Settings";
this. page_skritter_import_title            = "Skritter Import";
this. page_sticky_import_title              = "StickyStudy Import";
this. page_study_title                      = "Study";
this. page_wizard1_title                    = "Wizard 1/4";
this. page_wizard2_title                    = "Wizard 2/4";
this. page_wizard3_title                    = "Wizard 3/4";
this. page_wizard4_title                    = "Wizard 4/4";
this. page_wizard_title                     = "Wizard";

/* Study page */
this. study_edit_text                       = "Edit";
this. study_field_question_name_calligraphy = "Calligraphy";
this. study_field_question_name_cursive     = "Cursive";
this. study_field_question_name_definition  = "Definition";
this. study_field_question_name_notes       = "Notes";
this. study_field_question_name_pinyin      = "Pinyin";
this. study_field_question_name_simplified  = "Simplified";
this. study_field_question_name_traditional = "Traditional";
this. study_field_question_text_calligraphy = "Calligraphy";
this. study_field_question_text_cursive     = "Cursive";
this. study_field_question_text_definition  = "Definition";
this. study_field_question_text_input_draw  = "Draw";
this. study_field_question_text_input_type  = "Type";
this. study_field_question_text_notes       = "Notes";
this. study_field_question_text_pinyin      = "Pinyin";
this. study_field_question_text_simplified  = "Hanzi";
this. study_field_question_text_traditional = "Hanzi";
this. study_invalid_card_id_error           = "Invalid card id: ";
this. study_invalid_question_id_error       = "Invalid question id: ";
this. study_no_cards_questions_use_wizard_error = "There are no cards or questions to study, please use the Quick Start, Wizard, or Import!";
this. study_practice_short_text             = "Prac.";
this. study_practice_text                   = "Practice";
this. study_search_no_results               = "No Results";
this. study_search_result_label             = "Results";
this. study_sentence_label                  = "Sentence";
this. study_show_answer_label               = "Show Answer";
this. study_study_text                      = "Study";

/* Wizard pages */
this. wizard_added_lesson_message       = "Added lesson.";
this. wizard_added_question_message     = "Added question.";
this. wizard_algorithm_name_advanced    = "Advanced";
this. wizard_algorithm_name_beginner    = "Beginner";
this. wizard_algorithm_name_intermediate = "Intermediate";
this. wizard_algorithm_name_random      = "Random";
this. wizard_algorithm_name_randomreview = "Random Review";
this. wizard_algorithm_name_review      = "Review";
this. wizard_both_characters_label      = "Both";
this. wizard_calligraphy_label          = "Calligraphy";
this. wizard_created_algorithm_message  = "Created algorithm.";
this. wizard_created_flashcards_format  = "Created {0} flashcards.";
this. wizard_created_lesson_name        = "Wizard Created";
this. wizard_cursive_label              = "Cursive";
this. wizard_definition_label           = "Definition";
this. wizard_done_label                 = "Done!";
this. wizard_found_lesson_message       = "Found lesson.";
this. wizard_found_question_message     = "Found question.";
this. wizard_merged_flashcards_format   = "Merged {0} flashcards.";
this. wizard_next_label                 = "Next";
this. wizard_pinyin_label               = "Pinyin";
this. wizard_reading_label              = "Reading Hanzi";
this. wizard_select_one_vocab_error     = "Please select at least one vocabulary list!";
this. wizard_select_something_learn_error = "Please select something to learn!";
this. wizard_sentences_label            = "Sentences";
this. wizard_simplified_characters_label = "Simplified";
this. wizard_traditional_characters_label = "Traditional";
this. wizard_what_is_level_label        = "What is your level for this vocabulary?";
this. wizard_what_want_learn_label      = "What do you want to learn?";
this. wizard_which_characters_label     = "Which characters do you want to learn?";
this. wizard_which_vocab_label          = "Which vocabulary list(s) do you want to study?";
this. wizard_writing_label              = "Writing Hanzi";

/* Flashcard viewing and editing */
this. card_add_text                     = "Add Card";
this. card_delete_selected_confirm      = "Delete selected flashcards?";
this. card_deleted_format               = "Deleted {0} flashcards.";
this. card_duplicate_selected_confirm   = "Duplicate selected flashcards?";
this. card_duplicated_format            = "Duplicated {0} flashcards.";
this. card_enabled_label                = "Enabled";
this. card_historical_bronze_label      = "Bronze";
this. card_historical_forms_label       = "Historical Forms";
this. card_historical_greatseal_label   = "Great Seal";
this. card_historical_oracle_label      = "Oracle";
this. card_historical_smallseal_label   = "Small Seal";
this. card_if_queued_must_be_enabled_error = "If a flashcard is queued, it must also be enabled!";
this. card_must_have_at_least_simp_trad_error = "You must have at least one of simplified or traditional characters!";
this. card_must_have_definition_error   = "You must have a definition!";
this. card_queued_label                 = "Queued";
this. card_related_flashcards_label     = "Related Flashcards";
this. card_remove_selected_confirm      = "Remove selected flashcards from this category?";
this. card_removed_format               = "Removed {0} flashcards.";
this. card_saved_message                = "Card Saved.";
this. card_stroke_order_label           = "Stroke Order";

/* Category list and edit name page */
this. category_all_name                 = "All";
this. category_uncategorised_name       = "Uncategorised";
this. category_delete_selected_confirm  = "Delete selected categories?";
this. category_deleted_format           = "Deleted {0} categories";
this. category_duplicate_sel_confirm    = "Duplicate selected categories?";
this. category_duplicated_format        = "Duplicated {0} categories";
this. category_edit_name                = "Edit Name";
this. category_must_enter_name_error    = "You must enter a category name!";
this. category_name_exists_error        = "That category name already exists!";
this. category_name_label               = "Category Name";
this. category_new_name                 = "New Category";
this. category_saved_format             = "Category '{0}' saved";

/* Settings page */
this. settings_auto_advance_label       = "Auto Advance";
this. settings_auto_queue_label         = "Auto Queue New Flashcards";
this. settings_background_colour_label  = "Background Colour";
this. settings_background_guides_label  = "Background Guides";
this. settings_border_colour_label      = "Border Colour";
this. settings_brush_colour_label       = "Brush Colour";
this. settings_brush_width_label        = "Brush Width";
this. settings_each_enabled_rating_must_have_val_error = "Each of the enabled rating buttons must have a value";
this. settings_enable_tone_colours_label = "Enable Tone Colours";
this. settings_general_label            = "General Settings";
this. settings_grid_colour_label        = "Grid Colour";
this. settings_guide_star_label         = "米 Star";
this. settings_guide_grid_label         = "井 Grid";
this. settings_guide_cross_label        = "十 Cross";
this. settings_guide_bar_label          = "丨 Bar";
this. settings_guide_none_label         = "No Guides";
this. settings_hanzi_input_label        = "Hanzi Drawing Input";
this. settings_must_enable_two_buttons_error = "You must enable at least two of the rating buttons";
this. settings_preferred_script_label   = "Preferred Script";
this. settings_rating_enabled_label     = "Enabled";
this. settings_ratings_label            = "Ratings";
this. settings_response_1_default       = "No Idea";
this. settings_response_2_default       = "Wrong";
this. settings_response_3_default       = "So-So";
this. settings_response_4_default       = "Right";
this. settings_response_5_default       = "Easy";
this. settings_saved_message            = "Settings saved.";
this. settings_simp_trad_label          = "Simplified [Traditional]";
this. settings_simplified_label         = "Simplified Only";
this. settings_tone_1_label             = "Tone 1";
this. settings_tone_2_label             = "Tone 2";
this. settings_tone_3_label             = "Tone 3";
this. settings_tone_4_label             = "Tone 4";
this. settings_tone_5_label             = "Tone 5";
this. settings_tone_colours_label       = "Pinyin Tone Colours";
this. settings_tone_marks_label         = "Pinyin Tone Marks";
this. settings_trad_simp_label          = "Traditional [Simplified]";
this. settings_traditional_label        = "Traditional Only";

/* Maintenance page */
this. maintenance_app_cache_label       = "App Cache";
this. maintenance_erase_label           = "Erase";
this. maintenance_erase_local_label     = "Erase local data";
this. maintenance_installed_label       = "Installed";
this. maintenance_latest_label          = "Latest";
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
this. import_algorithms_label               = "Algorithms";
this. import_chineasy_label                 = "Chineasy";
this. import_default_category_label         = "Default Category";
this. import_downloading_file_message       = "Downloading import file, please wait...";
this. import_flashcards_label               = "Flashcards";
this. import_generic_error                  = "Import error";
this. import_hsk1_label                     = "HSK 1 Words";
this. import_hsk2_label                     = "HSK 2 Words";
this. import_hsk3_label                     = "HSK 3 Words";
this. import_hsk4_label                     = "HSK 4 Words";
this. import_hsk5_label                     = "HSK 5 Words";
this. import_hsk6_label                     = "HSK 6 Words";
this. import_lessons_label                  = "Lessons";
this. import_parsing_data_message           = "Parsing import data...";
this. import_paste_text_label               = "Paste text or a link (http://...) here";
this. import_pleco_text_file_label          = "Pleco Text File";
this. import_pleco_xml_file_label           = "Pleco XML File";
this. import_progress_label                 = "Progress";
this. import_section_other                  = "Other";
this. import_section_quick                  = "Quick";
this. import_section_shanka                 = "Shanka";
this. import_settings_label                 = "Settings";
this. import_skritter_simp_label            = "Skritter (Simplified)";
this. import_skritter_trad_label            = "Skritter (Traditional)";
this. import_stickystudy_label              = "StickyStudy";
this. import_timed_out_error                = "Import timed out!";

/* Export page */
this. export_beginning_message              = "Beginning Export...";
this. export_categories_label               = "Categories to Export";
this. export_do_export_label                = "Export";
this. export_download_filename              = "ShankaExport.txt";
this. export_download_filetext              = "Download File";
this. export_export_format_label            = "Export Format";
this. export_other_label                    = "Other";
this. export_success_message                = "Exported all data!";

/* Question list and page */
this. question_answer_label             = "Answer";
this. question_auto_generate_label      = "Auto-generate";
this. question_calligraphy_label        = "Calligraphy";
this. question_components_label         = "Question Components";
this. question_cursive_label            = "Cursive";
this. question_definition_label         = "Definition";
this. question_delete_selected_confirm  = "Delete selected questions?";
this. question_deleted_format           = "Deleted {0} questions";
this. question_display_label            = "Display";
this. question_duplicate_sel_confirm    = "Duplicate selected questions?";
this. question_duplicated_format        = "Duplicated {0} questions";
this. question_hanzi_touch_label        = "Hanzi Touchpad";
this. question_inputs_label             = "Inputs";
this. question_name_label               = "Question Name";
this. question_name_text_error          = "Your question must have a name and some question text!";
this. question_new_name                 = "New Question";
this. question_notes_label              = "Notes";
this. question_pinyin_label             = "Pinyin";
this. question_saved_format             = "Question '{0}' saved";
this. question_simplified_label         = "Simplified Hanzi";
this. question_stem_answer_error        = "Your question must have at least one stem and one answer!";
this. question_stem_label               = "Stem";
this. question_text_edit_label          = "Text Edit Field";
this. question_text_label               = "Question Text";
this. question_traditional_label        = "Traditional Hanzi";
this. question_whats_the_format         = "What's the {0}?";

/* Lesson list and page */
this. lesson_delete_selected_confirm    = "Delete selected lessons?";
this. lesson_deleted_format             = "Deleted {0} lessons";
this. lesson_duplicate_selected_confirm = "Duplicate selected lessons?";
this. lesson_duplicated_format          = "Duplicated {0} lessons";
this. lesson_must_include_1_cat_error   = "You must include at least one category!";
this. lesson_must_include_1_quest_error = "You must include at least one question!";
this. lesson_name_already_exist_error   = "That lesson name already exists!";
this. lesson_name_cant_be_empty_error   = "Lesson name cannot be empty!";
this. lesson_name_label                 = "Lesson Name";
this. lesson_new_name                   = "New Lesson";
this. lesson_review_mode_name           = "(Review)";
this. lesson_reviewing_label            = "Reviewing";
this. lesson_saved_format               = "Lesson '{0}' saved";

/* Algorithm list and page */
this. algorithm_adjustment_speed_positive_error         = "Adjustment Speed must be positive!"
this. algorithm_any_element_probability_0_1_error       = "Any Element Probability must be between 0 and 1!";
this. algorithm_cannot_delete_last_error                = "Cannot delete the last algorithm";
this. algorithm_daily_correct_target_positive_int_error = "Daily Correct Target must be a positive integer!";
this. algorithm_daily_minutes_target_positive_int_error = "Daily Minutes Target must be a positive integer!";
this. algorithm_daily_new_target_positive_int_error     = "Daily New Target must be a positive integer!";
this. algorithm_default_knowledge_rate_0_1_error        = "Default Knowledge Rate must be between 0 and 1!";
this. algorithm_delete_selected_confirm                 = "Delete selected algorithms?";
this. algorithm_duplicate_selected_confirm              = "Duplicate selected algorithms?";
this. algorithm_first_element_probability_0_1_error     = "First Element Probability must be between 0 and 1!";
this. algorithm_minimum_interval_postive_0_error        = "Minimum Interval must be positive or zero!";
this. algorithm_minimum_unknown_card_positive_int_error = "Minimum Unknown Cards must be a positive integer!";
this. algorithm_name_cant_be_empty_error                = "Algorithm name cannot be empty!";
this. algorithm_threshold_knowledge_rate_0_1_error      = "Threshold Knowledge Rate must be between 0 and 1!";
this. algorithm_adjustment_speed        = "Adjustment Speed";
this. algorithm_any_element_probability = "Any Element Probability";
this. algorithm_choose_label            = "Choose an Algorithm";
this. algorithm_current_label           = "Current";
this. algorithm_daily_correct_target    = "Daily Correct Target";
this. algorithm_daily_minutes_target    = "Daily Minutes Target";
this. algorithm_daily_new_target        = "Daily New Target";
this. algorithm_default_knowledge_rate  = "Default Knowledge Rate";
this. algorithm_deleted_format          = "Deleted {0} algorithms";
this. algorithm_duplicated_format       = "Duplicated {0} algorithms";
this. algorithm_first_element_prob      = "First Element Probability";
this. algorithm_history_today           = "today";
this. algorithm_history_yesterday       = "yesterday";
this. algorithm_knowledge_rate_display  = "Knowledge Rate";
this. algorithm_knowledge_rate_trouble  = "having trouble";
this. algorithm_knowledge_rate_learned  = "learned";
this. algorithm_knowledge_rate_learning = "learning";
this. algorithm_minimum_interval        = "Minimum Interval";
this. algorithm_minimum_unknown_cards   = "Minimum Unknown Cards";
this. algorithm_name_label              = "Name";
this. algorithm_new_name                = "New Algorithm";
this. algorithm_parameters              = "Parameters";
this. algorithm_saved_format            = "Algorithm '{0}' saved";
this. algorithm_study_settings          = "Study Settings";
this. algorithm_threshold_kn_rate       = "Threshold Knowledge Rate";

/* Local storage rebuild and load */
this. local_storage_cannot_save_ios     = "Unable to save to local storage. Either your local storage quote has been exceeded, or you are in Private Browsing mode.";
this. local_storage_cannot_save_other   = "Unable to save to local storage, your local storage quota has been exceeded.";
this. local_storage_erase_confirm       = "Erase local storage data?";
this. local_storage_erased_message      = "Local storage data was nuked!";
this. local_storage_rebuild_confirm     = "Rebuild local storage?";
this. local_storage_rebuilt_ok_message  = "Local storage was rebuilt- no errors were found!";
this. local_storage_errors_detected_resolved_error =
    "Local storage data errors were detected and resolved.\n\n" +
    "You may have missing or disconnected lessons, questions, categories, or cards.\n\n" +
    "More detailed information is available in the JavaScript console.";

/* Help pages */
this. help_contents_label = "Help Contents";

this. help_main_page =
    "<h3>Before you Begin</h3>" +
        "<p>You should first add the main page (welcome page) of this app to the homescreen of your device.</p>" +
        "<p>This will let you use the app when you are offline, and will also give put the app full-screen giving you more room to study.</p>" +
        "<p>On iOS this means clicking the icon in the middle of the bottom of the screen, that looks like a box with an arrow pointing up, and selecting 'Add to Home Screen'.</p>" +
        "<p>Similar functionality is available on all modern web browsers on Windows, Android, Mac OS, Windows Mobile, and Blackberry.</p>";

this. help_lessons =
    "<h3>Selected Lessons</h3>" +
        "<p>When you study, only questions and categories from lessons that are checked will be used.</p>";

this. help_card_info =
    "<h3>Categories</h3>" +
        "<p>Lists the categories, if any, that the current card is assigned to.</p>" +
    "<h3>Related Flashcards</h3>" +
        "<p>Shows all flashchards that share characters in common with the current flashcard.</p>" +
    "<h3>Stroke Order</h3>" +
        "<p>Some (but not all) characters have stroke order diagrams provided by the Wikimedia Foundation.</p>" +
    "<h3>Historical Forms</h3>" +
        "<p>The Wikimedia Foundation has collected together representative historical forms for many characters. " +
        "These can help to understand the shape of some pictographs.</p>";

this. help_practice =
    "<h3>Just Relax!</h3>" +
        "<p>The practice page allows you sit back and practice whichever characters you like.</p>" +
        "<p>Enter the characters that you want to study in the text box.</p>" +
        "<p>All other character drawing functionality from the Study page is available.</p>" +
    "<h3>Search</h3>" +
        "<p>You can search through the hanzi and pinyin of all Flashcards by clicking the magnifying glass icon. " +
        "The search will look for the characters in the text box, and will display a results list or go to the card if there is only one result.</p>";

this. help_study =
    "<p>This is the page of the app where you will spend most of your time, testing yourself on flashcards.</p>" +
    "<h3>Stem</h3>" +
        "<p>The Stem of the question is the information that you are given.</p>" +
    "<h3>Answer</h3>" +
        "<p>The Answer is the information that you supply. Type or draw the answer as appropriate, and then click 'show answer' to see if you were correct.</p>" +
    "<h3>Hanzi Input</h3>" +
        "<p>If a hanzi input control is displayed for the current question, you can draw as many characters as you want of the answer, and repeat each multiple times " +
        "for practice if you prefer. Clicking the 下 button moves you to the next mini grid, or adds a new one if you are currently viewing the last mini grid. You can also " +
        "click on the grids to select them. Other controls allow you to choose the colour of the pen, show/hide an overlaay of the current character, undo/redo your drawing, " +
        "and clear the current grid.</p>" +
    "<h3>Display</h3>" +
        "<p>Some extra information such as notes that you are not graded on can also be displayed alongside the answer.</p>" +
    "<h3>Grading</h3>" +
        "<p>Grade yourself on each part of the answer, to determine when you will next be tested on the current flashcard. " +
        "You can grade multiple items at once by swiping or dragging between them.</p>";

this. help_categories =
    "<p>Categories are sometimes called word lists in other systems. They help you to organise your flashcards, and to tell the app which flashcards you want to study.</p>" +
    "<p>A card can exist in multiple categories, or none at all in which case it is 'uncategorised'.</p>";

this. help_progress =
    "<p>The progress page shows you how many words were counted as known, how long you studied, and how many flashcards you studied, " +
    "on each day that you used the app.</p>";

this. help_history =
    "<p>The history page shows all of the flashcards that you have studied, in the order that you studied them. " +
    "Each flashcard will only appear in the list once.</p>";

this. help_import =
    "<p>With this page you can import data from the built in word lists, or from another flashcard system.</p>";

this. help_export = "export help" +
    "<p>Exporting allows you to backup your data, You can also move it to Shanka running on another device, or to another flashcard system.</p>" +
    "<h3>Export Result</h3>" +
        "<p>Copy the text in the textedit and paste into another app. " +
        "Alternatively, click the \"Download file\" button.</p>";

this. help_settings =
    "<p>The settings screen allows you to tweak many of the internals of the app.</p>" +
    "<h3>General Settings</h3>" +
        "<p>If auto advance is switched on, the next flashcard will be shown as soon as you have graded a flashcard when studying.</p>" +
    "<h3>Hanzi drawing input</h3>" +
        "<p>These settings control the look of the hanzi drawing control in study and practice modes.</p>" +
    "<h3>Background Guides</h3>" +
        "<p>The shape of the hanzi drawing background guides grid can be configured here.</p>" +
    "<h3>Pinyin Tone Colours</h3>" +
        "<p>If enabled, this will control the colours displayed for each syllable of toned pinyin.</p>" +
    "<h3>Preferred Script</h3>" +
        "<p>You can decide whether you prefer to see Simplified Hanzi, Traditional, or a combination of the two.</p>" +
    "<h3>Ratings</h3>" +
        "<p>Choose the names that you want to see for the ratings in the study page, and disable any that you don't want to use by unselecting them.</p>";

this. help_queue =
    "<p>The queue shows you all of the words that you are currently studying, and lets you know how well you know them all. "
    "The words are in the approximate order that they will be studied, although the order is randomised so that it doesn't become predictable.</p>";

this. help_algorithms =         
    "<h3>Shanka Algorithm</h3>" +
        "<p>This algorithm controls the order that flashcards are displayed to you, and how many new flashcards are added when you have learned earlier ones.</p>" +
    "<h3>Study Settings</h3>" +
        "<p><li><b>Minimum Unknown Cards</b> - When the number of unknown cards falls below this level, new cards will be added to the queue.</p>" +
        "<p><li><b>Daily Correct Target</b> - Target minimum number of questions to answer correct each day.</p>" +
        "<p><li><b>Daily New Target</b> - Target minimum number of new flashcards to add each day.</p>" +
        "<p><li><b>Daily Minutes Target</b> - Target minimum time to spend studying each day, in minutes.</p>" +
    "<h3>Parameters</h3>" +
        "<p><li><b>Default Knowledge Rate</b> - Knowledge rate <i><b>kn_rate</b></i> is how well you know each piece of information in a flashcard. Zero is not at all, one is perfect knowledge.</p>" +
        "<p><li><b>Threshold Knowledge Rate</b> - The knowledge rate at which the information on a card will be counted as being 'known'.</p>" +
        "<p><li><b>Adjustment Speed</b> - How quickly the knowledge rate for each piece of information on a flashcard will move towards zero/one when you answer questions wrong/right. " +
            "If this adjustment speed is <i><b>a</b></i>, then when a question is answered incorrectly, <i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " +
            "When a question is answered correctly, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. If the five answer choices are numbered 1-5, then "
            "answer 3 will not change the knowledge rate, answers 2 and 4 are wrong and right, and answers 1 and 5 count as two wrong or right answers respectively.</p>" +
        "<p><li><b>Any Element Probability</b> - The probability that the next flashcard will be randomly drawn from anywhere in the queue, instead of the front of the queue. "
            "This setting allows even very old cards to be occasionally sprinkled into the studying. If you don't want this to happen, set the value to zero.</p>" +
        "<p><li><b>First Element Probability</b> - If this probability is <i><b>p</b></i>, and the first flashcard in the queue is number <i><b>0</b></i>, then flashcard "
            "<i><b>n</b></i> will be chosen as the card to study with probability <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + 
            "As the sum for all flashcards in the queue will be slightly less than 1, the leftover probability is assigned to the first element.</p>" +
        "<p><li><b>Minimum Interval</b> - The minimum number of cards that must be shown before a card is repeated, even if it is always marked as unknown.</p>";

this. help_questions =     
    "<h3>Question Name</h3> " +
        "<p>Just used to identify the question in the question lists.</p> " +
    "<h3>Question Text</h3> " +
        "<p>The question that appears at the top of the card above the question stem, e.g. \"What is the pinyin for this character?\"</p> " +
        "<p>Leave the auto-generate checkbox clicked if you want to have the app create this text based on the selected inputs, stem and answer.</p> " +
    "<h3>Inputs</h3> " +
        "<p>These inputs are displayed alongside the question stem. If you type " +
        "Chinese into the edit box, you can use either your device's pinyin " +
        "IME or handwriting input.</p> " +
    "<h3>Stem</h3> " +
        "<p>The 'front' of the card, for this question.</p> " +
    "<h3>Answer</h3> " +
        "<p>The part of the 'back' of the card that you are graded on.</p> " +
    "<h3>Display</h3> " +
        "<p>Other information on the 'back' of the card, that is displayed alongside the answer.</p>";

this. help_maintenance = 
    "<h3>Reload</h3>" +
        "<p>Reloading will restart the app, using the information in the local storage. " +
        " This might help sometimes if you run into problems, or if you accidently run multiple instances of the app.</p>" +
    "<h3>Standalone</h3>" +
        "<p>This data is used to help diagnose problems with the app. It should be true if you are running the app in " +
        "'homescreen' or 'standalone' mode, and false if you are within a web browser.</p>" +
    "<h3>System Language</h3>" +
        "<p>This is the language code reported by your system.</p>" +
    "<h3>App Cache</h3>" +
        "<p>This web app always stores data about cards etc. in local storage. The app cache is seperate from this, and " +
        "downloads the actual application pages so that you can access them while offline. If the app cache status is " +
        "UNCACHED then you may not be able to access the app while offline. To ensure offline use you should look for " +
        "an app cache status of CACHED.</p>" +
    "<h3>Update Web App</h3>" +
        "<p>To install the latest version of this app, click 'Update Web App' if you notice that the latest version is " +
        "different from the current installed version. You shouldn't need to use this functionality if you download an " +
        "update when prompted on startup</p>" +
    "<h3>Local Storage</h3>" +
        "<p>See <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " +
        "to calculate your local storage limit, which is usually at least 2.5M chars depending on your browser. " +
        "Note: 1k=2<sup>10</sup>=1024 characters, 1M=2<sup>20</sup> characters. Usually 1 character = 2 bytes, so " +
        "2.5M characters = 5MB of storage space.</p>" +
    "<h3>Erase Local Data</h3>" +
        "<p>If you are having problems you could try clearing your local storage data. If you want to keep your current "
        "history, you should first export a backup of your data.</p>";

this. help_wizard =
    "<p>Use this wizard to simplify the creation of lessons.</p>" +
    "<p>You can use the wizard more than once to create multiple lessons, and then choose which to study from the lessons screen.</p>";

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
        "<li>Code was edited using <a href='http://notepad-plus-plus.org/'>Notepad++</a><br />" + 
        "<li>iPhone taps are more responsive thanks to <a href='https://github.com/ftlabs/fastclick'>FastClick</a><br />" +
        "<li>Standalone web app scrolling problems are fixed by <a href='https://github.com/jakiestfu/AppScroll.js/'>AppScroll</a><br />" +
        "<li><a href='http://commons.wikimedia.org/wiki/Commons:Stroke_Order_Project'>Stroke order animations</a> and " + 
            "<a href='http://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project'>Ancient Chinese Characters</a> " +
            "are provided by the <a href='http://commons.wikimedia.org/'>Wikimedia Foundation</a><br />" +
        "<li>Many problems were solved with the help of the comments and solutions on <a href='http://stackoverflow.com/'>Stack Overflow</a><br />"+
    "<h3>Thanks</h3>" +
        "<li>Many thanks to the Chinese Forums, Pleco, and Skritter user communities, and the many beta testers who have found bugs and suggested improvements.<br />" +
        "<li>Thank you also to the translators who are working on internationalising this app!";
        
// Added 21st Jan 2014
this. progress_studied_label = "studied";
this. progress_today_label   = "Today";
this. progress_alltime_label = "All Time";
this. progress_seconds       = "seconds";
this. progress_minutes       = "minutes";
this. progress_hours         = "hours";
this. progress_days          = "days";
this. progress_weeks         = "weeks";
this. progress_years         = "years";
this. progress_list_format   = "Studied {0}, learned {1} cards in {2} (total: {3}, {4} in {5})";
        
} /* End of language definition */
