/*
    Shanka HSK Flashcards - study.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.initcardinfo = function (cardid) {
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];

    var hanzi = card.simptradtogether();
    
    var innercontent = document.getElementById("pagecontent")
    innercontent.innerHTML = innercontent.innerHTML
                                    .replace(/#HANZI#/g, hanzi)
                                    .replace(/#TRADITIONAL#/g, card.traditional)
                                    .replace(/#PINYIN#/g, card.pinyin) /* TODO tones to numbers and vice versa */
                                    .replace(/#DEFINITION#/g, card.getdefinition())
                                    .replace(/#NOTES#/g, card.getnotes());
                                    
    shanka.initstudyinfocategories(card);
    shanka.initstudyinforelatedcards(card);
    shanka.initstudyinfostrokeorder(card);
    shanka.initstudyinfoetymology(card);
    
    if (!is_iOS()) {
        document.getElementById("infoplecotop").style.display = "none";
    }
    
    document.getElementById("study-back-button").disabled = shanka.studybackstack.length == 0;
    document.getElementById("study-fwd-button").disabled = shanka.studyfwdstack.length == 0;
    
    if ("cardid" in shanka.state && "questionid" in shanka.state) {
        document.getElementById("infostudycurrent").style.display = "inline";
    } else {
        document.getElementById("infostudycurrent").style.display = "none";
    }
}

shanka.initstudy = function() {

    shanka.studystarttime = new Date();

    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var questionid = parseInt(shanka.state["questionid"]);
    var question = shanka.questions[questionid];
    
    if (!card) {
        alert(STR.study_invalid_card_id_error + cardid.toString());
        shanka.showmain();
        return;
    }

    if (!question) {
        alert(STR.study_invalid_question_id_error + questionid.toString());
        shanka.showmain();
        return;
    }

    if (contains(question.input, "draw")) {
        document.getElementById("touchpaintouter").style.display = "inline";
        shanka.inittouchpaint(5);
    } else {
        document.getElementById("touchpaintouter").style.display = "none";
    }
    
    // setup auto-advance, may be overridden during selectanswer
    if (shanka.getsetting("autoadvance") == "true") {
        document.getElementById("studysubmit").style.display = "none";
    } else {
        document.getElementById("studysubmit").style.display = "block";
        document.getElementById("studysubmit").classList.add("disabled");
    }    
    
    shanka.updateStudyReveal();
    
    document.getElementById("questionstemtext").innerHTML = question.questiontext;

    var rating1enable = shanka.getsetting("rating1enable");
    var rating2enable = shanka.getsetting("rating2enable");
    var rating3enable = shanka.getsetting("rating3enable");
    var rating4enable = shanka.getsetting("rating4enable");
    var rating5enable = shanka.getsetting("rating5enable");

    for (var i = 0, len = studyfields.length; i < len; i++) {
        var f = studyfields[i];
        
        var answertable = document.getElementById('answertable' + f);
        var answertext = document.getElementById('answertext' + f);
        
        if (contains(question.answer, f)) {
            answertable.style.display = "inline";
            answertext.style.display  = "block";
            answertext.innerHTML = card.getfield(f);
        } else {
            answertable.style.display = "none";
            answertext.style.display  = "none";
            answertext.innerHTML = "";
        }
        
        var answerbtn1 = document.getElementById("answerbtn" + f + "1");
        var answerbtn2 = document.getElementById("answerbtn" + f + "2");
        var answerbtn3 = document.getElementById("answerbtn" + f + "3");
        var answerbtn4 = document.getElementById("answerbtn" + f + "4");
        var answerbtn5 = document.getElementById("answerbtn" + f + "5");
        
        answerbtn1.style.display=(rating1enable == "false" ? "none" : "inline");
        answerbtn2.style.display=(rating2enable == "false" ? "none" : "inline");
        answerbtn3.style.display=(rating3enable == "false" ? "none" : "inline");
        answerbtn4.style.display=(rating4enable == "false" ? "none" : "inline");
        answerbtn5.style.display=(rating5enable == "false" ? "none" : "inline");
        
        answerbtn1.innerHTML = shanka.getsetting("rating1title")
        answerbtn2.innerHTML = shanka.getsetting("rating2title")
        answerbtn3.innerHTML = shanka.getsetting("rating3title")
        answerbtn4.innerHTML = shanka.getsetting("rating4title")
        answerbtn5.innerHTML = shanka.getsetting("rating5title")
        
        answerbtn1.classList.remove("answerbtnsel1");
        answerbtn2.classList.remove("answerbtnsel2");
        answerbtn3.classList.remove("answerbtnsel3");
        answerbtn4.classList.remove("answerbtnsel4");
        answerbtn5.classList.remove("answerbtnsel5");
        
        answerbtn1.classList.remove("answerbtntouch1");
        answerbtn2.classList.remove("answerbtntouch2");
        answerbtn3.classList.remove("answerbtntouch3");
        answerbtn4.classList.remove("answerbtntouch4");
        answerbtn5.classList.remove("answerbtntouch5");
        
        answerbtn1.classList.add("answerbtn1");
        answerbtn2.classList.add("answerbtn2");
        answerbtn3.classList.add("answerbtn3");
        answerbtn4.classList.add("answerbtn4");
        answerbtn5.classList.add("answerbtn5");
        
        var answertext = document.getElementById('answertext' + f);        
        answertext.style.background = "#FFFFFF";
        
        var stemfield = document.getElementById(f + "stem");
        var displayfield = document.getElementById(f + "display");
        
        if (contains(question.stem, f)) {
            var stemdivtype = ((f == "pinyin" || f == "notes" || f == "definition") ? "block" : "inline");
            stemfield.style.display = stemdivtype;
            stemfield.innerHTML = card.getfield(f);
        } else {
            stemfield.style.display = "none"
            stemfield.innerHTML = "";
        }

        if (contains(question.display, f)) {
            displayfield.style.display = "inline";
            displayfield.innerHTML =  card.getfield(f);
        } else {
            displayfield.style.display = "none";
            displayfield.innerHTML = "";
        }
        
        if (f in shanka.state) {
            shanka.selectanswer(f, parseInt(shanka.state[f]), false);
        }
    }
        
    document.getElementById("answers").ontouchstart = shanka.doontouchstart;
    document.getElementById("answers").ontouchmove = shanka.doontouchmove;
    document.getElementById("answers").ontouchcancel = shanka.doontouchend;
    document.getElementById("answers").ontouchend = shanka.doontouchend;
    document.getElementById("answers").onmousedown = shanka.doansweronmousedown;
    document.getElementById("answers").onmouseover = shanka.doansweronmouseover;
    document.getElementById("answers").onmouseup = shanka.doansweronmouseup;

    // innercontent.style.display="block";
    
    if (contains(question.input, "type")) {
        // set focus, only if answer not revealed
        document.getElementById("studytextinput").focus();
        document.getElementById("textanswer").style.display = "inline";
        document.getElementById("studytextinput").value = "";
    } else if (!("reveal" in shanka.state) || shanka.state["reveal"] != "true") {    
        document.getElementById("textanswer").style.display = "none";
    }
    
    // disable display of these if trad == simp, and at least one of the
    // stem and answer is already showing that field.
    if (card.simplified == card.traditional) {
        if (   contains(question.stem, "simplified")
            || contains(question.stem, "traditional")
            || contains(question.answer, "simplified")
            || contains(question.answer, "traditional")) {
            document.getElementById("simplifieddisplay").style.display = "none";
            document.getElementById("traditionaldisplay").style.display = "none";
        }
        if (contains(question.stem, "cursive") || contains(question.answer, "cursive")) {
            document.getElementById("cursivedisplay").style.display = "none";
            // document.getElementById("tcursivedisplay").style.display = "none";
        }
        if (contains(question.stem, "callig") || contains(question.answer, "callig")) {
            document.getElementById("calligdisplay").style.display = "none";
            // document.getElementById("tcalligdisplay").style.display = "none";
        }
    }
    
    if (!is_iOS()) {
        document.getElementById("studyplecotop").style.display = "none";
    }
    
    shanka.updatecharbutton();
    shanka.updateminitpmorebuttons();
    
    var backbutton = document.getElementById("study-back-button");
    var fwdbutton = document.getElementById("study-fwd-button");
    backbutton.style.display = "inline";
    backbutton.disabled = shanka.studybackstack.length == 0;
    fwdbutton.style.display = "inline";
    fwdbutton.disabled = shanka.studyfwdstack.length == 0;
    
    document.getElementById("studyinfo").style.display = "inline";
    document.getElementById("studycurrent").style.display = "none";
    document.getElementById("studypractice").style.display = "inline";
    document.getElementById("studyedit").style.display = "inline";
    document.getElementById("practicetext").style.display = "none";
    document.getElementById("practicesearch").style.display = "none";
    document.getElementById("studydisplay").style.display = "inline";
    document.getElementById("studytopbits").style.display = "inline";
    document.getElementById("searchresults").style.display = "none";

    // show the whole study div, if just switching to this page
    document.getElementById("study").style.display = 'inline';   
}

shanka.initpractice = function() {
    shanka.inittouchpaint(10);
    
    if ("cardid" in shanka.state && "questionid" in shanka.state) {
        document.getElementById("studycurrent").style.display = "inline";
    } else {
        document.getElementById("studycurrent").style.display = "none";
    }
    
    if ("cardid" in shanka.state) {
        document.getElementById("studyinfo").style.display = "inline";
        document.getElementById("studyedit").style.display = "inline";
        if (is_iOS()) {
            document.getElementById("studyplecotop").style.display = "inline";        
        } else {
            document.getElementById("studyplecotop").style.display = "none";
        }
        
        document.getElementById("study-back-button").style.display = "inline";
        document.getElementById("study-back-button").disabled = shanka.studybackstack.length == 0;
        document.getElementById("study-fwd-button").style.display = "inline";
        document.getElementById("study-fwd-button").disabled = shanka.studyfwdstack.length == 0;
    } else {
        document.getElementById("study-back-button").style.display = "none";
        document.getElementById("study-fwd-button").style.display = "none";
        document.getElementById("studyinfo").style.display = "none";
        document.getElementById("studyedit").style.display = "none";
        document.getElementById("studyplecotop").style.display = "none";        
    }
    
    document.getElementById("practicetext").value = shanka.calculatetraceword();        
    document.getElementById("practicetext").style.display = "inline";
    document.getElementById("practicesearch").style.display = "inline";
    document.getElementById("touchpaintouter").style.display = "inline";
    document.getElementById("canvastoolbar").style.display="block";
    document.getElementById("touchpaintlayers").style.display="block";
    document.getElementById("tracechar").style.display="inline";
    
    shanka.updatecharbutton();
    shanka.updateminitpmorebuttons();
    
    document.getElementById("studytopbits").style.display = "none";
    document.getElementById("answers").style.display = "none";
    document.getElementById("studydisplay").style.display = "none";
    document.getElementById("studypractice").style.display = "none";
    document.getElementById("studysubmit").style.display = "none";
    document.getElementById("searchresults").style.display = "none";
    
    // show the study div
    document.getElementById("study").style.display = 'inline';
}

shanka.initstudyinforelatedcards = function(card) {
    var relatedcards = document.getElementById("relatedcards");
    var lis = relatedcards.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (relatedcards.firstChild) {
        relatedcards.removeChild(relatedcards.firstChild);
    }
    var relatedcardids = shanka.getrelatedcardids(card.cardid);
    for (var i=0, len=relatedcardids.length; i<len; i++) {
        var relatedcardid = relatedcardids[i];
        var relatedcard = shanka.cards[relatedcardid];        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#DESCRIPTION#/g, relatedcard.liststring())
                               .replace(/#ID#/g, relatedcard.cardid.toString());
        relatedcards.appendChild(li);
    }
    
    if (relatedcardids.length == 0) {
        document.getElementById("relatedflashcards").style.display = "none";
    }
}

shanka.initstudyinfocategories = function(card) {
    var categorylist = document.getElementById("categorylist");
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }
    
    for (var i=0, len=card.categoryids.length; i<len; i++) {
        var categoryid = card.categoryids[i];        
        var category = shanka.categories[categoryid];
        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, category.categoryid.toString())
                               .replace(/#NAME#/g, category.name)
                               .replace(/#ITEMS#/g, category.cardids.length.toString());
        categorylist.appendChild(li);
    }
}

shanka.initstudyinfostrokeorder = function(card) {
    var outer = document.getElementById("sorder");
    var divinner = document.getElementById("sorderdiv");
    var template = divinner.innerHTML;
    while (outer.firstChild) {
        outer.removeChild(outer.firstChild);
    }
    
    var script = shanka.getsetting("script");
    var allchars = "";
    var charstouse = "";
    
    if (script == "simplified") {
        allchars = card.simplified;
    } else if (script == "traditional") {
        allchars = card.traditional;
    } else if (script == "simptrad") {
        allchars = card.simplified + card.traditional;
    } else {
        allchars = card.traditional + card.simplified;
    }
    
    for (var i=0, len=allchars.length; i<len; i++) {
        var ch = allchars[i];
        if (!contains(charstouse, ch)) {
            charstouse += ch;
        }
    }
    
    for (var i=0, len=charstouse.length; i<len; i++) {
        var ch = charstouse[i];
        var charencode = encodeURIComponent(ch);
        var div=document.createElement("div");
        div.innerHTML = template.replace(/#CHAR#/g, charencode);
        div.style.display = "none";
        div.classList.add("paddedbox");
        div.id = "sorder-" + charencode;
        outer.appendChild(div);
    }
}

shanka.initstudyinfoetymology = function(card) {
    var outer = document.getElementById("hform");
    var divinner = document.getElementById("hformdiv");
    var template = divinner.innerHTML;
    while (outer.firstChild) {
        outer.removeChild(outer.firstChild);
    }
    
    var script = shanka.getsetting("script");
    var allchars = allchars = card.simplified + card.traditional;
    var charstouse = "";
    
    for (var i=0, len=allchars.length; i<len; i++) {
        var ch = allchars[i];
        if (!contains(charstouse, ch)) {
            charstouse += ch;
        }
    }
    
    for (var i=0, len=charstouse.length; i<len; i++) {
        var ch = charstouse[i];
        var charencode = encodeURIComponent(ch);
        var div=document.createElement("div");
        div.innerHTML = template.replace(/#CHAR#/g, charencode);
        div.style.display = "none";
        div.classList.add("paddedbox");
        div.id = "hform-" + charencode;
        div.width="80";
        div.height="90";
        outer.appendChild(div);
    }
}

shanka.reveal = function() {
    if (document.getElementById("answers").style.display == "none") {
        shanka.state["reveal"] = "true";
        shanka.updateHistoryUrlState(shanka.state, "replace");
    } else {
        shanka.state["reveal"] = "false";
        shanka.updateHistoryUrlState(shanka.state, "replace");
    }
    
    shanka.updateStudyReveal();
}

var studyfields =     ["simplified",
                       "cursive",
                       "callig",
                       "traditional",
                       "pinyin",
                       "definition",
                       "notes"];

var inputfields =     ["draw",
                       "type"];

shanka.studycorrectanswerheight = function() {   
    for (var i = 0, len = studyfields.length; i < len; i++)
    {
        var f = studyfields[i];       
        var answertable = document.getElementById('answertable' + f);
        var answertext = document.getElementById('answertext' + f);
        var rect = answertext.getBoundingClientRect();
        
//        answertable.style.height = rect.height;            
        answertable.style.height = answertext.offsetHeight.toString() + "px";            
//        answertable.offsetHeight  = answertext.offsetHeight.toString() + "px";
    }
}

shanka.updateStudyReveal = function() {
    if ("reveal" in shanka.state && shanka.state["reveal"] == "true") {
        document.getElementById("answers").style.display="block";
        document.getElementById("canvastoolbar").style.display="none";
        document.getElementById("touchpaintlayers").style.display="none";
        document.getElementById("studyreveal").innerHTML = "Hide Answer";
        document.getElementById("tracechar").style.display="none";
        shanka.studycorrectanswerheight();
    } else {
        document.getElementById("answers").style.display="none";
        document.getElementById("canvastoolbar").style.display="block";
        document.getElementById("touchpaintlayers").style.display="block";
        document.getElementById("studyreveal").innerHTML = "Show Answer";
        document.getElementById("tracechar").style.display="inline";
    }
}

shanka.canvasright = function() {
    for (var i=0, len=shanka.minitpdisplayed; i < len; i++) {
        if (shanka.minitps[i] == window.tp.activeChild) {
            if (i+1 < shanka.minitpdisplayed) {
                window.tp.setActive(shanka.minitps[i+1]);
            } else /* if (shanka.state["section"] == "practice")  */{
                window.tp.deselectActiveChild();
                window.tp.activeChild = null;
                window.tp.clear();
                shanka.addminitouchpaint();
                window.tp.setActive(shanka.minitps[shanka.minitpdisplayed-1]);
            } /* else {
                window.tp.pushleftstack(shanka.minitps[0]);
                for (var j=0, jlen=shanka.minitpdisplayed - 1; j<jlen; j++) {
                    window.tp.copychildtochild(shanka.minitps[j+1], shanka.minitps[j]);
                }
                window.tp.clear();
                window.tp.poprightstack(shanka.minitps[shanka.minitpdisplayed-1]);
                window.tp.copyFromChild();    
                shanka.leftminitpindex += 1;
                shanka.updateminitpmorebuttons();
            } */
            break;
        }
    }
}

shanka.canvasleft = function() {
    for (var i=0, len=shanka.minitpdisplayed; i < len; i++) {
        if (shanka.minitps[i] == window.tp.activeChild) {
            if (i > 0) {
                window.tp.setActive(shanka.minitps[i-1]);
            } /* else if (shanka.leftminitpindex > 0) {
                window.tp.pushrightstack(shanka.minitps[shanka.minitpdisplayed-1]);
                for (var j=shanka.minitpdisplayed-1; j>=1; j--) {
                    window.tp.copychildtochild(shanka.minitps[j-1], shanka.minitps[j]);   
                }
                window.tp.clear();
                window.tp.popleftstack(shanka.minitps[0]);                
                window.tp.copyFromChild();    
                shanka.leftminitpindex -= 1;
                shanka.updateminitpmorebuttons();
            } */
            break;
        }
    }
}

shanka.oncolourselected = function() {
    var brushcolour = document.getElementById("tpbrushcolour");    
    brushcolour.style.display = 'none';
    shanka.setsetting("brushcolour", brushcolour.value);
    shanka.writesettings();
    window.tp.brushcolour = "#" + shanka.getsetting("brushcolour")
    shanka.updatebrushcolour();
    var brushcolour = document.getElementById("tpbrushcolour");    
}

shanka.updatebrushcolour = function() {
    var brushcolour = document.getElementById("tpbrushcolour");
    var canvaspenblack = document.getElementById("canvaspenblack");
    var tracechar = document.getElementById("tracechar");
    
    canvaspenblack.style.backgroundColor = brushcolour.style.color;
    canvaspenblack.style.color = brushcolour.style.backgroundColor;
    var colour = brushcolour.style.backgroundColor;
    colour = colour.replace(")", ",0.2)");
    colour = colour.replace("rgb", "rgba");
    tracechar.style.color = colour;
}

shanka.canvaspenblack = function() {
    var brushcolour = document.getElementById("tpbrushcolour");    
    brushcolour.style.display = 'block';
    brushcolour.focus();

    //window.tp.penblack();
    /* document.getElementById("canvaspenblack").style.borderColor = "#c00";
    document.getElementById("canvaspenblack").style.pointerEvents = "none"
    document.getElementById("canvaspenwhite").style.borderColor = "#fff";
    document.getElementById("canvaspenwhite").style.pointerEvents = "" */
}

shanka.gettraceword = function() {
    if (shanka.state["section"] == "study") {
        return shanka.calculatetraceword();
    }
    return document.getElementById("practicetext").value;
}

shanka.calculatetraceword = function() {
    if ("cardid" in shanka.state) {
        var cardid = parseInt(shanka.state["cardid"]);
        var card = shanka.cards[cardid];
        var text = "";
        var script = shanka.getsetting("script");
        if (script == "simptrad" && card.simplified.length && card.traditional.length) {
            text = card.simplified + " " + card.traditional;
        } else if (script == "tradsimp" && card.simplified.length && card.traditional.length) {
            text = card.traditional + " " + card.simplified;
        } else if (script == "simplified" && card.simplified.length) {
            text = card.simplified;
        } else if (script == "traditional" && card.traditional.length) {
            text = card.traditional;
        } else if (card.simplified.length) {
            text = card.simplified;
        } else {
            text = card.traditional;
        } 
        return text;
    }
    return "字";
}



shanka.showcharbutton = function() {
    var index = 0;
    if ("char" in shanka.state) {
        index = parseInt(shanka.state["char"]);
        index++;
    }
    
    var text = shanka.gettraceword();
    if (index >= text.length) {
        delete shanka.state["char"];
    } else {
        shanka.state["char"] = index;    
    }
    shanka.updateHistoryUrlState(shanka.state, "replace");
    shanka.updatecharbutton();
}

shanka.updatecharbutton = function() {
    if ("char" in shanka.state) {
        index = parseInt(shanka.state["char"]);
        var text = shanka.gettraceword();
        var tracechar = text.charAt(index);
        document.getElementById("tracechar").innerHTML = tracechar;
        if (tracechar.length && tracechar != " ") {
            document.getElementById("canvasshowchar").classList.add("clickedsmallb");
        } else {
            document.getElementById("canvasshowchar").classList.remove("clickedsmallb");
        }
    } else {
        document.getElementById("tracechar").innerHTML = "";
        document.getElementById("canvasshowchar").classList.remove("clickedsmallb");
    }
}

shanka.updateminitpmorebuttons = function() {
    if (window.tp && window.tp.leftstack && window.tp.leftstack.length) {
        document.getElementById("leftmoremini").style.display = "inline";
    } else {
        document.getElementById("leftmoremini").style.display = "none";
    }

    if (window.tp && window.tp.rightstack && window.tp.rightstack.length) {
        document.getElementById("rightmoremini").style.display = "inline";
    } else {
        document.getElementById("rightmoremini").style.display = "none";
    }
}


shanka.canvaspenwhite = function() {
    window.tp.penwhite();
    /* document.getElementById("canvaspenwhite").style.borderColor = "#c00";
    document.getElementById("canvaspenwhite").style.pointerEvents = "none"
    document.getElementById("canvaspenblack").style.borderColor = "#fff";
    document.getElementById("canvaspenblack").style.pointerEvents = "" */
}

shanka.canvasundo = function() {
    window.tp.undo();
    shanka.canvasupdateundoredo();
}

shanka.canvasredo = function() {
    window.tp.redo();
    shanka.canvasupdateundoredo();
}

shanka.canvasclear = function() {
    window.tp.clear();
}

shanka.canvasupdateundoredo = function() {
    if (window.tp.canundo()) {
        document.getElementById("canvasundo").style.color = "#000";
        document.getElementById("canvasundo").style.pointerEvents = ""
    } else {
        document.getElementById("canvasundo").style.color = "#888";
        document.getElementById("canvasundo").style.pointerEvents = "none"
    }
    
    if (window.tp.canredo()) {
        document.getElementById("canvasredo").style.color = "#000";
        document.getElementById("canvasredo").style.pointerEvents = ""
    } else {
        document.getElementById("canvasredo").style.color = "#888";
        document.getElementById("canvasredo").style.pointerEvents = "none"
    }
}

shanka.inittouchpaint = function(minicount) {
    if (!window.tp) {
        window.tp = new TouchPaint( "touchpaint" );
    }
    
    window.tp.brushcolour  = "#" + shanka.getsetting("brushcolour");
    window.tp.backgcolour  = "#" + shanka.getsetting("backgcolour");
    window.tp.gridcolour   = "#" + shanka.getsetting("gridcolour");
    window.tp.bordercolour = "#" + shanka.getsetting("bordercolour");
    window.tp.brushwidth   = parseInt(shanka.getsetting("brushwidth"));
   
    window.tp.init({ "width":"280", "height":"280"});

    var brushcolour = document.getElementById("tpbrushcolour");    
    brushcolour.value = shanka.getsetting("brushcolour");

    if (!window.colourpicker) {
        window.colourpicker = new jscolor.color(brushcolour, {"pickerMode":"HVS", "pickerClosable":true});
        window.colourpicker.onclosedcallback = shanka.oncolourselected;
        window.colourpicker.pickerPosition = 'top';
    }
    
    shanka.updatebrushcolour();

    shanka.leftminitpindex = 0;
    shanka.minitpdisplayed = 0;
    
    for (var i=0; i < minicount; i++) {
        shanka.addminitouchpaint();
    }
    shanka.hideremainingminitps(minicount);
    
    // window.tp.canvas.style.width  = '280px';
    // window.tp.canvas.style.height  = '280px';
    window.tp.setActive(shanka.minitps[0]);
    window.tp.copyFromParent();    
    window.tp.clearundohistory();
    window.tp.clearredohistory();

    shanka.canvasupdateundoredo();
    // shanka.canvaspenblack();
}

shanka.addminitouchpaint = function() {
    if (shanka.minitpdisplayed == shanka.minitps.length) {
        var newtc = document.createElement("canvas");
        newtc.ctx = newtc.getContext( "2d" );
        newtc.id = "touchpaintmini" + shanka.minitps.length.toString();
        newtc.width  = 55;
        newtc.height  = 55;
        newtc.className = "touchpaintmini";
        
        var minitouchpaints = document.getElementById("minitouchpaints");
        minitouchpaints.appendChild(newtc);
       
        var newtp = new TouchPaint("touchpaintmini" + shanka.minitps.length.toString());
        newtp.init({ "enabled" : false });
        newtp.setParent(window.tp);
        newtp.copyFromParent();
        shanka.minitps.push(newtp);
    } else {
        var id = "touchpaintmini" + shanka.minitpdisplayed.toString();
        var reusetpel = document.getElementById(id);
        var reusetp = shanka.minitps[shanka.minitpdisplayed];
        reusetp.clear();
        reusetpel.style.display = "inline";
    }
    
    shanka.minitpdisplayed += 1;
}

shanka.hideremainingminitps = function(minicount) {
    for (var i=minicount; i < shanka.minitps.length; i++) {
        var id = "touchpaintmini" + i.toString();
        var reusetpel = document.getElementById(id);
        reusetpel.style.display = "none";
    }
}

shanka.doontouchstart = function(event) {
    var touch = event.touches.item(0);
    var target = event.touches[0].target;
    shanka.doanswerstart(target, true);
    event.preventDefault();
}

shanka.doontouchmove = function(event) {
    var touch = event.touches.item(0);
    var target = document.elementFromPoint(touch.screenX, touch.screenY);
    shanka.doanswermove(target, true);
    event.preventDefault();
}

shanka.doontouchend = function(event) {
    shanka.doanswerend();
    event.preventDefault();
};


shanka.doansweronmousedown = function(event) {
    shanka.doanswerstart(event.target, false);
    event.preventDefault();
}

shanka.doansweronmouseover = function(event) {
    shanka.doanswermove(event.target, false);
}

shanka.doansweronmouseup = function(event) {
    shanka.doanswerend();
}

shanka.answertouchstarted = false;
shanka.answermovelastover = null;

shanka.doanswerstart = function(target, touch) {
    if (target && target.className.slice(0, "answerbtn".length) == "answerbtn") {
        shanka.answertouchstarted = true;
        shanka.doanswermove(target, touch);
    }
}

shanka.doanswermove = function(target, touch) {
    if (   target
        && shanka.answertouchstarted
        && shanka.answermovelastover != target
        && target.className.slice(0, "answerbtn".length) == "answerbtn")
    {
        var touchmovegroup = target.id.slice(0, -1);
        var field = touchmovegroup.slice("answerbtn".length);
        var index = parseInt(target.id.slice(-1));

        shanka.answermovelastover = target;        
        shanka.state[field] = index;    
        shanka.updateHistoryUrlState(shanka.state, "replace");
        
        shanka.selectanswer(field, index);
    }
}

shanka.selectanswer = function(field, index, touch) {
    var element1 = document.getElementById("answerbtn" + field + "1");
    var element2 = document.getElementById("answerbtn" + field + "2");
    var element3 = document.getElementById("answerbtn" + field + "3");
    var element4 = document.getElementById("answerbtn" + field + "4");
    var element5 = document.getElementById("answerbtn" + field + "5");
    var target   = document.getElementById("answerbtn" + field + index.toString());
    
    element1.classList.remove("answerbtnsel1")
    element2.classList.remove("answerbtnsel2")
    element3.classList.remove("answerbtnsel3")
    element4.classList.remove("answerbtnsel4")
    element5.classList.remove("answerbtnsel5")
    
    var classstart = touch ? "answerbtntouch" : "answerbtn";
    
    if (element1 != target && element1.className != classstart + "1") element1.classList.add(classstart + "1");
    if (element2 != target && element1.className != classstart + "2") element2.classList.add(classstart + "2");
    if (element3 != target && element1.className != classstart + "3") element3.classList.add(classstart + "3");
    if (element4 != target && element1.className != classstart + "4") element4.classList.add(classstart + "4");
    if (element5 != target && element1.className != classstart + "5") element5.classList.add(classstart + "5");
    
    target.classList.remove("answerbtntouch" + index);
    target.classList.remove("answerbtn" + index);
    target.classList.add("answerbtnsel" + index);
    
    var answertext = document.getElementById('answertext' + field);        
    if (index == 1) {
        answertext.style.background = "#f3abab";
    } else if (index == 2) {
        answertext.style.background = "#f5c595";
    } else if (index == 3) {
        answertext.style.background = "#ece599";
    } else if (index == 4) {
        answertext.style.background = "#bbe3b6";
    } else {
        answertext.style.background = "#a5d2eb";
    } 
    
    if (shanka.allanswerschosen()) {
        document.getElementById("studysubmit").style.display = "block";
        document.getElementById("studysubmit").classList.remove("disabled");
    }
}

shanka.doanswerend = function() {
    WaitCursorOn();
    try
    {
        shanka.answertouchstarted = false;
        shanka.answermovelastover = null;
        
        if (shanka.getsetting("autoadvance") == "true" && shanka.allanswerschosen()) {
            shanka.studysubmit();
        }
    }
    catch(err)
    {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
}

shanka.allanswerschosen = function() {
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var questionid = parseInt(shanka.state["questionid"]);
    var question = shanka.questions[questionid];

    var allanswers = true;
    for (var i = 0, len = question.answer.length; i < len; i++)
    {
        var f = question.answer[i];       
        if (!(f in shanka.state)) {
            allanswers = false;
            break;
        }
    }
    
    return allanswers;
}

shanka.studysubmit = function() {
    WaitCursorOn();
    try
    {
        var cardid = parseInt(shanka.state["cardid"]);
        var card = shanka.cards[cardid];
        var questionid = parseInt(shanka.state["questionid"]);
        var question = shanka.questions[questionid];
        var known_kn_rate = shanka.algorithm.getdata("known_kn_rate");
        var kn_before = card.kn_rate;
        
        shanka.algorithm.setcardscore(card, question, shanka.state);
        
        var now = new Date();
        var timeStudied = 0;
        
        if (shanka.studystarttime) {        
            timeStudied = now.getTime() - shanka.studystarttime.getTime();
            timeStudied = Math.max(timeStudied, 60 * 1000); // max it at 1 minute
        }

        var known_increment = 0;

        if (card.kn_rate > known_kn_rate && kn_before <= known_kn_rate) {
            known_increment = 1;
        } else if (card.kn_rate <= known_kn_rate && kn_before > known_kn_rate) {
            known_increment = -1;
        }
        
        shanka.updateCurrentProgress(timeStudied, known_increment);
        
        shanka.showstudy();
    }
    catch(err)
    {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
}

shanka.studyinfo = function () {
    if ("cardid" in shanka.state) {
        var state = JSON.parse(JSON.stringify(shanka.state));
        state["section"] = "info";
        shanka.navigate(state);
    }
} 

shanka.showcardinfo = function (cardid) {
    shanka.navigate({"section" : "info", "cardid" : cardid.toString()});
}


shanka.showstudy = function() {
    WaitCursorOn();
    try
    {    
        var cardquestion = shanka.algorithm.getnextcardquestion();
        var card = cardquestion[0];
        var question = cardquestion[1];
        
        if (card && question) {
            shanka.navigate({"section" : "study", "cardid" : card.cardid.toString(), "questionid" : question.questionid.toString()})
        } else {
            alert(STR.study_no_cards_questions_use_wizard_error);
            
            if (!card && !question) {
                shanka.showmain();
            } else if (!card) {
                shanka.showimport();
            } else {
                shanka.wizard();
            }
        }
    }
    catch(err)
    {
        ExceptionError("showstudy", err);
    }
    WaitCursorOff();
}


shanka.studycurrent = function () {
    WaitCursorOn();
    try
    {
        if (   "cardid" in shanka.state
            && "questionid" in shanka.state) {
            var state = JSON.parse(JSON.stringify(shanka.state));
            state["section"] = "study";
            shanka.navigate(state);
        }
    }
    catch(err)
    {
        ExceptionError("studycurrent", err);
    }
    WaitCursorOff();
} 



shanka.studypractice = function () {
    if ("cardid" in shanka.state) {
        var state = JSON.parse(JSON.stringify(shanka.state));
        state["section"] = "practice";        
        shanka.navigate(state);
    }
} 

shanka.freepractice = function () {
    shanka.navigate({"section" : "practice"});
} 

shanka.studyedit = function () {
    if ("cardid" in shanka.state) {
        var cardid = parseInt(shanka.state["cardid"]);
        shanka.navigate({"section" : "card", "cardid" : cardid.toString()});
    }
} 

shanka.studypleco = function () {
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var hanzi = card.simplified;
    if (!hanzi.length) {
        hanzi = card.traditional;
    }
    
    // don't 
    var url = "plecoapi://x-callback-url/s?q=" + encodeURIComponent(hanzi);
               // + "&x-source=Shanka%20Flaschards&x-success="
               // + encodeURIComponent(document.URL);
               
    window.location.href = url;    
}

shanka.studyback = function() {
    if (shanka.studybackstack.length) {
        shanka.studyfwdstack.push(shanka.state);
        var state = shanka.studybackstack.pop();
        state["fwdback"] = "true";
        shanka.navigate(state);
    }
}

shanka.studyforward = function() {
    if (shanka.studyfwdstack.length) {
        shanka.studybackstack.push(shanka.state);
        var state = shanka.studyfwdstack.pop();
        state["fwdback"] = "true";
        shanka.navigate(state);
    }
}

shanka.practicesearch = function() {
    var searchresults = document.getElementById("searchresults");
    var practicetext = document.getElementById("practicetext");
    var results = shanka.searchcards(practicetext.value);

    // hide touchpaint
    document.getElementById("touchpaintouter").style.display = "none";
    
    // empty results lists
    var resultslist = document.getElementById("searchresultslist")
    while (resultslist.firstChild) {
        resultslist.removeChild(resultslist.firstChild);
    }
    searchresults.style.display = "block";

    if (results.length == 0) {
        var li=document.createElement("li");
        li.innerHTML = STR.study_search_no_results;
        resultslist.appendChild(li);
    } else if (results.length == 1) {
        var card = results[0];
        shanka.showcardinfo(card.cardid);
    } else {
        for (var i=0, len=results.length; i<len; i++) {
            var card = results[i];
            
            var a=document.createElement("a");
            a.href="javascript:shanka.showcardinfo(" + card.cardid.toString() + ");";
            
            var text = document.createTextNode(card.liststring());
            a.appendChild(text);
            
            var chevron=document.createElement("span");
            chevron.classList.add("chevron");
            a.appendChild(chevron);

            var li=document.createElement("li");
            li.appendChild(a);
            
            resultslist.appendChild(li);
        }
    }
}

shanka.searchcards = function(text) {
    text = text.toLowerCase();

    var results = [];
    
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (   card.simplified.toLowerCase().search(text) != -1
            || card.traditional.toLowerCase().search(text) != -1
            || card.pinyin.toLowerCase().search(text) != -1) {
            results.push(card);
        }
    }
    
    if (results.length == 0) {
        for (var cardidstr in shanka.cards) {
            var card = shanka.cards[cardidstr];
            if (   card.getdefinition().toLowerCase().search(text) != -1
                || card.getnotes().toLowerCase().search(text) != -1) {
                results.push(card);
            }
        }
    }

    return results;
}
