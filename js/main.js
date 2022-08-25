"use strict";

$(window).on("load", function () {
  /*------------------
		 Preloder
	 --------------------*/
  $(".loader").fadeOut();
  $("#preloder").delay(200).fadeOut("slow");
});

(function ($) {
  /*------------------
		 Background set
	 --------------------*/
  $(".set-bg").each(function () {
    var bg = $(this).data("setbg");
    $(this).css("background-image", "url(" + bg + ")");
  });

  $(".refrence-slider").owlCarousel({
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    autoplay: true,
  });

  $(".progress-bar-style").each(function () {
    var progress = $(this).data("progress");
    var prog_width = progress + "%";
    if (progress <= 100) {
      $(this).append(
        '<div class="bar-inner" style="width:' +
          prog_width +
          '"><span>' +
          prog_width +
          "</span></div>"
      );
    } else {
      $(this).append(
        '<div class="bar-inner" style="width:100%"><span>' +
          prog_width +
          "</span></div>"
      );
    }
  });

  $(document).on("scroll", function () {
    var pixels = $(document).scrollTop();
    var pageHeight = $(document).height() - $(window).height();
    var progress = (100 * pixels) / pageHeight;

    $("div.progress").css("width", progress + "%");
  });

  $(".lan-prog").each(function () {
    var progress = $(this).data("lanprogesss");
    var ele = "<span></span>";
    var ele_fade = '<span class="fade-ele"></span>';

    for (var i = 1; i <= 5; i++) {
      if (i <= progress) {
        $(this).append(ele);
      } else {
        $(this).append(ele_fade);
      }
    }
  });

  /*------------------
		 Popup
	 --------------------*/
  $(".project-item .port-pic").magnificPopup({
    type: "image",
    mainClass: "img-popup-warp",
    removalDelay: 500,
  });

  if ($().circleProgress) {
    //Set progress circle 1
    $("#progress1").circleProgress({
      value: 0.65,
      size: 175,
      thickness: 2,
      fill: "#40424a",
      emptyFill: "rgba(0, 0, 0, 0)",
    });
  }
})(jQuery);
