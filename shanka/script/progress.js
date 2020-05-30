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
    var progresslist = document.getElementById("progresslist")
    
    for (var i=0, len=shanka.progress.length; i<len; i++) {
        var progress = shanka.progress[i];
        var year = Math.floor(progress.date / 10000);
        var month = Math.floor(progress.date / 100) - year * 100;
        var day = progress.date - year * 10000 - month * 100;
        
        var progresstext = year.toString() + "-";
        if (month >= 10) {
            progresstext += "0";
        }
        progresstext += month.toString() + "-";
        if (day >= 10) {
            progresstext += "0";
        }
        progresstext += day.toString() + " ";
        
        "seconds"
        "minutes"
        "hours"
        "days"
        "weeks"
        "months"
        "years"
        "Studied/learned {0}/{1} cards in {2} (total: {3}/{4} in {5})";
        
        var li=document.createElement("li");    
        var text = document.createTextNode(progresstext);
        li.appendChild(text);
        progresslist.appendChild(li);
    }    
}

shanka.getcurrentdayid = function() {
    var now = new Date();
    var dayid = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
    return dayid;
}

shanka.updateCurrentProgress = function(timeStudied, known_increment) {
    var today = shanka.getcurrentdayid();
    var lastprogress = shanka.progress[0];
    if (today != lastprogress.date) {
        var newprogress = new Progress();
        newprogress.date = today;
        newprogress.totalcardsknown = shanka.queue.length - shanka.countqueueunknown();
        newprogress.totalitemsstudied = lastprogress.totalitemsstudied;
        newprogress.totaltimestudied = lastprogress.totaltimestudied;
        shanka.progress.unshift(newprogress);
        lastprogress = newprogress;
    }
    
    lastprogress.totalitemsstudied += 1;
    lastprogress.totalcardsknown += known_increment;
    lastprogress.totaltimestudied += timeStudied;
    lastprogress.write();
}

shanka.progresscompare = function(a, b) {
    return b.date - a.date; // sort in reverse order - newest first
}


