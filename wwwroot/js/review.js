﻿//increase the height of the review input when clicked
$(document).on("click", "#review-text", function (e) {
    $(this).css("height", "250px")
});


//Start Post a new review - Only available when user is logged in
$(document).unbind().on("click", "#submit-review", function (e) {

    //Dont save review if user not entered any text!
    if ($("#review-text").val().length === 0) {
        $("#jnotify-message").empty().append(
            `<div>Enter your review first!</div>
                    <span class="notify-message-close-wrapper" id="notify-message-close-wrapper"><i class="notify-message-close-icon" id=""></i></span>`
        );
        $("#clist-add-notify").slideDown(320);
        $('#clist-add-notify').delay(2000).slideUp(320);
    } else {
        var data = $("#submitForm").serialize();
        console.log(data);

        //alert(data);
        $.ajax({

            type: 'POST',
            url: '/Review/Review',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
            data: data,
            success: function (data, result) {
                //alert('Successfully received Data ');
                console.log(result);
                if (data != '') {

                    $(".review-ajax-container > #post-review").append(data);
                    $("#submitForm").remove();
                    //scroll to the review
                    $("html").animate(
                        {
                            scrollTop: $("#user-review-section").offset().top
                        },
                        800 //speed
                    );
                    //notify user
                    console.log("Your review saved!");

                    $("#jnotify-message").empty().append(
                        `<div>Your review of <strong>` + $(".movie-header-title").text() + `</strong> is saved!</div>
                    <span class="notify-message-close-wrapper" id="notify-message-close-wrapper"><i class="notify-message-close-icon" id=""></i></span>`
                    );
                    $("#clist-add-notify").delay(1400).slideDown(320);
                    $('#clist-add-notify').delay(3000).slideUp(320);
                    //end notify user

                    $("#post-review").fadeIn(500);
                    $("#no-review-yet").fadeOut(1000);

                }
            },
            error: function () {
                //alert('Failed to receive the Data');
                console.log('Failed ');
            }
        })
    }
    
});
//END Post review

//START EDIT review
//Only available when user is logged in
//first clicking edit button: only append the text area
//then clicking save: send Model.UserReview.Id
$(document).on("click", "#edit-review:not('.no-edit')", function (e) {
    //existingText = "Old review.";
    
    //$('#editForm').remove();
    var self = $(this);
    var id = $(".user-existing-review-id").val();

    var data = "reviewId=" + id;
    console.log("Edit started!");
    console.log(data);
    //alert(data);

    $.ajax({

        type: 'POST',
        url: '/Review/BeginEditReview',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
        data: data,
        success: function (data, result) {
            //alert('Successfully received Data ');
            console.log(result);
            if (data != '') {
                //$("#submitForm").hide();
                $("#edit-review-container").append(data);
                
                //$("#delete-edit-review").show();
                $("#cancel-edit-review").show();
                $("#user-existing-review").hide();
                $("#user-existing-review-stats").hide()
                self.addClass("no-edit");
                self.val("Save");
                //scroll to the review
                $("html").animate(
                    {
                        scrollTop: $("#user-review-wrapper").offset().top
                    },
                    100 //speed
                );

                //Save the existing review in this variable - we will check if the user has made any changes
                existingText = document.getElementById('review-text-edit').value;
                console.log(existingText);

                $('#review-text-edit').focus();
                
                //notify user
                console.log("Your review is to be edited!");



                //$("#jnotify-message").empty().append("<div>You review of <strong>" + $(".movie-header-title").text() + "</strong> is saved!</div>");
                //$("#clist-add-notify").delay(1400).slideDown(320);
                //$('#clist-add-notify').delay(5000).slideUp(320);
                //end notify user

                //$("#post-review").fadeIn(500);
                //$("#no-review-yet").fadeOut(1000);

            }
        },
        error: function () {
            //alert('Failed to receive the Data');
            console.log('Failed ');
        }
    });

});


//cancel editing review
$(document).on("click", "#cancel-edit-review", function (e) {

    var id = $("#editForm").serialize();

    var data = id;
    console.log("Edit canceled!");
    console.log(data);

    $.ajax({

        type: 'POST',
        url: '/Review/CancelReview',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
        data: data,
        success: function (data, result) {
            console.log(result);
            if (data != '') {
                $(".review-ajax-container > #post-review").append(data);
                $("#edit-review").removeClass("no-edit");
                $("#edit-review").val("Edit");
                
                //remove the textareaeditForm
                $('#user-review-wrapper').remove();
                //notify user
                console.log("Your review edit canceld!");
            }
        },
        error: function () {
            //alert('Failed to receive the Data');
            console.log('Failed ');
        }
    });

});
//END cancel editing review

