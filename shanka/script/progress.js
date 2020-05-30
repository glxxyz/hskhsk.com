/*
    Shanka HSK Flashcards - progress.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Progress is for historic info

function Progress () {
    this.progressid = 0;
    this.date = 0;
    this.totaltimestudied = 0;
    this.totalcardsknown = 0;
    this.totalitemsstudied = 0;
};

// ---------------------------
// Progress methods

Progress.prototype.write = function() {
    localStorage["p" + this.progressid.toString(36)] = shanka.compress(JSON.stringify(this));
}

Progress.prototype.del = function() {
    delete shanka.progress[this.progressid];
    
    localStorage.removeItem("p" + this.progressid.toString(36));
}

shanka.initprogress = function() {
    document.getElementById("progress_total_label").innerHTML = STR.progress_total_label; 
    document.getElementById("progress_daily_label").innerHTML = STR.progress_daily_label; 

    var progresstotallist = document.getElementById("progresstotallist")
    var progressdailylist = document.getElementById("progressdailylist");
    
    var filteredprogress = shanka.filterlistpages(shanka.progress);
    
    for (var i=0, len=filteredprogress.length; i<len; i++) {
        var progress = filteredprogress[i];
        var year = Math.floor(progress.date / 10000);
        var month = Math.floor(progress.date / 100) - year * 100;
        var day = progress.date - year * 10000 - month * 100;
        
        var progresstext = year.toString() + "-";
        if (month < 10) {
            progresstext += "0";
        }
        progresstext += month.toString() + "-";
        if (day < 10) {
            progresstext += "0";
        }
        progresstext += day.toString() + ": ";
        
        var timestudied  = progress.totaltimestudied;
        var itemsstudied = progress.totalitemsstudied;
        var cardsknown   = progress.totalcardsknown;
        var format       = STR.progress_list_format;
        var valunit      = shanka.getprogressvalunit(timestudied);
        var totalstring  = progresstext + format.replace("{0}", itemsstudied.toString())
                                                .replace("{1}", cardsknown.toString())
                                                .replace("{2}", valunit[0] + " " + valunit[1]);

        var li=document.createElement("li");    
        var text = document.createTextNode(totalstring);
        li.appendChild(text);
        li.classList.add("norightpaddinglist");
        li.style = "padding-right: 10px;"
        progresstotallist.appendChild(li);

        if (i < shanka.progress.length - 1) {
            var prevprogress = shanka.progress[i+1];
            
            timestudied  = progress.totaltimestudied  - prevprogress.totaltimestudied;
            itemsstudied = progress.totalitemsstudied - prevprogress.totalitemsstudied;
            cardsknown   = progress.totalcardsknown   - prevprogress.totalcardsknown;
        }
        
        var valunit = shanka.getprogressvalunit(timestudied);
        var dailystring = progresstext + format.replace("{0}", itemsstudied.toString())
                                               .replace("{1}", cardsknown.toString())
                                               .replace("{2}", valunit[0] + " " + valunit[1]);

        var li=document.createElement("li");    
        var text = document.createTextNode(dailystring);
        li.appendChild(text);
        li.classList.add("norightpaddinglist");
        li.style = "padding-right: 10px;"
        progressdailylist.appendChild(li);
    }    
}

shanka.getprogressvalunit = function(timems) {
    var valunit = ["",""]
    var adjtime = 0;

    if (timems < 1000 * 60) {
        adjtime = timems / (1000.0);
        valunit[1] = STR.progress_seconds;
    } else if (timems < 1000.0 * 60 * 60) {
        adjtime = timems / (1000 * 60);
        valunit[1] = STR.progress_minutes;
    } else if (timems < 1000.0 * 60 * 60 * 24) {
        adjtime = timems / (1000 * 60 * 60);
        valunit[1] = STR.progress_hours;
    } else if (timems < 1000.0 * 60 * 60 * 24 * 7) {
        adjtime = timems / (1000.0 * 60 * 60 * 24);
        valunit[1] = STR.progress_days;
    } else if (timems < 1000.0 * 60 * 60 * 24 * 365) {
        adjtime = timems / (1000.0 * 60 * 60 * 7);
        valunit[1] = STR.progress_weeks;
    } else {
        adjtime = timems / (1000.0 * 60 * 60 * 365);
        valunit[1] = STR.progress_hours;
    }
    
    var rounded = Math.round(adjtime * 10.0) / 10.0;
    
    valunit[0] = rounded.toString();
    
    return valunit;
}

shanka.getcurrentdayid = function() {
    var now = new Date();
    var dayid = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
    return dayid;
}

shanka.updateCurrentProgress = function(timeStudied, known_increment) {
    var today = shanka.getcurrentdayid();
    var lastprogress = shanka.progress[0];
    if (!lastprogress || today != lastprogress.date) {
        var newprogress = new Progress();
        newprogress.progressid = shanka.getnextguid();       
        newprogress.date = today;
        newprogress.totalcardsknown = shanka.queue.length - shanka.countqueueunknown();
        newprogress.totalitemsstudied = lastprogress ? lastprogress.totalitemsstudied : 0;
        newprogress.totaltimestudied = lastprogress ? lastprogress.totaltimestudied : 0;
        shanka.progress.unshift(newprogress);
        lastprogress = newprogress;
    }
    
    lastprogress.totalitemsstudied += 1;
    lastprogress.totalcardsknown += known_increment;
    lastprogress.totaltimestudied += timeStudied;
    lastprogress.write();
}

shanka.ensuretodayhasprogress = function() {
    var today = shanka.getcurrentdayid();
    if (!shanka.progress.length || shanka.progress[0].date != today) {
        var newprogress = new Progress();
        newprogress.date = today;
        shanka.progress.unshift(newprogress);
        newprogress.write();
    }
}


shanka.progresscompare = function(a, b) {
    return b.date - a.date; // sort in reverse order - newest first
}


