/*
    Shanka HSK Flashcards - lang_spanish.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:Nicolás Godoy
        Email:nicolasgastongodoy@gmail.com
        Date:27/01/2014
    
*/

/* Start of language definition */
var lang_spanish = function() { 

/* These strings describe the language of this file */
this. this_language                     = "Español";
this. this_switch_language              = "Cambia el idioma a español";

/* These strings describe all currently supported languages */
this. lang_interface_language           = "Cambiar idioma";
this. lang_english_language             = "Inglés";
this. lang_dutch_language               = "Holandés";
this. lang_spanish_language             = "Español";
this. lang_german_language              = "Alemán";
this. lang_french_language              = "Francés";
this. lang_italian_language             = "Italiano";

/* Strings to do with the running of the app*/
this. app_cancel_silences_error         = "('Cancelar' silencia  futuros errores)";
this. app_exception_error               = "Excepción";
this. app_generic_error                 = "Error";
this. app_initialising_message          = "<br /><i>Tu buscador soporta HTML5.<br /><br />Cargando...</i><br /><br /><br /><br />";
this. app_new_version_download_confirm  = "Una nueva versión de Shanka ha sido cargada.¿Regargar la applicación ahora?";
this. app_no_html5_message              = "<h3>Tu buscador no soporta HTML5. Por favor use un buscador moderno (Safari o Chrome) para ejecutar esta applicación.</h3><br /><br /><br />";
this. app_nojavascript_error            = "TU buscador no tiene a JavaScript habilitado. Por favor abilite JavaScript o usa un buscador diferente.";
this. app_offline_status                = "FUERA DE LINEA";
this. app_please_wait_a_moment          = "Por favor espere un momento...";
this. app_support_see_message           = "Por soporte vé a...<a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
this. app_was_reloaded_message          = "¡La applicación ha sido recargada con éxito!";

/* Generic re-usable strings for buttons etc. */
this. gen_add_text                      = "Agregar";
this. gen_all_text                      = "Todo";
this. gen_cancel_text                   = "Cancelar";
this. gen_delete_text                   = "Borrar";
this. gen_duplicate_text                = "Duplicar";
this. gen_edit_all_text                 = "Editar Todo";
this. gen_remove_text                   = "Remover";
this. gen_save_text                     = "Guardar";

/* Main page strings */
this. main_beginners_quickstart_label   = "'Principiantes' Comienzo Rápido";
this. main_browser_no_html5_error       = "Tú buscador no soporta HTML5. Por favor use un buscador moderno (Safari o Chrome) para ejecutar esta applicación."
this. main_choose_option_begin_label    = "¡Elija una opción para comenzar a aprender chino!";
this. main_menu_help_label              = "Los menús <b>&#8801;</b> y la ayuda <b>?</b> están arriba en las esquinas.";
this. main_setup_wizard_label           = "Actualización del Asistente de Ayuda";

/* Titles of all pages */
this. page_about_title                      = "Sobre";
this. page_add_algorithm_title              = "Adicionar Algorítmos";
this. page_add_category_title               = "Adicionar Categorías";
this. page_add_flashcard_title              = "Adicionar Flashcard";
this. page_add_lesson_title                 = "Adicionar Lección";
this. page_add_question_title               = "Agregar Pregunta";
this. page_algo_shanka_title                = "Algorítmo de Shanka";
this. page_algorithms_title                 = "Algoritmos";
this. page_card_info_title                  = "Información de Flashcards";
this. page_cards_title                      = "Flashcards";
this. page_categories_title                 = "Categorías";
this. page_category_title                   = "Categoría";
this. page_edit_algorithm_title             = "Editar Algoritmo";
this. page_edit_algorithms_title            = "Editar Algoritmo";
this. page_edit_categories_title            = "Editar Categoría";
this. page_edit_category_name_title         = "Editar Categoría";
this. page_edit_flashcard_title             = "Editar Flashcard";
this. page_edit_lesson_title                = "Editar Lección";
this. page_edit_lessons_title               = "Editar Lecciones";
this. page_edit_question_title              = "Editar Preguntas";
this. page_edit_questions_title             = "Editar Preguntas";
this. page_export_title                     = "Exportar";
this. page_help_contents_title              = "Contenido de Ayuda";
this. page_help_prefix_title                = "Ayuda";
this. page_history_title                    = "Historia";
this. page_import_title                     = "Importar";
this. page_initialising_title               = "Inicializando";
this. page_lessons_title                    = "Lecciones";
this. page_main_app_title                   = "Shanka 闪卡";
this. page_main_title                       = "Página Principal";
this. page_maintenance_title                = "Mantenimiento";
this. page_pleco_import_title               = "Importar Pleco ";
this. page_practice_title                   = "Práctica";
this. page_progress_title                   = "Progreso";
this. page_question_title                   = "Pregunta";
this. page_questions_title                  = "Preguntas";
this. page_queue_title                      = "Enlistadas";
this. page_settings_title                   = "Configuraciones";
this. page_skritter_import_title            = "Importe de Skritter";
this. page_sticky_import_title              = "Importe de StickyStudy";
this. page_study_title                      = "Estudiar";
this. page_wizard1_title                    = "Asistente de ayuda 1/4";
this. page_wizard2_title                    = "Asistente de ayuda 2/4";
this. page_wizard3_title                    = "Asistente de ayuda 3/4";
this. page_wizard4_title                    = "Asistente de ayuda 4/4";
this. page_wizard_title                     = "Asistente de ayuda";

/* Study page */
this. study_edit_text                       = "Editar";
this. study_field_question_name_calligraphy = "Caligrafía";
this. study_field_question_name_cursive     = "Cursiva";
this. study_field_question_name_definition  = "Definición";
this. study_field_question_name_notes       = "Notas";
this. study_field_question_name_pinyin      = "Pinyin";
this. study_field_question_name_simplified  = "Simplificado";
this. study_field_question_name_traditional = "Tradicional";
this. study_field_question_text_calligraphy = "Caligrafía";
this. study_field_question_text_cursive     = "Cursiva";
this. study_field_question_text_definition  = "Definicion";
this. study_field_question_text_input_draw  = "Dibujar";
this. study_field_question_text_input_type  = "Escribir";
this. study_field_question_text_notes       = "Notas";
this. study_field_question_text_pinyin      = "Pinyin";
this. study_field_question_text_simplified  = "Hanzi";
this. study_field_question_text_traditional = "Hanzi";
this. study_invalid_card_id_error           = "Dirección inválida de carta ";
this. study_invalid_question_id_error       = "ID de pregunta inválido: ";
this. study_no_cards_questions_use_wizard_error = "No hay preguntas o flashcards para estudiar ¡Por favor use el Comienzo Rápido,el Asistente o Importar!";
this. study_practice_short_text             = "Pract.";
this. study_practice_text                   = "Práctica";
this. study_search_no_results               = "Sin resultados";
this. study_search_result_label             = "Resultados";
this. study_sentence_label                  = "Oraciones";
this. study_show_answer_label               = "Mostrar Respuesta";
this. study_study_text                      = "Estudiar";

/* Wizard pages */
this. wizard_added_lesson_message       = "Lección agregada.";
this. wizard_added_question_message     = "Pregunta agregada.";
this. wizard_algorithm_name_advanced    = "Avanzado";
this. wizard_algorithm_name_beginner    = "Principiante";
this. wizard_algorithm_name_intermediate = "Intermediario";
this. wizard_algorithm_name_random      = "Aleatorio";
this. wizard_algorithm_name_randomreview = "Revisar aleatoreamente";
this. wizard_algorithm_name_review      = "Revisar";
this. wizard_both_characters_label      = "Ambas";
this. wizard_calligraphy_label          = "Caligrafía";
this. wizard_created_algorithm_message  = "Algoritmo creado";
this. wizard_created_flashcards_format  = "{0} flashcards creadas.";
this. wizard_created_lesson_name        = "Asistente Creado";
this. wizard_cursive_label              = "Cursiva"
this. wizard_definition_label           = "Definición";
this. wizard_done_label                 = "¡Hecho!";
this. wizard_found_lesson_message       = "Lección encontrada.";
this. wizard_found_question_message     = "Pregunta encontrada.";
this. wizard_merged_flashcards_format   = "{0} flashcards combinadas.";
this. wizard_next_label                 = "Próximo";
this. wizard_pinyin_label               = "Pinyin";
this. wizard_reading_label              = "Lectura Hanzi";
this. wizard_select_one_vocab_error     = "¡Por favor elige al menos una lista de vocabulario!";
this. wizard_select_something_learn_error = "¡Por favor elige algo para aprender!";
this. wizard_sentences_label            = "Oraciones";
this. wizard_simplified_characters_label = "Simplificado";
this. wizard_traditional_characters_label = "Tradicional";
this. wizard_what_is_level_label        = "¿Cuál es tu nivel para este vocabulario?";
this. wizard_what_want_learn_label      = "¿Qué quisieras aprender?";
this. wizard_which_characters_label     = "¿Qué carácteres quisieras aprender?";
this. wizard_which_vocab_label          = "¿Cuál lista o listas de vocabulario quisieras aprender?";
this. wizard_writing_label              = "Escritura Hanzi";

/* Flashcard viewing and editing */
this. card_add_text                     = "Agregar Carta";
this. card_delete_selected_confirm      = "¿Deseas borrar cartas selecionadas?";
this. card_deleted_format               = "{0} flashcards borradas.";
this. card_duplicate_selected_confirm   = "¿Deseas duplicar cartas selecionadas?";
this. card_duplicated_format            = "{0} flashcards duplicadas.";
this. card_enabled_label                = "Habilitado";
this. card_historical_bronze_label      = "Bronce";
this. card_historical_forms_label       = "Formas Históricas";
this. card_historical_greatseal_label   = "Gran Seal";
this. card_historical_oracle_label      = "Oráculo";
this. card_historical_smallseal_label   = "Pequeño Seal";
this. card_if_queued_must_be_enabled_error = "Si una carta está enlistada ¡también tiene que estar habilitada!";
this. card_must_have_at_least_simp_trad_error = "Debes tener al menos un carácter simplificado o tradicional!";
this. card_must_have_definition_error   = "¡Debes tener una definición!";
this. card_queued_label                 = "Enlistada";
this. card_related_flashcards_label     = "Flashcards Relacionadas";
this. card_remove_selected_confirm      = "¿Deseas remover las flashcards seleccionadas de esta categoría?";
this. card_removed_format               = "{0} flashcards borradas.";
this. card_saved_message                = "Carta Guardada.";
this. card_stroke_order_label           = "Orden de Trazos";

/* Category list and edit name page */
this. category_all_name                 = "Todos";
this. category_uncategorised_name       = "Descategorizado";
this. category_delete_selected_confirm  = "¿Deseas borrar las categorías selecionadas?";
this. category_deleted_format           = "{0} categorías borradas";
this. category_duplicate_sel_confirm    = "¿Deseas duplicar las categorías seleccionadas?";
this. category_duplicated_format        = "{0} categories duplicadas";
this. category_edit_name                = "Editar Nombre";
this. category_must_enter_name_error    = "¡Debes ingresar un nombre de categoría!";
this. category_name_exists_error        = "¡El nombre de esa categoría ya existe!";
this. category_name_label               = "Nombre de la Categoría";
this. category_new_name                 = "Nueva Categoría";
this. category_saved_format             = "{0} categorías guardadas";

/* Settings page */
this. settings_auto_advance_label       = "Auto Avance";
this. settings_auto_queue_label         = "Auto-enlistar Nuevas Flashcard";
this. settings_background_colour_label  = "Color de Fondo";
this. settings_background_guides_label  = "Guías de Fondo";
this. settings_border_colour_label      = "Color del Margen ";
this. settings_brush_colour_label       = "Color del Pincel";
this. settings_brush_width_label        = "Anchura del Pincel";
this. settings_each_enabled_rating_must_have_val_error = "Cada uno de los  botones de clasificación habilitados deben tener una valoración";
this. settings_enable_tone_colours_label = "Color de Tonos Habilitados";
this. settings_general_label            = "Configuraciones Generales";
this. settings_grid_colour_label        = "Paleta de Colores";
this. settings_guide_star_label         = "米 Estrella";
this. settings_guide_grid_label         = "井 Cuadrícula";
this. settings_guide_cross_label        = "十 Cruz";
this. settings_guide_bar_label          = "丨 Barra";
this. settings_guide_none_label         = "Sin Guías";
this. settings_hanzi_input_label        = "Entrada del Dibujo Hanzi";
this. settings_must_enable_two_buttons_error = "Debes  habilitar al menos dos de los botones de clasificación";
this. settings_preferred_script_label   = "Secuencia de Comando Preferido";
this. settings_rating_enabled_label     = "Habilitado";
this. settings_ratings_label            = "Calificaciones";
this. settings_response_1_default       = "No tengo idea";
this. settings_response_2_default       = "Incorrecto";
this. settings_response_3_default       = "Más o Menos";
this. settings_response_4_default       = "Correcto";
this. settings_response_5_default       = "Fácil";
this. settings_saved_message            = "Configuraciónes Guardadas.";
this. settings_simp_trad_label          = "Simplificado [Tradicional]";
this. settings_simplified_label         = "Solo Simplificado";
this. settings_tone_1_label             = "Tono 1";
this. settings_tone_2_label             = "Tono 2";
this. settings_tone_3_label             = "Tono 3";
this. settings_tone_4_label             = "Tono 4";
this. settings_tone_5_label             = "Tono 5";
this. settings_tone_colours_label       = "Colores de los tonos de Pinyin";
this. settings_tone_marks_label         = "Marcas de los tonos de Pinyin";
this. settings_trad_simp_label          = "Traditional [Simplificado]";
this. settings_traditional_label        = "Solo Tradicional";

/* Maintenance page */
this. maintenance_app_cache_label       = "Caché de la Aplicación";
this. maintenance_erase_label           = "Borrar";
this. maintenance_erase_local_label     = "Borrar datos locales";
this. maintenance_installed_label       = "Instalado";
// this. maintenance_latest_label          = "Último";
this. maintenance_rebuild_label         = "Reconstruido";
this. maintenance_rebuild_local_label   = "Reconstruir el Almacenamiento Local";
this. maintenance_refresh_label         = "Actualizar";
this. maintenance_reload_label          = "Recargar";
this. maintenance_reload_local_label    = "Recargar el Almacenamiento Local";
this. maintenance_stand_alone_label     = "Autónomo";
this. maintenance_storage_used_format   = " {0} Carácteres del Almacenamiento Local en uso";
this. maintenance_system_language_label = "Lenguajedel Sistema";
this. maintenance_update_label          = "Actualizar";

/* Import page */
this. import_algorithms_label               = "Algoritmos";
this. import_chineasy_label                 = "Chineasy";
this. import_default_category_label         = "Default Category";
this. import_downloading_file_message       = "Descargando el archivo importador, por favor aguarde...";
this. import_flashcards_label               = "Flashcards";
this. import_generic_error                  = "Import error";
this. import_lessons_label                  = "Lecciones";
this. import_parsing_data_message           = "Analizando datos de importación...";
this. import_paste_text_label               = "Pega el texto o link (http://...) aquí";
this. import_pleco_text_file_label          = "Archivo de texto Pleco";
this. import_pleco_xml_file_label           = "Archivo XML Pleco";
this. import_progress_label                 = "Progreso";
this. import_section_other                  = "Otro";
this. import_section_quick                  = "Rápido";
this. import_section_shanka                 = "Shanka";
this. import_settings_label                 = "Configuraciones";
this. import_skritter_simp_label            = "Skritter (Simplificado)";
this. import_skritter_trad_label            = "Skritter (Tradicional)";
this. import_stickystudy_label              = "StickyStudy";
this. import_timed_out_error                = "Importar tiempo agotado!";

/* Export page */
this. export_beginning_message              = "Comenzando Exportación...";
this. export_categories_label               = "Categorías para Exportar";
this. export_do_export_label                = "Exportar";
this. export_download_filename              = "ShankaExport.txt";
this. export_download_filetext              = "Descargar Archivo";
this. export_export_format_label            = "Formato de Exportación";
this. export_other_label                    = "Otro";
this. export_success_message                = "Toda la información exportada!";

/* Question list and page */
this. question_answer_label             = "Respuesta";
this. question_auto_generate_label      = "Autogenerar";
this. question_calligraphy_label        = "Caligrafía";
this. question_components_label         = "Componentes de las Preguntas";
this. question_cursive_label            = "Cursiva";
this. question_definition_label         = "Definición";
this. question_delete_selected_confirm  = "¿Desea borrar las preguntas seleccionadas?";
this. question_deleted_format           = "{0} preguntas borradas";
this. question_display_label            = "Display";
this. question_duplicate_sel_confirm    = "¿Duplicar preguntas seleccionadas?";
this. question_duplicated_format        = "{0}Preguntas duplicadas";
this. question_hanzi_touch_label        = "Touchpad Hanzi";
this. question_inputs_label             = "Entradas";
this. question_name_label               = "Nombre de la pregunta";
this. question_name_text_error          = "¡Tu pregunta debe tener un nombre y algo de texto!";
this. question_new_name                 = "Pregunta Nueva";
this. question_notes_label              = "Notas";
this. question_pinyin_label             = "Pinyin";
this. question_saved_format             = "'{0}' preguntas agregadas";
this. question_simplified_label         = "Hanzi Simplificado";
this. question_stem_answer_error        = "¡Tu pregunta debe tener al menos texto y una respuesta!";
this. question_stem_label               = "Tema";
this. question_text_edit_label          = "Campo de Edición de Texto";
this. question_text_label               = "Texto de la Pregunta";
this. question_traditional_label        = "Hanzi Tradicional";
this. question_whats_the_format         = "Qué es {0}?";
this. question_and_separator            = "y";

/* Lesson list and page */
this. lesson_delete_selected_confirm    = "¿Deseas borrar lecciones seleccionadas?";
this. lesson_deleted_format             = "{0} lecciones seleccionadas";
this. lesson_duplicate_selected_confirm = "¿Desea duplicar lecciones seleccionadas?";
this. lesson_duplicated_format          = "{0} lecciones duplicadas";
this. lesson_must_include_1_cat_error   = "¡Debes incluir al menos una categoría!";
this. lesson_must_include_1_quest_error = "¡Debes incluir al menos una pregunta!";
this. lesson_name_already_exist_error   = "¡El nombre de esa lección ya existe!";
this. lesson_name_cant_be_empty_error   = "¡El nombre de la lección está vacío!";
this. lesson_name_label                 = "Nombre de la Lección";
this. lesson_new_name                   = "Nueva Lección";
this. lesson_review_mode_name           = "(Reveer)";
this. lesson_reviewing_label            = "Reviendo";
this. lesson_saved_format               = "'{0}'lecciones guardadas";

/* Algorithm list and page */
this. algorithm_adjustment_speed_positive_error         = "¡La Velocidad del Ajuste debe ser positiva!"
this. algorithm_any_element_probability_0_1_error       = "¡Cualquier Elemento de Probabilidad debe estar entre 0 y 1!";
this. algorithm_cannot_delete_last_error                = "¿No puedes borrar el último algoritmo?";
this. algorithm_daily_correct_target_positive_int_error = "¡El Objetivo Diario Correcto debe ser un entero positivo!";
this. algorithm_daily_minutes_target_positive_int_error = "¡El Objetivo de Minutos Diarios debe ser un entero positivo!";
this. algorithm_daily_new_target_positive_int_error     = "¡El Nuevo Objetivo Diario debe ser un número positivo entero!";
this. algorithm_default_knowledge_rate_0_1_error        = "¡El Error de la Calificación de Conocimiento  debe estar entre 0 y 1!";
this. algorithm_delete_selected_confirm                 = "¿Deseas borrar los algoritmos seleccionados?";
this. algorithm_duplicate_selected_confirm              = "¿Duplicar algoritmos seleccionados?";
this. algorithm_first_element_probability_0_1_error     = "El primer elemento debe estar entre 0 y 1!";
this. algorithm_minimum_interval_postive_0_error        = "El intervalo mínimo debe ser positivo o cero!";
this. algorithm_minimum_unknown_card_positive_int_error = "El Mínimo de Cartas Desconocidas debe ser un entero positivo!";
this. algorithm_name_cant_be_empty_error                = "¡El Nombre del Argoritmo no puede estar vacío!";
this. algorithm_threshold_knowledge_rate_0_1_error      = "¡El rango en el cual una carta es considerada aprendida debe estar entre 0 y 1!";
this. algorithm_adjustment_speed        = "Ajuste de Velocidad";
this. algorithm_any_element_probability = "Ningún Elemento de Probabilidad";
this. algorithm_choose_label            = "Elige un algoritmo";
this. algorithm_current_label           = "En uso";
this. algorithm_daily_correct_target    = "Objetivo Diario Correcto";
this. algorithm_daily_minutes_target    = "Objetivo de Minutos Diaros";
this. algorithm_daily_new_target        = "Nuevo Objetivo Diario";
this. algorithm_default_knowledge_rate  = "Tasa de Incumplimiento del Conocimiento.";
this. algorithm_deleted_format          = "{0} algoritmos borrados";
this. algorithm_duplicated_format       = "{0} algoritmos duplicados";
this. algorithm_first_element_prob      = "Probabilidad del Primer Elemento";
this. algorithm_history_today           = "hoy";
this. algorithm_history_yesterday       = "ayer";
this. algorithm_knowledge_rate_display  = "Clasificación de Conocimiento";
this. algorithm_knowledge_rate_trouble  = "Con Problemas";
this. algorithm_knowledge_rate_learned  = "Aprendido";
this. algorithm_knowledge_rate_learning = "Aprendiendo";
this. algorithm_minimum_interval        = "Intervalo Mínimo";
this. algorithm_minimum_unknown_cards   = "Mínimo Cartas Desconocidad";
this. algorithm_name_label              = "Nombre";
this. algorithm_new_name                = "Algoritmo Nuevo";
this. algorithm_parameters              = "Parámetros";
this. algorithm_saved_format            = "'{0}' algoritmos guardados";
this. algorithm_study_settings          = "Configuración de Estudio";
this. algorithm_threshold_kn_rate       = "Rango de Flashcard aprendida";

/* Local storage rebuild and load */
this. local_storage_cannot_save_ios     = "Deshabilitado para guardar en el almacenamiento local. Quizá tu almacenamiento locar ha sido excedido, o estás navegando en Modo Privado.";
this. local_storage_cannot_save_other   = "Deshabilitado pata guargar en almacenamiento local, tu capacidad de almacenamiento ha sido excedida.";
this. local_storage_erase_confirm       = "Deseas borrar los datos de almacenamiento local?";
this. local_storage_erased_message      = "Los Datos de Almacenamiento Local fueron bombardeados!";
this. local_storage_rebuild_confirm     = "¿Deseas Reconstruir el Almacenamiento Local?";
this. local_storage_rebuilt_ok_message  = "¡El almacenamienot local ha sido reconstruido, ningún error ha sido encontrado!";
this. local_storage_errors_detected_resolved_error =
    "Errores del almacenamieto local de datos fueron detectados y resueltos.\n\n" +
    "Quizá has estado perdiendo o desconectando lecciones, preguntas, categorías o flashcards.\n\n" +
    "Información más detallada está disponible en la consola Java.";

/* Help pages */
this. help_contents_label = "Contenidos de Asistencia al Usuario";

this. help_main_page =
    "<h3>Antes de que Comiences</h3>" +
        "<p>Primero deberías agregar la página principal (página de bienvenida) de esta aplicación a la pantalla de inicio de tu dispositivo.</p>" +
        "<p>Eso te permitirá  usar la aplicación  cuando estés desconectado, y también te pondrá la pantalla completa para darte más espacio.</p>" +
        "<p>En iOS esto significa cliquear el Ícono en el medio del botón de la pantalla, este luce como una caja con una flecha señalando, y seleccionando 'Adicionar a Inicio de Pantalla'.</p>" +
        "<p>Funcionalidad similar está disponible en todos los buscadores modernos en  Windows, Android, Mac OS, Windows Mobile,y Blackberry.</p>";

this. help_lessons =
    "<h3>Lecciones Seleccionadas</h3>" +
        "<p>Cuando estudies, solo van a ser utilizadas preguntas y categorías de lecciones que estén controladas .</p>";

this. help_card_info =
    "<h3>Categorías</h3>" +
        "<p>Listas de Categorías,si hay alguna,a la cual la carta actual sea asignada.</p>" +
    "<h3>Flashcards Relacionadas</h3>" +
        "<p>Mostrar todas las Flashcards que compartan  carácteres en común  con la flashcard en uso.</p>" +
    "<h3>Orden de Trazos</h3>" +
        "<p>Algunos (no todos) los carácteres tienen diagramas de orden de trazos provistos por The Wikimedia Foundation.</p>" +
    "<h3>Formas Históricas</h3>" +
        "<p>La Fundación WIkipedia ha coleccionado formas de carácteres representativos para muchos carácteres. " +
        "Estos pueden ayudarte a entender la forma de algunos pictogramas.</p>";

this. help_practice =
    "<h3>Relájate!</h3>" +
        "<p>La página de práctica te permite  sentarte y practicar cualquier carácter que desees.</p>" +
        "<p>Ingresa los carácteres que quieras estudiar en la próxima caja.</p>" +
        "<p>Todas las otras funcionalidades de los dibujos de los carácteres de la página de estudio están disponible.</p>" +
    "<h3>Buscar</h3>" +
        "<p>Puedes buscar a través de texto en hanzi o pinyin  de todas las flashcards cliqueando sobre la lupa. " +
        "El buscador va a buscar el carácter en la caja de texto y se desplegará una lista de resultados o irá a la carta si hay solo un resultado.</p>";

this. help_study =
    "<p>Esta es la página de la aplicación donde vas a pasar la mayoría del tiempo, poniéndote a prueba en las flashcards.</p>" +
    "<h3>Tema</h3>" +
        "<p>El tema de la pregunta es la información que se te va a dar .</p>" +
    "<h3>Respuesta</h3>" +
        "<p>La respuesta es la información que administrarás. Escribe o dibuja la respuesta apropiada y luego haz click sobre 'Mostrar Respuesta' para ver si es correcta.</p>" +
    "<h3>Ingreso de texto en Hanzi</h3>" +
        "<p>Si un controlador de entrada  hanzi está siendo mostrado por la pregunta actual, podrías dibujar tantos carácteres como quieras dibujar como respuesta y repetir cada uno muchas veces " +
        "para practicar si es que así lo deseas. Haz click en el botón 下 y te moverás a la próxima mini-grilla o agregará una nueva si estás viendo la última mini-grilla.También puedes " +
        "hacer click sobre las grillas y seleccionarlas. Los demás controles te permiten  elegir el color del lapiz, muestra/oculta el carácter en modo marca de agua en uso, deshacer/rehacer tu dibujo, " +
        "y limpiar la grilla actual.</p>" +
    "<h3>Visualización</h3>" +
        "<p>Información extra como notas en las que no has sido clasificado pueden ser visualizadas al lado de la respuesta también.</p>" +
    "<h3>Calificador</h3>" +
        "<p>Califícate a tí mismo en cada aspecto de la respuesta, para  determinar cuándo serás examinado en la flashcard actual. " +
        "Puedes calificar vários items a la vez arrastrando y deslizandolos.</p>";

this. help_categories =
    "<p>Las categorías son usualmente llamadas listas de palabras en otros sistemas. Ellas ayudan a organizar tus flashcards y le dirán a la apliación cuál flashcadr deseas estudiar.</p>" +
    "<p>Una flashcard que existe en múltiples categorías o en ninguna en caso de que esté 'descategorizada'.</p>";

this. help_progress =
    "<p>La página de progreso te muestra cuántas palabras fueron contadas como aprendidas,cuánto tiempo y cuántas flashcards has estudiado, " +
    "cada día en el que has usado la aplicación.</p>";

this. help_history =
    "<p>La página del historial muestra todas las flashcrs que has estudiado y en el order en que las has estudiado. " +
    "Cada flashcard aparecerá en la lista solo una vez.</p>";

this. help_import =
    "<p>Con esta página  puedes importar datos de las listas construidas o de cualquier otro sistema de flshcards .</p>";

this. help_export = "Ayuda de Exportación" +
    "<p>Exportar te permite hacer copias de seguridad de tus datos.También puedes exportarlo a otro dispositivo o a otro sistema de flashcards.</p>" +
    "<h3>Resultado de Exportación</h3>" +
        "<p>Copia el texto al editor de teco y pégalo en otra aplicación. " +
        "Alternativamente, haz click en botón de \"Download file\".</p>";

this. help_settings =
    "<p>Las configuraciones de pantalla te permiten mejorar la aplicación.</p>" +
    "<h3>Configuraciones Generales</h3>" +
        "<p>Si el auto-avance está encendido, la próxima flashcard va a ser mostrada tan pronto como hayas calificado una flashcard cuando estés estudiando.</p>" +
    "<h3>Ingreso del Dibujo Hanzi</h3>" +
        "<p>Estas configuraciones controlan el aspecto del control de dibujo Hanzi en el modo de estudio y práctica.</p>" +
    "<h3>Guías de Fondo</h3>" +
        "<p>La forma del fondo de la grilla de dibujo Hanzi puede ser configurada aquí.</p>" +
    "<h3>Color de los tonos Pinyin</h3>" +
        "<p>Si está habilitado,este controlará los colores mostrados para cada sílaba de los tonos.</p>" +
    "<h3>Escritura Preferente</h3>" +
        "<p>Puedes decidir si deseas ver Hanzi, Simplificado o Tradicional , como así también una combinación de ambos.</p>" +
    "<h3>Calificaciones</h3>" +
        "<p>Elige los nombres de las calificaciones que deseas ver en la página de estudio,y deshabilita cualquiera que no desees utilizar deseleccionándolas.</p>";

this. help_queue =
    "<p>La lista muestra todas la palabras que estás actualmente estudiando y te permite saber qué tan bien las conoces."
    "La palabras están en orden aproximado en la forma que serán aprendidas,aunque el orden sea casual así no se hace predecible.</p>";

this. help_algorithms =         
    "<h3>Algoritmo de Shanka</h3>" +
        "<p>Este algoritmo  controla el orden de las flashcards en el cual son mostradas,y cómo muchas flashcards nuevas serán adicionadas cuando hayas aprendido las previas.</p>" +
    "<h3>Configuraciones de Estudio</h3>" +
        "<p><li><b> Mínimo de Flashcards Desconocidas</b> - Cuando el número de Flascards desconocidas caiga por debajo de este nivel,nuevas flashcards serán adicionadas a la lista.</p>" +
        "<p><li><b>Objetivo Diario Correcto</b> - Proponte un mínimo de número de preguntas a responder cada día .</p>" +
        "<p><li><b>Nuevo Obejtivo Diario</b> - Proponte un mínimo número de nuevas flashcards para adicionar cada día .</p>" +
        "<p><li><b>Objetivo de Minutos Diarios</b> - Proponte un mínimo de tiempo diario para estudiar en minutos.</p>" +
    "<h3>Parámetros</h3>" +
        "<p><li><b>Tasa de Incumplimiento del Conocimiento.</b> - La calificación del conocimiento <i><b>kn_rate</b></i> es qué tan bien tú conoces la información en una flashcard.Cero es nada y uno es conocimiento perfecto de la flashcard.</p>" +
        "<p><li><b>Umbral del Conocimiento </b> - La calificación del conocimiento en la cual la información en una carta será contada como 'aprendida'.</p>" +
        "<p><li><b>Ajuste dela Velocidad</b> - Qué tan rápido la calificación del conocimiento  para cada información en una flashcard será cambiada a cero/uni cuando respondas las preguntas bien/mal. " +
            "Si este ajuste de velocidad será <i><b>a</b></i>, cuando una pregunta sea reopondida incorrectamente,<i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " +
            "Cuando la pregunta sea respondida correctamente, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. Si las cinco opciones de  respuesta están enumeradas de 1 al 5, luego "
            "la respuesta  3 no cambiará  la calificación del conocimiento, las respuestas 2 y 4 son correctas o incorrectas, y las respuestas 1 y 5 como dos incorrectas o correcctas respectivamente.</p>" +
        "<p><li><b>Cualquier Elemento de Prbabilidad</b> - La probabilidad de que la próxima flashcard  sea dibujada casualmente de cualquier lugar de la lista , en vez del frente de la lista. "
            "Esta configuración te permite que flashcards sea ocacionalmente esparcidas en el estudio.Si no deseas que esto suceda, define su valor como cero.</p>" +
        "<p><li><b>Primer Elemento de Probabilidad</b> - Si esta probabilidad es <i><b>p</b></i>, y la primera flashcard en la lista es número<i><b>0</b></i>, luego la flashcard "
            "<i><b>n</b></i> será seleccionada como la flashcard a estudias con probabilidad <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + 
            "Como la suma de todas las flashcards en la lista serán apenas menores a uno, el resto de probabilidad se le será asignada al primer elemento .</p>" +
        "<p><li><b>Intervalo Mínimo</b> - El intervalo mínimo de número de flashacrs debe ser mostrado antes de que una flashcard se repita, incluso si  esta sea simepre definida como desconocida.</p>";

this. help_questions =     
    "<h3>Nombre de la Pregunta</h3> " +
        "<p> Es solo usada para indentificar  la pregunta en la lista de preguntas.</p> " +
    "<h3>Texto de la Pregunta</h3> " +
        "<p>La pregunta que aparece en la cima de la flashcard sobre el tem principal de la pregunta ,por ejemplo. \"Cuál es el pinyin de este carácter?\"</p> " +
        "<p>Leave the auto-generate checkbox clicked if you want to have the app create this text based on the selected inputs, stem and answer.</p> " +
    "<h3>Entradas</h3> " +
        "<p>Estas entradas  son visualizadas a lo largo de la pregunta. Si escribes 'These inputs are displayed alongside the question stem. If you type' " +
        "chino en la caja de edición, podrás usar o tu dispositivo IMC para escribir en pinyin " +
        "o escribiendo a mano.</p> " +
    "<h3>Stem</h3> " +
        "<p>El frente de la flashcard para esa pregunta.</p> " +
    "<h3>Respuesta</h3> " +
        "<p> Es la parte 'trasera' de la flashcard sobre la cual eres calificado.</p> " +
    "<h3>Visualización</h3> " +
        "<p>Más información en la parte trasera de la flashcard que es mostrada junto a la respuesta .</p>";

this. help_maintenance = 
    "<h3>Recargar</h3>" +
        "<p>Recargando la applicación se reiniciará,usando la información en el almacenamiento local." +
        " Quizá esto te ayude si alguna vez tienes problemas o si accientalmente ejecutas varias instancies de la aplicación.</p>" +
    "<h3>Autonomidad</h3>" +
        "<p>Esta información es usada para ayudar a identificar problemas con la aplicación.Este debería ser verdadero si estás ejecutando la aplicación en " +
        " el modo 'pantalla de inicio' o 'autónomo', y falso si estás usando el buscador.</p>" +
    "<h3>Lenguage del Sistema</h3>" +
        "<p>Este es el código de lenguaje reportado por tu sistema.</p>" +
    "<h3>Caché de la Aplicación</h3>" +
        "<p> Esta aplicación web siempre guarda información sobre las flashcards,etc en el almacenamiento local.El caché de la  aplicación  está separado de este,y" +
        "descarga las páginas de la aplicación real de modo que  puedas acceder a ellos cuando estés desconectado.Si el estado de la aplicación es" +
        "NO EN CHACHÉ entonces no deberías accder a la aplicación cuando estés desconectado.Para asegurarte de estar en uso desconectado deberías poner" +
        "el estatus de la aplicación EN CACHÉ .</p>" +
    "<h3>Actualizar la Aplicación Web</h3>" +
        "<p>Para instalar  la última versión de la aplicación, haz click en 'Actualizad la Aplicación Web' si notas que la última versión  es " +
        "diferente a la versión ya instalada.No deberías necesitas utilizar esta funcionalidad si descargas una " +
        "cuando se te solicite actualizar una vez iniciada la aplicación</p>" +
    "<h3>Almacenamiento Local</h3>" +
        "<p>Ve a  <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " +
        "para calcular tu límite de almacenamiento local , que usualmente es de al menos  2.5M de carácteres dependiendo de tu buscador. " +
        "Nota: 1k=2<sup>10</sup>=1024 carácteres, 1M=2<sup>20</sup> carácteres. Usualmente  1 carácter = 2 bytes, entonces " +
        "2.5M carácteres = 5MB de espacio de almacenamiento.</p>" +
    "<h3>Borrar Almacenamiento Local</h3>" +
        "<p> Si tienes problemas podrías intentar limpiar tus datos de almacenamiento local.Si deseas mantener tu  historial actual "
        "primero deberías exportar una copia de seguridad de tus datos.</p>";

this. help_wizard =
    "<p>Usa este asistente para simplificar la creación de lecciones.</p>" +
    "<p>Puedes utilizar la asistencia más de una vez para crear múltiples lecciones, y luego elegir cuál estudiar de la pantalla de lecciones.</p>";

this. help_about = 
    "<h3>Licencia</h3>" +
        "<p>Eres libre para copiar,distribuir y modificar este código bajo licencia similar " +
        "a esta. Debes darle el crédito al autor origial (yo) en cualquier trabajo derivado. " +
        "No debes usar ninguna parte de este código  con propósitos comerciales sin haber obtenido " +
        "mi permiso.</p>" +
        "<p>Alan Davies 2014 alan@hskhsk.com/p>" +
        "<p>Ve a  http://hskhsk.com/shanka para más información.</p>" +
    "<h3>Creditos</h3>" +
        "Estructura inicial inspirada por Steven de Salas http://html5db.desalasworks.com/<br />" +
        "String compression routines by Pieroxy http://pieroxy.net/blog/pages/lz-string/index.html<br />" +
        "Control de pantalla táctil es una versión intensamente modificada  de la versión hecha por Greg Murray http://gregmurray.org/ipad/touchpaint/<br />" +            
        "La Grila de Colores es de  Jan Odvárko's jscolor http://jscolor.com/<br />" +  
        "Algunas partes del algoritmo de Shanka fueron inspirados por  Adam Nagy de Cybertron BT's defunct product Memodrops " +
        "http://memodrops.com/algorithm.html ( esta pa´gina no existe actualmente pero está archivada en http://archive.org<br />" +
        "Muchos problemas fueron resueltos con la ayuda de los comentarios y soluciones en Stack Overflow http://stackoverflow.com/<br />"+
        "Muchas gracias a Chinese Forums, Pleco, y la comunidad de usuarios Skritter , como así también a los testeadores beta que participaron.<br />" +
        "¡Gracias también a los traductores que internacionalizaron esta aplicación!";
        
// Progress page and progress displayed on main page
this. main_cards_learned_label  = "aprendido";
// this. main_cards_queued_label  = "enlistado";
this. main_cards_total_label    = "total";
this. progress_studied_label    = "estudió";
this. progress_total_label      = "Total";
this. progress_daily_label      = "Diario";
this. progress_today_label      = "Hoy";
this. progress_seconds          = "segundos";
this. progress_minutes          = "minutos";
this. progress_hours            = "horas";
this. progress_days             = "dias";
this. progress_weeks            = "semanas";
this. progress_years            = "año";
this. progress_list_format      = "Estudió {0}, y se enteró de {1} tarjetas, en {2}"; 


/* Translated version of this section should be modified to show
 * which files have and haven't been translated */
this. language_unknown_error = "Código de idioma Desconocido:";
this. import_hsk1_label                     = "Palabras HSK 1";
this. import_hsk2_label                     = "Palabras HSK 2 (Inglés)";
this. import_hsk3_label                     = "Palabras HSK 3 (Inglés)";
this. import_hsk4_label                     = "Palabras HSK 4 (Inglés)";
this. import_hsk5_label                     = "Palabras HSK 5 (Inglés)";
this. import_hsk6_label                     = "Palabras HSK 6 (Inglés)";
this. import_hsk1_sentences_label           = "Frases HSK 1 (Inglés)";
this. import_hsk2_sentences_label           = "Frases HSK 2 (Inglés)";
this. import_hsk3_sentences_label           = "Frases HSK 3 (Inglés)";
this. import_chineasy_label                 = "Chineasy";
this. import_hsk1_category                  = "HSK 1";
this. import_hsk2_category                  = "HSK 2";
this. import_hsk3_category                  = "HSK 3";
this. import_hsk4_category                  = "HSK 4";
this. import_hsk5_category                  = "HSK 5";
this. import_hsk6_category                  = "HSK 6";
this. import_hsk1_sentences_category        = "HSK 1 Sentences";
this. import_hsk2_sentences_category        = "HSK 2 Sentences";
this. import_hsk3_sentences_category        = "HSK 3 Sentences";
this. import_chineasy_category              = "Chineasy";
this. import_hsk1_location                  = "lists/HSK 2012 L1 es.txt";
this. import_hsk2_location                  = "lists/HSK 2012 L2.txt";
this. import_hsk3_location                  = "lists/HSK 2012 L3.txt";
this. import_hsk4_location                  = "lists/HSK 2012 L4.txt";
this. import_hsk5_location                  = "lists/HSK 2012 L5.txt";
this. import_hsk6_location                  = "lists/HSK 2012 L6.txt";
this. import_hsk1_sentences_location        = "lists/HSK 2012 Examples L1.txt";
this. import_hsk2_sentences_location        = "lists/HSK 2012 Examples L2.txt";
this. import_hsk3_sentences_location        = "lists/HSK 2012 Examples L3.txt";
this. import_chineasy_location              = "lists/Chineasy es.txt";
} /* End of language definition */