//Save changes (after editing)
$(document).on("click", "#edit-review.no-edit", function (e) {
    //Get the current value of the textarea to check if the user has any changes
    var newText = document.getElementById('review-text-edit').value;

    //If user has not made any change, there is no need to update the review!
    if (existingText === newText) {
        //console.log($("#review-text-edit").text());
        $("#jnotify-message").empty().append(
            `<div>You have made no changes to save!</div>
            <span class="notify-message-close-wrapper" id="notify-message-close-wrapper"><i class="notify-message-close-icon" id=""></i></span>`
        );
        $("#clist-add-notify").slideDown(320);
        $('#clist-add-notify').delay(2000).slideUp(320);
        console.log("you made no changes!");
    } else {
        var self = $(this);
        //var id = $("#user-review-id").val();
        var data = $("#editForm").serialize();

        //var data = "reviewId=" + id;
        console.log("Edit started!");
        console.log(data);

        $.ajax({

            type: 'POST',
            url: '/Review/UpdateReview',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
            data: data,
            success: function (data, result) {
                //alert('Successfully received Data ');
                console.log(result);
                if (data != '') {
                    //$("#submitForm").hide();
                    $(".review-ajax-container > #post-review").append(data);

                    //$("#edit-review-container").append(data);
                    //$("#user-existing-review").hide();

                    self.removeClass("no-edit");
                    //remove the textareaeditForm
                    $('#user-review-wrapper').remove();
                    self.val("Edit");
                    //scroll to the review
                    $("html").animate(
                        {
                            scrollTop: $("#user-review-wrapper").offset().top
                        },
                        800 //speed
                    );

                    //notify user
                    console.log("Your review is to be edited!");

                    $("#jnotify-message").empty().append(
                        `<div>Your review of <strong>` + $(".movie-header-title").text() +
                        `</strong> is updated!</div><span class="notify-message-close-wrapper" id="notify-message-close-wrapper">
                    <i class="notify-message-close-icon" id=""></i></span>`);

                    $("#clist-add-notify").delay(1400).slideDown(320);
                    $('#clist-add-notify').delay(3000).slideUp(320);
                    //end notify user

                    //$("#post-review").fadeIn(500);
                    //$("#no-review-yet").fadeOut(1000);

                }
            },
            error: function () {
                //alert('Failed to receive the Data');
                console.log('Failed ');
            }
        });
    }

});
//END Save changes 

//START EDIT review

//increase the height of the review input when user focused on it -- when editing a review
$(document).on("focus", "#review-text-edit", function (e) {
    $(this).css("height", "400px")
});


//Delete review
$(document).on("click", "#delete-edit-review", function (e) {
    //user-review-id
    $.confirm({
        'title': 'PLEASE CONFIRM',
        'message': 'Are you sure you want to delete this review?',
        'buttons': {
            'DELETE': {
                'class': 'confirm-delete',
                'action': function () {
                    //actaul delete
                    //Get movie id
                    var formfield1 = $('#movie-id').serialize();
                    //Get review information
                    var formfield2 = "UserReview.Id=" + $(".user-existing-review-id").val();

                    var seializedTwoFields = formfield1 + '&' + formfield2;

                    //var self = $(this);
                    //var id = $("#user-review-id").val();

                    var data = seializedTwoFields;
                    console.log("Review deletion!");
                    console.log(data);

                    $.ajax({

                        type: 'POST',
                        url: '/Review/DeleteReview',
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
                        data: data,
                        success: function (data, result) {
                            console.log(result);
                            if (data != '') {
                                $('#user-review-section').after(data);
                                //$(".review-ajax-container > #post-review").append(data);
                                //$("#edit-review").removeClass("no-edit");
                                //$("#edit-review").val("Edit");

                                //remove the textareaeditForm
                                $('#user-review-wrapper').remove();
                                //notify user
                                console.log("Your review has been deleted!");

                                //scroll to the review section
                                $("html").animate(
                                    {
                                        scrollTop: $("#user-review-section").offset().top
                                    },
                                    20 //speed
                                );
                            }
                        },
                        error: function () {
                            //alert('Failed to receive the Data');
                            console.log('Failed ');
                        }
                    });
                    //actual delete
                }
            },
            'CANCEL': {
                'class': 'confirm-cancel',
                'action': function () { }  // Nothing to do in this case. You can as well omit the action property.
            }
        }
    });

});
//END Delete review


