/*
    Shanka HSK Flashcards - ratchet.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Initialisation code from the HTML file

// Helper
var $ = function(id){
    return document.getElementById(id);
}

// Instance
var snapper = new Snap({
    element: document.getElementById('content'),
    disable: 'right'
})

// 
var UpdateDrawers = function(){
    var state = snapper.state(),
        towards = state.info.towards,
        opening = state.info.opening;
    if(opening=='right' && towards=='left'){
        $('left-drawer').classList.remove('active-drawer');
    } else if(opening=='left' && towards=='right') {
        $('left-drawer').classList.add('active-drawer');
    }
}

snapper.on('drag', UpdateDrawers);
snapper.on('animating', UpdateDrawers);
snapper.on('animated', UpdateDrawers);

$('toggle-left').addEventListener('click', function(){
    shanka.showsidebarmenu();
});

$('help-button').addEventListener('click', function(){
    shanka.showhelp();
});

// appscroll 
var scroller = new AppScroll({
    toolbar: document.getElementsByClassName('bar-title')[0],
    scroller: document.getElementsByClassName('content')[0]
});
scroller.on();



shanka.switchtab = function(tabbutton, targetid) {

    var ul = tabbutton.parentElement;
    for (var i=0, len=ul.children.length; i<len; i++) {
        var li = ul.children[i];
        if (li.id == tabbutton.id ) {
            li.classList.add('active');
        } else /* if (li.nodeType == 1 && li.tagName.toLowerCase() == "li") */ {
            li.classList.remove('active');
        }
    }

    var target = document.getElementById(targetid);
    var ul = target.parentElement;
    for (var i=0, len=ul.children.length; i<len; i++) {
        var li = ul.children[i];
        if (li.id == target.id ) {
            li.classList.add('active');
        } else /* if (li.nodeType == 1 && li.tagName.toLowerCase() == "li") */ {
            li.classList.remove('active');
        }
    }
}

shanka.toggle = function(tbutton) {
    if (tbutton.classList.contains('radio') ) {
        shanka.toggleradio(tbutton);
    }
    else if (tbutton.classList.contains('check') ) {
        shanka.togglecheck(tbutton);
    }
    else if (tbutton.classList.contains('active')) {
        tbutton.classList.remove('active');
    } else {
        tbutton.classList.add('active');
    }
}

shanka.togglechild = function(item) {
    if (   item.classList.contains('toggle')
        && !item.classList.contains('disabled')) {
        shanka.toggle(item);
    } else {
        for (var i=0, len=item.children.length; i<len; i++) {
            if (   item.children[i].classList.contains('toggle')
                && !item.children[i].classList.contains('disabled')) {
                shanka.toggle(item.children[i]);
            }
        }
    }
}

shanka.toggleradio = function(tbutton) {
    var active = tbutton.classList.contains("active");
    var group = tbutton.parentElement;
    while (group && !group.classList.contains("radiogroup")) {
        // if any parent element is disabled, just return without any action
        if (group.classList.contains("disabled")) {
            return;
        }
        group = group.parentElement;
    }
    
    if (group) {
        for (var i=0, len=group.children.length; i<len; i++) {
            var groupchild = group.children[i];
            if (groupchild.classList.contains('toggle')) {
                groupchild.classList.remove('active');
            }
            for (var j=0, lilen=groupchild.children.length; j<lilen; j++) {
                if (groupchild.children[j].classList.contains('toggle')) {
                    groupchild.children[j].classList.remove('active');
                }
            }
        }
    }

    var deselectallowed = tbutton.classList.contains("deselectallowed");

    if (!active) {
        tbutton.classList.add("active");
    } else if (deselectallowed) {
        tbutton.classList.remove("active"); 
    }
}

shanka.togglecheck = function(tbutton) {
    var disabled = tbutton.parentElement.classList.contains("disabled");
    if (disabled) {
        return;
    }
    
    var active = tbutton.classList.contains("active");
    var all = tbutton.classList.contains("all");
    var ul = tbutton.parentElement.parentElement;
    var allbutton = null;
    var allactive = true;
    
    if (!all) {
        if (active) {
            tbutton.classList.remove('active');
        } else {
            tbutton.classList.add('active');
        }
    }
    
    for (var i=0, len=ul.children.length; i<len; i++) {
        var li = ul.children[i];
        for (var j=0, lilen=li.children.length; j<lilen; j++) {
            if (li.children[j].classList.contains('toggle') ) {
                if (all && active) {
                    li.children[j].classList.remove('active');
                } else if (all){
                    li.children[j].classList.add('active');
                } else {
                    if (li.children[j].classList.contains('all') ) {
                        allbutton = li.children[j];
                    } else {
                        allactive = allactive && li.children[j].classList.contains('active');
                    }
                }
            }
        }
    }
    
    if (allbutton) {
        if (allactive) {
            allbutton.classList.add('active');
        } else {
            allbutton.classList.remove('active');
        }
    }
}
