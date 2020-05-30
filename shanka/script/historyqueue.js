/*
    Shanka HSK Flashcards - historyqueue.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.rebuildqueue = function() {
    shanka.queue = [];

    // build a list of all categories that are part of enabled lessons
    var categoryids = shanka.getallactivecategoryidsdict(false);
    
    // find all queued cards in those categories
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (card.queued) {
            for (var i= 0, len = card.categoryids.length; i<len; i++) {
                var categoryid = card.categoryids[i];
                if (categoryid in categoryids) {
                    shanka.queue.push(card);
                    break;
                }
            }
        }
    }
    
    shanka.queue.sort(function(a, b) {return shanka.algorithm.queuecompare(a, b);});
}

shanka.rebuildhistory = function() {
    shanka.history = [];

    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (card.last_time) {
            shanka.history.push(card);
        }
    }
    
    shanka.history.sort(shanka.historycompare);
}

shanka.historycompare = function(a, b) {
    return b.last_time - a.last_time; // sort in reverse order - newest first
}

shanka.removefromhistory = function(card) {
    for (var i=0, len=shanka.history.length; i<len; i++) {
        var cardtest = shanka.history[i];
        if (card.cardid == cardtest.cardid) {
            shanka.history.splice(i, 1);
            break;
        }
    }
}

shanka.addtohistory = function(card) {
    var index = shanka.binaryInsertionSearch(shanka.history, card, shanka.historycompare);   
    shanka.history.splice(index, 0, card);
}

shanka.removefromqueue = function(card) {
    for (var i=0, len=shanka.queue.length; i<len; i++) {
        var cardtest = shanka.queue[i];
        if (card.cardid == cardtest.cardid) {
            shanka.queue.splice(i, 1);
            break;
        }
    }
}

shanka.addtoqueue = function(card) {
    var index = shanka.binaryInsertionSearch(shanka.queue, card, function(a, b) {return shanka.algorithm.queuecompare(a, b);});   
    shanka.queue.splice(index, 0, card);
}

shanka.countqueueunknown = function() {
    var card = new Card();
    // TODO: do something else for date-based algorithms!
    // var datenow = new Date();
    // var datenext = new Date(datenow.getTime() + );
    card.kn_rate = shanka.algorithm.getdata("known_kn_rate");
    // card.last_time = datenow.getTime();
    // card.next_time = datenext.getTime();
    var index = shanka.binaryInsertionSearch(shanka.queue, card, function(a, b) {return shanka.algorithm.queuecompare(a, b);});   
        
    while (index > 0 && shanka.queue[index-1].kn_rate == card.kn_rate) {
        index--;
    }
    
    return index;
}

// returns the index of where to insert a value, using a given comparator
shanka.binaryInsertionSearch = function(array, value, comparator) {
  var low = 0, high = array.length - 1, i=0, comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = comparator(array[i], value);
    if (comparison < 0) { low = i + 1; i = low; continue; }
    if (comparison > 0) { high = i - 1; continue; }
    break;
  }
  return i;
};

shanka.showhistory = function() {
    shanka.navigate({"section" : "history"});
}

shanka.showqueue = function() {
    shanka.navigate({"section" : "queue"});
}

shanka.inithistory = function() {
    var historylist = document.getElementById("historylist")
    var lis = historylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (historylist.firstChild) {
        historylist.removeChild(historylist.firstChild);
    }
    
    var filteredhistory = shanka.filterlistpages(shanka.history);

    var lastdividertext = "";
    for (var i=0, len=filteredhistory.length; i<len; i++) {
        var card = filteredhistory[i];
        var dividertext = shanka.algorithm.gethistorydisplaytext(card);
        if (dividertext != lastdividertext) {
            var lidivider=document.createElement("li");
            lidivider.innerHTML = dividertext;
            lidivider.classList.add("list-divider");
            historylist.appendChild(lidivider);
            lastdividertext = dividertext;
        }
        var li=document.createElement("li");    
        li.innerHTML = template.replace(/#ID#/g, card.cardid).replace(/#DESCRIPTION#/g, card.liststring());
        historylist.appendChild(li);
    }
}

shanka.initqueue = function() {
    if (shanka.queue.length == 0) {
        shanka.rebuildqueue();
    }

    var queuelist = document.getElementById("queuelist")
    var lis = queuelist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (queuelist.firstChild) {
        queuelist.removeChild(queuelist.firstChild);
    }
    
    var filteredqueue = shanka.filterlistpages(shanka.queue);

    // nasty to use globals, but quick...
    trouble_shown = false;
    learned_shown = false;
    learning_shown = false;
    
    var lastdividerkn = -1;
    for (var i=0, len=filteredqueue.length; i<len; i++) {
        var card = filteredqueue[i];
        var dividerinfo = shanka.algorithm.getqueuedisplaytext(card);
        var dividerkn = dividerinfo[0]; 
        var dividertext = dividerinfo[1];
        if (dividerkn != lastdividerkn) {
            var lidivider=document.createElement("li");
            lidivider.innerHTML = dividertext;
            lidivider.classList.add("list-divider");
            queuelist.appendChild(lidivider);
            lastdividerkn = dividerkn;
        }
        var li=document.createElement("li");    
        li.innerHTML = template.replace(/#ID#/g, card.cardid).replace(/#DESCRIPTION#/g, card.liststring());
        queuelist.appendChild(li);
    }
}


shanka.addcardtoqueueifallowed = function() {
    var cardadded = null;
    var auto_unknown_min = shanka.algorithm.getdata("auto_unknown_min");
    
    if (auto_unknown_min) {
        var categoryids = shanka.getallactivecategoryidslist(true);
        var num_unknown = shanka.countqueueunknown();
        if (num_unknown < auto_unknown_min && categoryids.length) {
            var index = Math.floor(Math.random() * categoryids.length);
            var categoryid = categoryids[index];
            var category = shanka.categories[categoryid];
            for (var i=0, len=category.cardids.length; i<len; i++) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                if (card.enabled && !card.queued) {
                    card.queued = true;
                    card.kn_rate = shanka.algorithm.getdata("default_kn_rate");
                    // TODO: initialise time-based SRS stuff
                    card.write();
                    cardadded = card;
                    shanka.queue = [];
                    break;
                }
            }
            if (i == category.cardids.length) {
                // we got to the end of the category, remove it from the list
                categoryids.splice(index, 1);
            }
        }
    }    
    return cardadded;
}



