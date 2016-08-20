$(document).ready(function () {   
    
    /*
    * User clicks on message window
    * If it has an ID (if it is a dialogue) initiate addSignture
    * If it has no ID (if it is a reply) create ID and initiate addSignature
    */  
    $('body').on('click', '.inboxsdk__compose', function () {
        if($(this).attr('id') === undefined){
            $(this).attr('id', 'gm-signature1');   
        }
        addSignature($(this).attr('id'));
    });
});
function addSignature(dialogue_id) { 
    console.log('add signature');  

    // Get the email selected by the user
    var id = dialogue_id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
    var string = $('#' + id + ' div[role="button"][tabindex="1"] span').text();
    var email = string.substring(string.lastIndexOf("<") + 1, string.lastIndexOf(">"));

    // Get the signature URL which matches the selected email
    chrome.storage.sync.get(null, function (obj) {
        var url = null;
        var data = obj.data;
        var messageBody = 'div[aria-label="Message Body"]';
        

        $(data).each(function (i, v) {
            if (v.email == email) {
                url = v.url;
            }
        }); 

        var messageTo = 'div[aria-label="To]';  
        var emailList = [];

        $(data).each(function (i, v) {
            emailList[emailList.length] = $(v).html();
        }); 

        if(url === null) {   

            // If no signature URL set remove any existing one
            $('#' + id + ' ' + messageBody + ' *[align="gm-signature"]').html('mi-mi-mi');
            $('#' + id + ' ' + messageBody + ' *[align="gm-signature-br"]').remove();

        } else {           

            // Create signature container if one doesn't currently exist
            if($('#' + id + ' ' + messageBody + ' *[align="gm-signature"]').length === 0) {
                $('#' + id + ' ' + messageBody).append('<br align="gm-signature-br"><br align="gm-signature-br"><div align="gm-signature" contenteditable="false"/>');
            }         

            // If the user has selected a different email mark it as unset, in need of updating
            if(window.gmLastUrl != url){
                $('#' + id + ' ' + messageBody + ' *[align="gm-signature"]').removeAttr('width');
            }       

            // If signature container marked as not set add 'loading' styles and fetch signature from URL
            if($('#' + id + ' ' + messageBody + ' *[align="gm-signature"][width="gm-set"]').length === 0){

                chrome.runtime.sendMessage({url: url , mail_to: emailList }, 
                    function(response) {
                        if (response.status){

                            $('#' + id + ' ' + messageBody + ' *[align="gm-signature"]').attr('height', 'gm-loading').html(response.content);
                            $('#' + id + ' ' + messageBody + ' *[align="gm-signature"]').removeAttr('height', 'gm-loading').attr('width', 'gm-set');
                            
                            window.gmLastUrl = url;
                        }
                });
            }

        }
    });
}