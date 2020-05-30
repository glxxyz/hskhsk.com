/*
    Shanka HSK Flashcards - category.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// category is for category lists

function Category () {
    this.categoryid = 0;
    this.name = STR.category_new_name;
    this.cardids = []; // [1, 2 ...]
};

// ---------------------------
// Category methods

Category.prototype.write = function() {
    localStorage["c" + this.categoryid.toString(36)] = shanka.compress(JSON.stringify(this));
}

Category.prototype.del = function() {
    for (var i=0, cardlen=this.cardids.length; i<cardlen; i++) {
        var cardid = this.cardids[i];
        var card = shanka.cards[cardid];
        for (var j=0, catlen=card.categoryids.length; j<catlen; j++) {
            var categoryid = card.categoryids[j];
            if (categoryid == this.categoryid) {
                card.categoryids.splice(j, 1);
                card.write();
                break;
            }
        }
    }
    
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        for (var j=0, catlen=lesson.categoryids.length; j<catlen; j++) {
            if (lesson.categoryids[j] == this.categoryid) {
                lesson.categoryids.splice(j, 1);
                lesson.write();
                break;
            }
        }
    }
    
    delete shanka.categories[this.categoryid];
    
    localStorage.removeItem("c" + this.categoryid.toString(36));
}



shanka.getuniquecategoryname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var categoryidstr in shanka.categories) {
            if (shanka.categories[categoryidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " ("+i.toString()+")";
            i++;
        }
    }
    return newname;
}

// Add Category Section

shanka._addcategory = function() {
    var newcategory = new Category();
    newcategory.name = document.getElementById("addcategoryname").value;
    
    if (newcategory.name == "") {
        alert(STR.category_must_enter_name_error);
        return false;
    }
    
    for (var categoryidstr in shanka.categories)
    {
        var category = shanka.categories[categoryidstr];
        
        if (category.name == newcategory.name) {
            alert(STR.category_name_exists_error);
            return false;
        }
    }

    newcategory.categoryid = shanka.getnextguid();       
    shanka.categories[newcategory.categoryid] = newcategory;
    
    shanka.addnewcategorytolessons(newcategory.categoryid);
    
    newcategory.write();
    shanka.setsetting("lastcategoryid", newcategory.categoryid);
    return true;
}

// Categories Section

shanka.categorysort = function(left, right) {
    if (left == 0) return -1;
    else if (right == 0) return 1;
    return shanka.categories[left].name.localeCompare(shanka.categories[right].name);
}

shanka.initcategories = function() {

    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text; 
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text; 
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 

    shanka.initcategorylist(false, true);
}

shanka.initeditcategories = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text; 
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 

    shanka.initcategorylist(true, false);
}

shanka.initcategorylist = function(addonclick, displayuncat) {
    var categorylist = document.getElementById("categorylist")
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }
    
    var categoryidssorted = []
    
    for (var categoryidstr in shanka.categories) {
        if (parseInt(categoryidstr) > 0 || displayuncat) {
            categoryidssorted.push(parseInt(categoryidstr));
        }
    }
    
    categoryidssorted.sort(shanka.categorysort);
    
    for (var i=0, len=categoryidssorted.length; i<len; i++) {
        var categoryid = categoryidssorted[i];
        
        var category = shanka.categories[categoryid];
        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, category.categoryid.toString())
                               .replace(/#NAME#/g, category.name)
                               .replace(/#ITEMS#/g, category.cardids.length.toString());
        categorylist.appendChild(li);
        if (addonclick) {
            li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
        }
    }
}

shanka.initaddcategory = function() {
    document.getElementById("category_name_label").innerHTML = STR.category_name_label; 
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
}

shanka.initeditcategory = function(categoryid) {
    document.getElementById("category_name_label").innerHTML = STR.category_name_label; 
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 

    var category = shanka.categories[categoryid];
    document.getElementById("editcategoryname").value = category.name;
}

shanka.initshowcategory = function(categoryid, addonclick, showall) {
    document.getElementById("category_edit_name").innerHTML = STR.category_edit_name; 
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text; 
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text; 
    // document.getElementById("category_edit_name2").innerHTML = STR.category_edit_name; 
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text; 
    document.getElementById("gen_remove_text").innerHTML = STR.gen_remove_text; 
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_remove_text2").innerHTML = STR.gen_remove_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    
    var cards = document.getElementById("cards")
    var lis = cards.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (cards.firstChild) {
        cards.removeChild(cards.firstChild);
    }
    
    if (categoryid in shanka.categories)
    {
        var cardids = [];
        var category = shanka.categories[categoryid];
        
        shanka.setpagetitle(category.name);
        
        if (categoryid >= 0) {
            for (var i=0, len=category.cardids.length; i<len; i++) {
                cardids.push(category.cardids[i]);
            }
        } else {
            for (var cardidstr in shanka.cards) {
                cardids.push(parseInt(cardidstr));
            }
        }
        
        if (showall) {
            // Add an 'all' element
            var li=document.createElement("li");    
            li.innerHTML = template.replace(/#ID#/g, -1)
                                   .replace(/#DESCRIPTION#/g, "<strong>" + STR.category_all_name + "</strong>");
            for (var i=0, len=li.children.length; i<len; i++) {
                if (li.children[i].classList.contains('toggle')) {
                    li.children[i].classList.add("all");
                }
            }
            
            cards.appendChild(li);
            if (addonclick) {
                li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
            }
        }

        var filteredcardids = shanka.filterlistpages(cardids);
    
        for (var i=0, len=filteredcardids.length; i<len; i++)
        {
            var cardid = filteredcardids[i];
            var card = shanka.cards[cardid];
            var li=document.createElement("li");    
            li.innerHTML = template.replace(/#ID#/g, cardid)
                                   .replace(/#DESCRIPTION#/g, card.liststring());
            cards.appendChild(li);
            if (addonclick) {
                li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
            }
        }
    }
}

shanka.showcategories = function() {
    shanka.navigate({"section" : "categories"});
}

shanka.showcategory = function(categoryid) {
    shanka.navigate({"section" : "category", "categoryid" : categoryid});
}

shanka.showcurrentcategory = function(categoryid) {
    if ("categoryid" in shanka.state) {
        shanka.navigate({"section" : "category", "categoryid" : shanka.state["categoryid"]});
    }
}

shanka.editcategory = function(categoryid) {
    shanka.navigate({"section" : "editcategory", "categoryid" : shanka.state["categoryid"]});
}

shanka.dosavecategory = function(categoryid) {
    WaitCursorOn();
    try
    {
        var categoryid = parseInt(shanka.state["categoryid"]);
        var category = shanka.categories[categoryid];
        var newname  = document.getElementById("editcategoryname").value;

        if (!newname) {
            alert(STR.category_must_enter_name_error);
            return;
        }
        
        for (var itercatidstr in shanka.categories) {
            var itercat = shanka.categories[itercatidstr];
            if (parseInt(itercatidstr) != categoryid && itercat.newname == newname) {
                alert(STR.category_name_exists_error);
                return;
            }
        }
        
        category.name = newname;
        category.write();
        
        shanka.showcurrentcategory();
        shanka.addtoresult(STR.category_saved_format.replace("{0}", category.name));
    }
    catch(err)
    {
        ExceptionError("dosavecategory", err);
    }
    WaitCursorOff();
}

shanka.getallactivecategoryidsdict = function(foradding) {
    // build a list of all categories that are part of enabled lessons
    var categoryids = {};
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        // if we are adding, ignore lessons in 'review mode'
        if (lesson.enabled && (!foradding || !lesson.reviewmode)) {
            for (var i= 0, len = lesson.categoryids.length; i<len; i++) {
                var categoryid = lesson.categoryids[i];
                categoryids[categoryid] = true;
            }
        }
    }
    return categoryids;
}

shanka.getallactivecategoryidslist = function(foradding) {
    var categoryidslist = [];
    var categoryidsdict = shanka.getallactivecategoryidsdict(foradding);
    for (var categoryidstr in categoryidsdict) {
        categoryidslist.push(parseInt(categoryidstr));
    }
    return categoryidslist;
}

shanka.getallactivequestionidsdict = function() {
    var questionids = {};    
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        if (lesson.enabled) {
            for (var i= 0, len = lesson.questionids.length; i<len; i++) {
                var questionid = lesson.questionids[i];
                questionids[questionid] = true;
            }
        }
    }
    return questionids;
}

shanka.getallactivequestionidslist = function() {
    var questionidslist = [];
    var questionidsdict = shanka.getallactivequestionidsdict();
    for (var questionidstr in questionidsdict) {
        questionidslist.push(parseInt(questionidstr));
    }
    return questionidslist;
}

shanka.editcategories = function() {
    shanka.navigate({"section" : "editcategories"})
}

shanka.doduplicatecategories = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.category_duplicate_sel_confirm)) {
            var categoryids = Object.keys(shanka.categories)
            var i = categoryids.length;
            while (i--) {
                var categoryid = categoryids[i];
               
                var toggle = document.getElementById("categoryselected" + categoryid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var category = shanka.categories[categoryid];
                    var newcategory = JSON.parse(JSON.stringify(category)); // copy
                    newcategory.__proto__ = Category.prototype;
                    newcategory.categoryid = shanka.getnextguid();
                    newcategory.name = shanka.getuniquecategoryname(category.name); 
                    newcategory.current = false;
                    shanka.categories[newcategory.categoryid] = newcategory;
                    
                    for (var j=0, cardslen=newcategory.cardids.length; j<cardslen; j++) {
                        var cardid = newcategory.cardids[j];
                        var card = shanka.cards[cardid];
                        card.categoryids.push(newcategory.categoryid);
                        // no need to write; category ids aren't stored
                    }
                    
                    shanka.addnewcategorytolessons(newcategory.categoryid);
                    
                    newcategory.write();
                    count++;
                }
            }
        
            shanka.editcategories();
            shanka.addtoresult(STR.category_duplicated_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("duplicatecategories", err);
    }
    WaitCursorOff();
}

shanka.dodeletecategories = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.category_delete_selected_confirm)) {
            var categoryids = Object.keys(shanka.categories)
            var i = categoryids.length;
            while (i--) {
                var categoryid = categoryids[i];
                var category = shanka.categories[categoryid];
                
                var toggle = document.getElementById("categoryselected" + categoryid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    category.del();
                    count++;
                }
            }
            
            shanka.editcategories();
            shanka.addtoresult(STR.category_deleted_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("deletecategories", err);
    }
    WaitCursorOff();
}

shanka.addnewcategorytolessons = function(categoryid) {
    // add this category to any lessons flagged 'all'
    for (var lessonidstr in shanka.lessons) {
        var lessonid = parseInt(lessonidstr);
        var lesson = shanka.lessons[lessonid];
        if (lesson.allcategories) {
            lesson.categoryids.push(categoryid);
            lesson.write();
        }
    }
}
