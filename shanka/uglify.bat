REM 'touch' the manifest file - not enough to force chrome to notice that it changed
REM copy /b cache.manifest +,,
REM Append a character to the file, to make sure that it changes
REM Doesn't work at the end of the file for some reason!?
echo #>> cache.manifest

uglifyjs ^
script\util.js ^
script\lz-string-1.3.3.js ^
script\fastclick.js ^
script\AppScroll.js ^
script\jscolor.js ^
script\lang_english.js ^
script\lang_dutch.js ^
script\lang_spanish.js ^
script\lang_french.js ^
script\lang_italian.js ^
script\lang_german.js ^
script\language.js ^
script\snap.js ^
script\hanzicanvas.js ^
script\shanka.js ^
script\lesson.js ^
script\card.js ^
script\category.js ^
script\question.js ^
script\algorithm.js ^
script\progress.js ^
script\local.js ^
script\study.js ^
script\import.js ^
script\export.js ^
script\historyqueue.js ^
script\settings.js ^
script\maintenance.js ^
script\wizard.js ^
script\help.js ^
script\version.js ^
script\ratchet.js ^
--output shanka.min.js ^
--source-map shanka.min.js.map ^
--source-map-root http://localhost/script ^
--source-map-include-sources ^
--screw-ie8 ^
--prefix 5 ^
--reserved STR,supportedLanguages,shanka ^
--comments ^
--lint ^
--verbose ^
--compress unsafe,dead_code --mangle toplevel,sort
REM --beautify
