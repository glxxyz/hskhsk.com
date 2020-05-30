/*
    Shanka HSK Flashcards - local.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// ---------------------------
// Objects and local storage serialisation
// ---------------------------

// Local storage format
//
// localStorage["i1A"] = shanka.compress(JSON.stringify(an card obj));
// localStorage["g2B"] = shanka.compress(JSON.stringify(a question obj));
// localStorage["c3C"] = shanka.compress(JSON.stringify(a category obj));
// localStorage["h4D"] = shanka.compress(JSON.stringify(a History obj));
// localStorage["settings"] = shanka.compress(JSON.stringify(settings));

// ---------------------------
// Shanka local storage methods

shanka.getnextguid = function() {
    var guid = shanka.nextguid ;
    shanka.nextguid++;
    return guid;
}

shanka.checkguid = function(id) {
    if (id >= shanka.nextguid) {
        shanka.nextguid = id + 1;
    }
}

shanka.compress = function(data) {
    return LZString.compressToUTF16(data); // turn on for better local storage usage
    // return data; // debugging
}

shanka.decompress = function(data) {
    return LZString.decompressFromUTF16(data); // turn on for better local storage usage
    // return data; // debugging
}

shanka.readall = function() {

    var keystodelete = [];
    
    for (var i=0, len=localStorage.length; i<len; i++)
    {
        var key = localStorage.key(i);
        
        if (!key) {
            console.log("readall null key i:" + String(i));
            continue;
        }
        
        if (key.charAt(0) == "n" || key.charAt(0) == "d" || key.charAt(0) == "x") {
            // notes or description or data - ignore
            continue;
        }        
        
        var localStorageItem = null;
        var decompressed = null;
        try
        {
            if (key == "language") {
                // used by language object
                continue;
            } 
        
            localStorageItem = localStorage.getItem(key);
            decompressed = shanka.decompress(localStorageItem);
            var obj = JSON.parse(decompressed);
                
            if (key == "settings") {
                shanka.settings = obj;
            }
            else if (key == "state") {
                shanka.state = obj;
            }
            else if (key.charAt(0) == "f") {
                var card = new Card();            
                card.fromarray(obj); // Cards are serialised into an array- saves lots of storage space
                shanka.cards[card.cardid] = card;
                shanka.checkguid(card.cardid);
            }
            else if (key.charAt(0) == "l") {
                obj.__proto__ = Lesson.prototype;
                shanka.lessons[obj.lessonid] = obj;
                shanka.checkguid(obj.lessonid);
            }
            else if (key.charAt(0) == "a") {
                obj.__proto__ = Algorithm.prototype;
                shanka.algorithms[obj.algorithmid] = obj;
                shanka.checkguid(obj.algorithmid);
                if (obj.current) {
                    shanka.algorithm = obj;
                }
            }
            else if (key.charAt(0) == "q") {
                obj.__proto__ = Question.prototype;
                shanka.questions[obj.questionid] = obj;
                shanka.checkguid(obj.questionid);
            }
            else if (key.charAt(0) == "c") {
                obj.__proto__ = Category.prototype;
                shanka.categories[obj.categoryid] = obj;
                shanka.checkguid(obj.categoryid);
            }
            else if (key.charAt(0) == "p") {
                obj.__proto__ = Progress.prototype;
                shanka.progress.push(obj);
                shanka.checkguid(obj.progressid);
            }
            else {
                ReportError("readall： Local storage key with unknown prefix: " + key);
                errorsDetected = true;
            }
        }
        catch (err)
        {
            ExceptionError("readall key:" + String(key), err);
            if (localStorageItem) {
                console.log("readall failed for key: " + String(key) + " localStorageItem: [[" + localStorageItem + "]]");
            }
            if (decompressed) {
                console.log("readall failed for key: " + String(key) + " decompressed: " + decompressed + "]]");
            }
            keystodelete.push(key);
        }
    }

    var key = null;
    var i = 0;
    try
    {
        for (i=0, len=keystodelete.length; i<len; i++) {
            key = keystodelete[i];
            localStorage.removeItem(key);
        }
    }
    catch (err)
    {
        ExceptionError("readall deleting i:" + String(i) + " key:" + String(key), err);
    }
    
    // add default 'uncategorised' category if it is not there. Should always exist and can't be deleted!
    if (!(0 in shanka.categories)) {
        var category1 = new Category();
        category1.name = STR.category_uncategorised_name;
        category1.categoryid = 0;
        shanka.categories[category1.categoryid] = category1;
        category1.write();
    }      
    
    // add default algorithms if there are none
    if (isEmpty(shanka.algorithms)) {    
        shanka.EnsureAlgorithmBeginnerExists();
        var algorithm = shanka.EnsureAlgorithmIntermediateExists();
        shanka.EnsureAlgorithmAdvancedExists();
        shanka.EnsureAlgorithmReviewExists();
        shanka.EnsureAlgorithmRandomExists();
        shanka.EnsureAlgorithmRandomReviewExists();
        shanka.EnsureAlgorithmPlecoExists();
        shanka.EnsureAlgorithmSkritterExists();
        algorithm.current = true;
        shanka.algorithm = algorithm;
        algorithm.write();
    }
    
    var errorsDetected = false;

    // iterate over all lessons, cleaning up any missing questions and categories
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        var dirty = false;

        // detect missing categories
        var i = lesson.categoryids.length;
        while (i--) {
            var categoryid = lesson.categoryids[i];
            if (!(categoryid in shanka.categories)) {
                lesson.categoryids.splice(i,1);
                ReportError("readall: data integrity error: removing missing category " + categoryid + " from lesson " + lesson.lessonid + " " + lesson.name);
                dirty = true;
                errorsDetected = true;
            }
        }            
        
        // detect missing questions
        var i = lesson.questionids.length;
        while (i--) {        
            var questionid = lesson.questionids[i];
            if (!(questionid in shanka.questions)) {
                lesson.questionids.splice(i,1);
                ReportError("readall: data integrity error: removing missing question " + questionid + " from lesson " + lesson.lessonid + " " + lesson.name);
                dirty = true;
                errorsDetected = true;
            }
        }
        
        if (lesson.allquestions) {
            for (var questionidstr in shanka.questions) {
                var questionid = parseInt(questionidstr);
                if (!contains(lesson.questionids, questionid)) {
                    ReportError("readall: data integrity error: lesson " + lesson.lessonid.toString() + " " + lesson.name + " with 'all' questions set was missing question id " + questionidstr);
                    lesson.questionids.push(questionid);
                    dirty = true;
                    errorsDetected = true;
                }
            }
        }

        if (lesson.allcategories) {
            for (var categoryidstr in shanka.categories) {
                var categoryid = parseInt(categoryidstr);
                if (!contains(lesson.categoryids, categoryid)) {
                    ReportError("readall: data integrity error: lesson " + lesson.lessonid.toString() + " " + lesson.name + " with 'all' categories set was missing category id " + categoryidstr);
                    lesson.categoryids.push(categoryid);
                    dirty = true;
                    errorsDetected = true;
                }
            }
        }

        if (dirty) {
            lesson.write();
        }
    }
    
    // Now fill in all of the category links in the cards, which aren't saved to save space
    // as we go, remove any cards that aren't found
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        var dirty = false;
        var i = category.cardids.length;
        while (i--) {
            var cardid = category.cardids[i];
            var card = shanka.cards[cardid];
            if (card) {
                card.categoryids.push(parseInt(categoryidstr));
            } else {
                ReportError("readall: data integrity error: removing missing card " + cardid + " from category " + categoryidstr + " " + category.name);
                category.cardids.splice(i,1);
                dirty = true;
                errorsDetected = true;
            }
        }
        if (dirty) {
            category.write();
        }
    }

    var uncategorised = shanka.categories[0];
    var dirty = false;
    
    // iterate over all cards, adding any that don't have categories
    // to uncategorised
    for (var cardidstr in shanka.cards) // warning - cardidstr is a string!
    {
        var card = shanka.cards[parseInt(cardidstr)];
        if (card.categoryids.length == 0) {
            ReportError("readall: data integrity error: setting card to uncategorised: " + cardidstr + " " + card.simplified  + "[" + card.traditional + "]" );
            card.categoryids.push(uncategorised.categoryid);
            uncategorised.cardids.push(parseInt(cardidstr));
            dirty = true;
            errorsDetected = true;
        }
    }
    
    if (dirty) {
        uncategorised.write();
    }
    
    shanka.rebuildqueue();
    shanka.rebuildhistory();
    shanka.progress.sort(function(a, b) {return shanka.progresscompare(a, b);});
    
    if (errorsDetected) {
        alert(STR.local_storage_errors_detected_resolved_error);
    }    
}

shanka.initlocal = function() {
    if (window.applicationCache) {
        if (applicationCache.status === applicationCache.UPDATEREADY) {
            shanka.confirmandupdate();
        } else {
            applicationCache.addEventListener('updateready', shanka.confirmandupdate);
            if (applicationCache.status === applicationCache.UPDATEREADY) {
                shanka.confirmandupdate();
            }
        }
    }
    
    try {
        // fetch the version numbers if they haven't been got already
        if (shanka.getsetting("currentversionnum") == "0") {
            shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
            shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
        }
    }
    catch (err) {
        console.log("Must be offline, couldn't get online app version: " + err.message);
    }
}

shanka.setlocalversioninfo = function() {

    document.getElementById("currentversionnum").innerHTML = shanka.getsetting("currentversionnum");
    document.getElementById("currentversiondate").innerHTML = shanka.getsetting("currentversiondate");
}

shanka.redownload = function() {

    shanka.updateappcachestatus();

    window.location.reload();
    
    shanka.updateappcachestatus();    
        
    try
    {
        shanka.setsetting("currentversionnum", "0");
        shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
        shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
    }
    catch (err)
    {
        console.log("shanka.redownload " + err.message);
    }
    
    setTimeout(shanka.updateappcachestatus, 1000);
    setTimeout(shanka.updateappcachestatus, 2000);
    setTimeout(shanka.updateappcachestatus, 3000);
    setTimeout(shanka.updateappcachestatus, 4000);
    setTimeout(shanka.updateappcachestatus, 5000);
    setTimeout(shanka.updateappcachestatus, 6000);
    setTimeout(shanka.updateappcachestatus, 7000);
    setTimeout(shanka.updateappcachestatus, 8000);
    setTimeout(shanka.updateappcachestatus, 9000);
    setTimeout(shanka.updateappcachestatus, 10000);
}

shanka.getappcachestatus = function() {
    var status = "";
    switch (applicationCache.status) {
      case applicationCache.UNCACHED: // UNCACHED == 0
        status = 'UNCACHED';
        break;
      case applicationCache.IDLE: // IDLE == 1
        status = 'IDLE';
        break;
      case applicationCache.CHECKING: // CHECKING == 2
        status = 'CHECKING';
        break;
      case applicationCache.DOWNLOADING: // DOWNLOADING == 3
        status = 'DOWNLOADING';
        break;
      case applicationCache.UPDATEREADY:  // UPDATEREADY == 4
        status = 'UPDATEREADY';
        break;
      case applicationCache.OBSOLETE: // OBSOLETE == 5
        status = 'OBSOLETE';
        break;
      default:
        status = 'UKNOWN CACHE STATUS';
        break;
    };
    return status;
}

shanka.confirmandupdate = function() {
    if (confirm(STR.app_new_version_download_confirm)) {
        window.location.reload();
        
        try
        {
            shanka.setsetting("currentversionnum", "0");
            shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
            shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
        }
        catch (err)
        {
            console.log("shanka.redownload " + err.message);
        }        
    }
}
