alert("test");


lang_spanish = function() {
    this.hello_msg = "hola";
}

lang_english = function() {
    this.hello_msg = "hello";
    this.goodbye_msg = "goodbye";
}

function language() {
    this.get_str = function(id) {
        var en = new lang_english();
        var es = new lang_spanish();
        
        for (var prop in en) {
            alert("prop" + prop);
        }
        
        if (es.hasOwnProperty(id)) {
            return es[id];
        }
        
        if (en.hasOwnProperty(id)) {
            return en[id];
        }
    }
    
    this.define_str = function(id) {
        Object.defineProperty(this, id,
        {
            get : function() { return this.get_str(id); }
        });
    }
    
    this.define_str("hello_msg");
    this.define_str("goodbye_msg");
}


var STR = new language();

alert(STR.hello_msg);
alert(STR.goodbye_msg);