//start hide the confirm message button
$(document).mouseup(function (e) {
    //click outside of the message
    var container = $("#confirmBox, #confirmBox > p, #confirmBox > h3");

    // if the target of the click isn't the message itself, close the message
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $("#confirmOverlay").remove();
    }
});

//or when clicking on the × icon, close the message
$(document).on("click", "#confirm-close-wrapper", function (e) {
    $("#confirmOverlay").remove();
});

//End hide the confirm message button



//Start Read more button to hide extra part of lenghty reviews
$(document).ready(function () {
    var showChar = 700;
    var ellipsestext = "...";
    var moretext = "more";
    var lesstext = "less";
    $('.read-more-object-text').each(function () {
        var content = $(this).html();

        if (content.length > showChar) {

            var c = content.substr(0, showChar);
            var h = content.substr(showChar - 1, content.length - showChar);

            var html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span><span class="morecontent read-more-review"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink read-more-link">' + moretext + '</a></span>';

            $(this).html(html);
        }

    });

    $(".morelink").click(function () {
        if ($(this).hasClass("less")) {
            $(this).removeClass("less");
            $(this).html(moretext);
        } else {
            $(this).addClass("less");
            $(this).html(lesstext);
        }
        $(this).parent().prev().toggle();
        $(this).prev().toggle();
        return false;
    });
});

//End Read more button

//Start Like/Unlike a review
/*<#review-like-button> the like button
 *  <#like-icon> the heart icon
 *  <#like-caption> liked/like text
  </> End the like button
*/
/*<#likers-head-wrapper> the likers section
 *  <#like-count> the count
 *  <#review-stats> x people .. text
  </> End the likers section
*/

$(document).on("click", "#review-like-button", function (e) {
    //Start changing UI
//*****toggle between two class for changing the icon color
    $(this).children("#like-icon").toggleClass('review-icon-like review-icon-liked');

//****change the class of caption
    $(this).children("#like-caption").toggleClass('review-like-text review-liked-text');

//*****if review is liked (or unliked), change the text
    if ($(this).children('#like-caption').hasClass('review-liked-text')) {
        //if (...) ==> User liked review
//******change the caption to "Liked"
        $(this).children("#like-caption").html("Liked");

//******Increase the count by 1
        $(this).siblings().children("#like-count").html(parseInt($(this).siblings().children("#like-count").html()) + 1);
//******display the stats anyway, because if you pressed like, the like count is certainly more than zero
        //$(this).siblings("#likers-head-wrapper").fadeIn(400);

    } else {
        //else ==> User unliked review
//******change the caption to "Like Review"
        $(this).children("#like-caption").html("Like Review");

        //hide the stats if the like count is gonna be zero (after dcreasing)
        if (parseInt($(this).siblings().children("#like-count").html()) < 2) {
            $(this).siblings("#likers-head-wrapper").fadeOut(400);
        }

//******Decrease the count by 1
        $(this).siblings().children("#like-count").html(parseInt($(this).siblings().children("#like-count").html()) - 1);


    }
    //END Start changing UI

    //Start Ajax function for saving like or removing like from database
    var id = $(this).children("#review-id").val();
    var data = "ReviewId=" + id;

    //alert(data);
    $.ajax({

        type: 'POST',
        url: '/Review/LikeReview',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // when we use .serialize() this generates the data in query string format. this needs the default contentType (default content type is: contentType: 'application/x-www-form-urlencoded; charset=UTF-8') so it is optional, you can remove it
        data: data,
        success: function (result) {
            //alert('Successfully received Data ');
            console.log(result);
        },
        error: function () {
            //alert('Failed to receive the Data');
            console.log('Failed ');
        }
    })
    //End Ajax function

});
//End Like/Unlike a review

/*Start Display/hide the likers of a review*/
$(document).on("click", "#likers-head-wrapper", function (e) {
    $(this).siblings(".likers-wrapper").slideToggle();
    $(this).children(".likers-arrow").toggleClass("toggle-up");
});
/*End Display/hide the likers of a review*/

//Close button for the notifying messages when adding/editing a review
$(document).on("click", "#notify-message-close-wrapper", function (e) {
    $(this).closest("#clist-add-notify").remove();
});
//End Close button for the notifying messages