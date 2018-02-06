
$(document).ready(function(){
    console.log('login.js')
    var username;
    $("#submit").click(function(){
        username = $("#username").val();
        $.post("/",{username:username,},function(data){        
            if(data==='done')           
            {
                // Redirect to game page
                window.location.href="/game";
            }
        });
    });
});