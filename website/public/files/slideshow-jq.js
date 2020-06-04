
(function(Weebly, $) {

Weebly.Slideshow = window.wSlideshow = {
	getSlideshowImages: getSlideshowImages,
	updateSize: updateSize,
	generateHTML: generateHTML,
	init: init,
	updatePhotos: updatePhotos,
	render: render,
	initHeaderSlideshow: initHeaderSlideshow,
	instantiateHeaderSlideshow: instantiateHeaderSlideshow,
	thumbnailURL: thumbnailURL,
	largeURL: largeURL
};


function initHeaderSlideshow(options) {
	var slideshow = instantiateHeaderSlideshow(options);
	if (slideshow) {
		slideshow.render();
	}
}


function instantiateHeaderSlideshow(options) {
	var $headers = $('[class*="wsite-header"]');
	$headers.not(':first').hide();
	var slideshowElement = $headers.css('background','none')[0];
	if (slideshowElement) {
		var slideshow = new Slideshow(slideshowElement, {
			fillDimensions: true,
			autoplay: true,
			speed: options.speed || 5,
			slide: options.slide, // leaving for backwards compatibility
			transition: options.transition,
			showControls: true,
			showPlayButton: false,
			dots: options.dots,
			dotPosition: options.dotPosition,
			arrows: options.arrows,
			forceSideArrows: true,
			images: options.images,
			aspectRatio: options.aspectRatio || 'auto',
			useAspectRatio: options.useAspectRatio || false
		});
		return slideshow;
	}
}


var slideshowOptions = {};
var slideshows = {};
var isTouch = 'ontouchstart' in document.documentElement;

var isIElt9 = false;
if ($.browser.msie) {
	var version = parseInt($.browser.version, 10);
	if (version < 9) {
		isIElt9 = true;	
	}
}


function getSlideshowImages(elementID) {
	return slideshows[elementID].getPhotos();
}


function updateSize() { // TODO: rename to updateSizes
	var changed = false;
	$.each(slideshows, function(i, slideshow) {
		slideshow.updateSize();
		changed = true;
	});
	return changed;
}


function generateHTML(elementID, rawOptions) {
	slideshowOptions[elementID] = processElementOptions(rawOptions);
	return "<div id='" + elementID + "-slideshow' style='height:1000px'></div>"; // to maintain scroll state
}


function init(elementID) {
	var e = $('#' + elementID + '-slideshow');
	var slideshow = new Slideshow(e, slideshowOptions[elementID]);
	slideshows[elementID] = slideshow;
	slideshow.render();
	e.height('');
}


function updatePhotos(elementID, photos) { // TODO: rename to updateImages
	if (slideshows[elementID]) {
		slideshows[elementID].destroy();
		var options = slideshowOptions[elementID];
		options.images = photos;
		slideshows[elementID] = new Slideshow($('#' + elementID + '-slideshow'), options);
		slideshows[elementID].render();
	}
}


function render(rawOptions) {
	var options = processElementOptions(rawOptions);
	var elementID = options.elementID;
	var slideshow = new Slideshow($('#' + elementID + "-slideshow"), options);
	slideshows[elementID] = slideshow;
	slideshow.render();
}


function processElementOptions(rawOptions) {
	var links = rawOptions.nav;
	var linkTiers = 1;
	if (links == 'double_thumbnails') {
		links = 'thumbnails';
		linkTiers = 2;
	}
	else if (links == 'none') {
		links = false;
	}
	return {
		elementID: rawOptions.elementID,
		links: links,
		linkLocation: rawOptions.navLocation,
		linkTiers: linkTiers,
		captionLocation: rawOptions.captionLocation,
		slide: rawOptions.transition == 'slide',
		transition: rawOptions.transition,
		autoplay: parseInt(rawOptions.autoplay),
		speed: parseInt(rawOptions.speed),
		aspectRatio: rawOptions.aspectRatio || 'auto',

		// If property entries are not in DB, old version of element-content-producing
		// code (before element php refactor) don't replace anything.
		// Thus, these properties could have values of "%%SHOWCONTROLS%%" or "%%RANDOMSTART%%".
		// Or old published slideshows might not have these entries as all (undefined).
		showControls: rawOptions.showControls !== 'false', // default is true
		randomStart: rawOptions.randomStart === 'true', // default is false

		images: rawOptions.images || []
	};
}



var PRELOAD = 5;
var ASPECT_RATIOS = {
	'16:9' : 16/9,
	'3:2'  : 3/2,
	'4:3'  : 4/3
};
var LINK_MOVE_EDGES = .40;
var LINK_ACCELERATION = 1;
var LINK_MAX_VELOCITY_SQRT = 4;


function Slideshow(element, options) {
	var t = this;


	// public functions

	t.render = render;
	t.destroy = destroy;
	t.updateSize = updateSize;
	t.play = play;
	t.pause = pause;
	t.on = on;
	t.getHandlers = getHandlers;
	t.setHandlers = setHandlers;
	t.clearHandlers = clearHandlers;
	t.getPhotos = function() {
		return photos
	};
	t.isPlaying = function () {
		return playing;
	};
	t.getSlideIndex = function() {
		return slideIndex;
	};
	t.gotoSlide = function(i, noTransition) {
		pause();
		go(i, undefined, noTransition);
	};


	element = $(element);
	options = options || {};


	var photos = options.images || [];
	var content;
	var slideContainer;
	var slides = [];
	var slideImgs = [];
	var slideImgWidths = [];
	var slideImgHeights = [];
	var slideImgWraps = [];
	var linkContainer;
	var linkContainerInner;
	var links;
	var dotContainer;
	var isAnimating = false;

	var slideIndex;
	var horizontalLinks; // bool
	var overlayTopLeft, overlayTopRight, overlayLeft, overlayRight;
	var allOverlays;
	var playing = false;
	var playPauseID = 0;
	var playButton;
	var pauseButton;
	var playTimeoutID;
	var controlsVisible = true;
	var controlsFadeEffect;
	var contentWidth;
	var contentHeight;
	var thumbnailWidth;
	var thumbnailHeight;
	var fadeoutTimer;

	var linkContainerX;
	var linkContainerY;
	var linkContainerWidth;
	var linkContainerHeight;
	var linkContainerInnerWidth;
	var linkContainerInnerHeight;
	var linkX = 0;
	var linkY = 0;
	var linkMin;
	var linkMax;
	var isMouseOverLinks = false;
	var linkHoverID = 0;
	var linkTargetVelocity = 0;
	var linkVelocity = 0;
	var linkIntervalID;

	var colCount = 8;
	var rowCount = 4;
	var sliceCount = 15;

	/* rendering
	-------------------------------------------------------------------------------*/


	function render() {
		element
			.addClass('wslide')
			.html(
				"<table class='wslide-main'><tbody></tbody></table>"
			);

		var table = element.find('table');
		var tbody = element.find('tbody');
		var content = renderContent();

		if (!isTouch) {
			content.on('mouseover', function() {
				if (options.showControls) {
					clearTimeout(fadeoutTimer);	
					if (!controlsVisible) {
						showControls(
							allOverlays.queue() && allOverlays.queue().length // skipIndent? = if any animations in the queue
						);
					}
				}
			})
			.on('mouseout', function() {
				fadeoutTimer = setTimeout(function() {
					fadeControls();
				}, 1000);	
			});
		}

		if (options.fillDimensions && options.useAspectRatio) {
			// only mobile will likey need to force the element height;
			element.css({ height : 'auto' });
		}
			
		if (!options.links || !photos.length) {
			var tr = $("<tr/>");
			var td = $("<td/>");
			td.append(content);
			tr.append(td);
			tbody.append(tr);
		} else {
			links = [];
			var linkLocation = options.linkLocation;
			horizontalLinks = linkLocation == 'top' || linkLocation == 'bottom';
			var linkContainer = renderLinks();
			var linkCell = $("<td class='wslide-link-cell'/>").append(linkContainer);
			var contentCell = $("<td/>").append(content);
			if (horizontalLinks) {
				linkCell.width('auto'); // for IE
				var tr1 = $("<tr/>");
				var tr2 = $("<tr/>");
				if (linkLocation == 'top') {
					tr1.append(linkCell);
					tr2.append(contentCell);
				}else{
					tr1.append(contentCell);
					tr2.append(linkCell);
				}
				tbody.append(tr1);
				tbody.append(tr2);
			}else{
				var tr = $("<tr/>");
				if (linkLocation == 'left') {
					tr.append(linkCell);
					tr.append(contentCell);
				}else{
					tr.append(contentCell);
					tr.append(linkCell);
				}
				tbody.append(tr);
			}
		}
		if (options.dots) {
			dotContainer = renderDots();
		}
		initSize();
		if (photos.length) {
			if (options.randomStart) {
				go(Math.floor(Math.random() * photos.length));
			}else{
				go(0);
			}
		}
		hideControls();
		if (options.autoplay) {
			play();
		}
		$(window).on('resize', windowResize);
	}


	function destroy() {
		element.empty();
		_destroy();
	}


	function _destroy() {
		pause();
		$(window).on('resize', windowResize);
		clearHandlers();
	}


	function renderContent() {
		content = $(
			"<div class='wslide-content disable-user-select'>" +
				"&nbsp;" + // for IE
				"<div class='wslide-content-inner'>" +
					"<div class='wslide-slides'></div>" +
				"</div>" +
				"<div class='wslide-overlay-top-left disable-user-select'></div>" +
				"<div class='wslide-overlay-top-right disable-user-select'></div>" +
				"<div class='wslide-overlay-left disable-user-select'></div>" +
				"<div class='wslide-overlay-right disable-user-select'></div>" +
			"</div>"
		);
		slideContainer = content.find('div.wslide-slides');
		overlayTopLeft = content.find('div.wslide-overlay-top-left');
		overlayTopRight = content.find('div.wslide-overlay-top-right');
		overlayLeft = content.find('div.wslide-overlay-left');
		overlayRight = content.find('div.wslide-overlay-right');
		allOverlays = overlayTopLeft.add(overlayTopRight).add(overlayLeft).add(overlayRight);
		if (photos.length > 1) {

			var prevSlide = function() {
				if (isTouch) {
					setControlTimeout();
				}

				pause();
				prev();
			};

			var nextSlide = function() {
				if (isTouch) {
					setControlTimeout();
				}

				pause();
				next();
			};

			var showPlayPause = function() {
				if (isTouch) {
					setControlTimeout();
				}
			};
			if (isTouch) {
				content.on('click', showPlayPause);	
			}

			var prevButton = renderPrev();
			var nextButton = renderNext();

			if (options.showPlayButton !== false) {
				overlayTopLeft
					.append(renderPlay())
					.append(renderPause());
			}

			if (options.arrows !== false) {
				if (options.slide || options.forceSideArrows) {
					overlayLeft.append(prevButton).on('click', prevSlide);
					overlayRight.append(nextButton).on('click', nextSlide);
				}else{
					prevButton.on('click', prevSlide);
					nextButton.on('click', nextSlide);
					
					overlayTopRight
						.append(prevButton)
						.append('&nbsp;')
						.append(nextButton);
				}
			}
		}

		allOverlays = allOverlays.find('.wslide-button-wrap');
		
		return content;
	}

	function setControlTimeout() {
		clearTimeout(fadeoutTimer);
		showControls(
			allOverlays.queue().length
		);
		fadeoutTimer = setTimeout(function() {
			fadeControls();
		}, 1000);	
	}


	function renderPlay() {
		var $playWrap = $(
			"<div class='wslide-button-wrap'>" +
				"<span class='wslide-play wslide-button disable-user-select'>" +
					"<span class='wslide-button-inner'>Play <span class='wslide-button-icon'></span></span>" +
					"<span class='wslide-button-bg'></span>" +
				"</span>" +
			'</div>'
			);

		$playWrap.css({display:'inline-block'});
		
		playButton = $playWrap.find('.wslide-play');
		playButton.on('click', play);
		
		return $playWrap;
	}


	function renderPause() {
		var $pauseWrap = $(
			"<div class='wslide-button-wrap'>" +
				"<span class='wslide-pause wslide-button disable-user-select'>" +
					"<span class='wslide-button-inner'>Pause <span class='wslide-button-icon'></span></span>" +
					"<span class='wslide-button-bg'></span>" +
				"</span>" +
			'</div>'
			);

		$pauseWrap.css({display:'inline-block'});

		pauseButton = $pauseWrap.find('.wslide-pause');
		pauseButton.on('click', pause);

		return $pauseWrap;
	}


	function renderPrev() {
		var $prevButton = $(
			"<div class='wslide-button-wrap'>" +
				"<span class='wslide-prev wslide-button disable-user-select'>" +
					"<span class='wslide-button-inner'><span class='wslide-button-icon'></span></span>" +
					"<span class='wslide-button-bg'></span>" +
				"</span>" +
			"</div>"
			);

		$prevButton.css({display:'inline-block'});
			
		return $prevButton;
	}


	function renderNext() {
		var $nextButton = $(
			"<div class='wslide-button-wrap'>" +
				"<span class='wslide-next wslide-button disable-user-select'>" +
					"<span class='wslide-button-inner'><span class='wslide-button-icon'></span></span>" +
					"<span class='wslide-button-bg'></span>" +
				"</span>" +
			"</div>"
			);

		$nextButton.css({display:'inline-block'});

		return $nextButton;
	}


	function renderLinks() {
		var linkLocation = options.linkLocation;
		var linkTiers = options.linkTiers;
		var classes = 'wslide-links disable-user-select wslide-links-' + options.linkLocation;
		if (options.links) {
			if (options.links == 'thumbnails') {
				classes += ' wslide-thumbnail-links';
			}else{
				classes += ' wslide-number-links';
			}
		}
		linkContainer = $(
			"<div class='" + classes + "'>" +
				"<div class='wslide-links-inner'>" +
					"<table><tbody></tbody></table>" +
				"</div>" +
			"</div>"
		);
		if (!isTouch) {
			linkContainer
				.on('mouseover', linkContainerMouseover)
				.on('mousemove', linkContainerMousemove)
				.on('mouseout', linkContainerMouseout);
		} else {
			linkContainer
				.on('touchstart', linkContainerTouchStart)
				.on('touchmove', linkContainerTouchMove);
		}
		linkContainerInner = linkContainer.children().first();
		initLinkSwiping(linkContainerInner);
		var tbody = linkContainer.find('tbody');
		if (horizontalLinks) {
			var trs = [];
			for (var i=0; i<linkTiers; i++) {
				trs[i] = $("<tr/>");
				tbody.append(trs[i]);
			}
			for (var i=0; i<photos.length; i++) {
				trs[i % linkTiers].append(renderLink(photos[i], i));
			}
		}else{
			var photoCnt = photos.length;
			for (var r=0, i=0; i<photoCnt; r++) {
				var tr = $("<tr/>");
				for (var c=0; c<linkTiers && i<photoCnt; c++, i++) {
					tr.append(renderLink(photos[i], i));
				}
				tbody.append(tr);
			}
		}
		if (isTouch && typeof(whenPhotoSwipeLoaded) !== "undefined") {
			whenPhotoSwipeLoaded(function() {
				Code.PhotoSwipe.attach(
					linkContainer.find('a').toArray(),
					{
						captionAndToolbarFlipPosition: true,
						captionAndToolbarAutoHideDelay: 0, // always show
						loop: false
					}
				);
			});
		}
		return linkContainer;
	}
	
	
	function renderDots() {
		var container = $(
			"<div class='wslide-dots'></div>"
		);
		for (var i=0; i<photos.length; i++) (function(i) {
			container.append(
				$("<div class='wslide-dot' />")
					.on('click', function() {
						pause();
						go(i);
					})
			);
		})(i);
		content.append(container);
		var dotPosition = options.dotPosition || 'right';
		if (dotPosition == 'left') {
			container.css({ left: 10, bottom: 10 });
		}
		else if (dotPosition == 'center') {
			container.css({ left: element.width()/2-container.width()/2, bottom: 10 });
			// TODO: make update with liquid width
		}
		else if (dotPosition == 'right') {
			container.css({ right: 10, bottom: 10 });
		}
		return container;
	}


	function renderLink(photo, i) {
		var td = $("<td/>");
		if (options.links == 'numbers') {
			td.append(
				"<a class='wslide-link wslide-link-number'>" +
					"<div class='wslide-link-inner1'>" +
						"<div class='wslide-link-inner2'>" +
							(i + 1) +
						"</div>" +
					"</div>" +
				"</a>"
			);
		}else{
			td.append(
				"<a class='wslide-link wslide-link-thumbnail'>" +
					"<div class='wslide-link-inner1'>" +
						"<div class='wslide-link-inner2'>" +
							"<img style='visibility:hidden' />" +
						"</div>" +
					"</div>" +
				"</a>"
			);
			var img = td.find('img');
			setTimeout(function() {
				loadImage(img[0], thumbnailURL(photo), function() {
					sizeThumbnail(img, photo);
					img.css('visibility', '');
				});
			},0); // let the first slide load first
		}
		var a = td.find('a');
		if (isTouch && typeof(whenPhotoSwipeLoaded) !== "undefined") {
			// unencode the caption for the mobile slideshow
			a.attr('href', largeURL(photo))
			 .attr('title',  _.unescape(photo.caption));
		}
		else {
			a.on('click', function() {
				pause();
				go(i);
			});
		}
		initLinkSwiping(a);
		links[i] = a;
		return td;
	}


	function addSlide(photo, i, navigateOnLoad) {
		var linkNewWindow = false;
		var link = photo.link;
		if (link) {
			var origLink = link;
			link = link.replace('weeblylink_new_window', '');
			if (link != origLink) {
				linkNewWindow = true;
			}
		}
		var captionHTML =
			 _.unescape(photo.caption) ?
				"<div style='display:none;' class='wslide-caption " +
					(options.captionLocation=='top' ? 'wslide-caption-top' : 'wslide-caption-bottom') + "'>" +
					"<div class='wslide-caption-text'>" + _.unescape(photo.caption) + "</div>" + // already escaped
					"<div class='wslide-caption-bg'></div>" +
				"</div>" :
				'';
		var slide = $(
			"<div class='wslide-slide wslide-slide-loading'>" +
				(link ? "<a>" : '') +
				(options.fillDimensions ? captionHTML : '') +
				"<div class='wslide-slide-inner1'>" +
					"<div class='wslide-slide-inner2' style='visibility:hidden'>" +
						"<img />" +
						(options.fillDimensions ? '' : captionHTML) +
					"</div>" +
				"</div>" +
				(link ? "</a>" : '') +
			"</div>"
		);
		if (!isIElt9) {
			slide.find('.wslide-caption').css({ opacity : .99 });
		}
		slide.hide();
		slideContainer.append(slide);
		var img = slide.find('img');
		var imgWrap = img.closest('.wslide-slide-inner2');
		slides[i] = slide;
		slideImgs[i] = img;
		slideImgWraps[i] = imgWrap;
		slide.find('a').each(function(i, a) {
			a = $(a);
			if (window.currentSite) {
				// in editor
				a.attr('href', '#');
				a.on('click', function() { return false });
				a.attr('title', _W.tl("Links active once published"));
			}else{
				if (link) {
					a.attr('href', link);
					if (linkNewWindow) {
						a.attr('target', '_blank');
					}
				}
			}
		});
		loadImage(img[0], largeURL(photo), function() {
			slide.removeClass('wslide-slide-loading');
			// Only IE does not give the original image width when hidden.
			// The show method has some issues when getting the image width and height
			// with Adblock for Safari, and possibly some other plugins.
			slideImgWidths[i] = img[0].width;
			slideImgHeights[i] = img[0].height;
			if (slideImgWidths[i] === 0 || slideImgHeights[i] === 0) {
				slide.show(0);
				slideImgWidths[i] = img[0].width;
				slideImgHeights[i] = img[0].height;
				slide.hide(0);
			}
			sizeContentArea();
			sizeImage(i);
			if (i == slideIndex) { // is current slide
				sizeOverlays(i);
				if (playing) {
					timedNext();
				}
			}
			imgWrap.css('visibility', '');
			if (navigateOnLoad) {
				go(i);
			}
		});
		return slide;
	}




	/* sizing
	------------------------------------------------------------------------------------*/


	function initSize() {
		calcThumbnailDims();
		updateSize();
	}


	function updateSize() {

		if (isDead() || !content) {
			return;
		}

		if (linkContainer && !horizontalLinks) {
			// need to set width of vertical link container
			linkContainerWidth = linkContainerInner.outerWidth();
			linkContainer.width(linkContainerWidth);
		}

		sizeContentArea();

		if (linkContainer) {
			linkContainerInnerWidth = linkContainerInner.outerWidth();
			linkContainerInnerHeight = linkContainerInner.outerHeight();
			if (horizontalLinks) {
				linkContainerWidth = contentWidth;
				linkContainerHeight = linkContainerInner.outerHeight();
				linkContainer.height(linkContainerHeight);
				linkMin = linkContainerWidth - linkContainerInnerWidth;
				linkMax = 0;
				/* center
				if (linkContainerInnerWidth < linkContainerWidth) {
					linkContainerInner.css('left', linkContainerWidth/2 - linkContainerInnerWidth/2);
				}
				*/
			}else{
				// (linkContainerWidth calculated above)
				linkContainerHeight = contentHeight;
				linkContainer.height(linkContainerHeight);
				linkMin = linkContainerHeight - linkContainerInnerHeight;
				linkMax = 0;
			}
		}

		/* ratio for captions to be tall enough to not block dots */
		var dots = $('.wslide-dots');
		var bottomPx = (contentHeight < 200) ? contentHeight / 20 : 10;
		if (options.dotPosition == 'center') {
			dots.css({ 
				left : element.width()/2-dots.width()/2,
				bottom : bottomPx
			});
			// TODO: make update with liquid width
		} else {
			dots.css({ bottom : bottomPx });
		}

		if (slideImgWidths[slideIndex] && slideImgHeights[slideIndex]) { // is current image loaded?
			sizeContentArea();
			sizeImage(slideIndex);
			sizeOverlays(slideIndex);
		}

	}

	function sizeContentArea() {
		contentWidth = content.outerWidth();
		if (options.fillDimensions && !options.useAspectRatio) {
			contentHeight = element.height();
			if (linkContainer && horizontalLinks) {
				contentHeight -= linkContainerInner.outerHeight(); // BAD because we also query this below
			}
		} else {
			contentHeight = Math.round(contentWidth / getAspectRatio());
			
			// Revisit this
			// limit contentHeight to the shortest photo (after we have calculated it's scaled down dimension)
			// for (var i = 0; i < photos.length; i++) {
			// 	var photoNaturalWidth =  photos[i].fullWidth || slideImgWidths[i];
			// 	var photoNaturalHeight = photos[i].fullHeight || slideImgHeights[i];
			// 	if (photoNaturalWidth && photoNaturalHeight) {
					
			// 		// find the height of the photo (`photoHeight`) after it is scaled down
			// 		var photoScale = Math.min(
			// 			contentWidth / photoNaturalWidth,
			// 			contentHeight / photoNaturalHeight,
			// 			1 // makes sure we don't scale up
			// 		);
			// 		var photoHeight = (photoNaturalHeight * photoScale) + 1;
					
			// 		// limit contentHeight!
			// 		contentHeight = Math.min(contentHeight, photoHeight);
			// 	}
			// }
		}
		content.height(contentHeight);
	}


	function getAspectRatio() {
		if (options.aspectRatio == 'auto') {
			if (!photos.length) {
				return 16/9;
			}
			var scores = {};
			for (var i=0; i<photos.length; i++) {
				var photoRatio = photos[i].width / photos[i].height;
				var bestKey;
				var bestDiff = false;
				$.each(ASPECT_RATIOS, function(key, value) {
					var aspectRatio = value;
					var diff = Math.abs(aspectRatio - photoRatio);
					if (bestDiff === false || diff < bestDiff) {
						bestDiff = diff;
						bestKey = key;
					}
				});
				scores[bestKey] = (scores[bestKey] || 0) + 1;
			}
			var winnerKey;
			var winnerScore = false;
			$.each(scores, function(key, value) {
				if (winnerScore === false || value > winnerScore) {
					winnerScore = value;
					winnerKey = key;
				}
			});
			return ASPECT_RATIOS[winnerKey];


			// TODO: Revisit this
			// if (!photos.length) {
			// 	return 16/9;
			// }
			
			// var maxRatio = -1;
			// for (var i = 0; i < photos.length; i++) {
			// 	// add plus one to height to account for rounding errors on the server
			// 	var photoRatio = photos[i].width / (1 + parseInt(photos[i].height));
			// 	if (photoRatio > maxRatio) {
			// 		maxRatio = photoRatio;
			// 	}
			// }
			// return maxRatio;
		} else if ($.isNumeric(options.aspectRatio)) {
			return Number(options.aspectRatio);
		} else {
			return ASPECT_RATIOS[options.aspectRatio];
		}
	}


	function calcThumbnailDims() {
		thumbnailWidth = 0;
		thumbnailHeight = 0;
		if (linkContainer) {
			var thumbnails = linkContainer.find('a.wslide-link-thumbnail').first();
			if (thumbnails.length) {
				var inner = thumbnails.children().first();
				thumbnailWidth = inner.outerWidth();
				thumbnailHeight = inner.outerHeight();
			}
		}
	}


	function sizeThumbnail(img, photo) {
		var naturalWidth = parseInt(photo.width);
		var naturalHeight = parseInt(photo.height);
		var sx = thumbnailWidth / naturalWidth;
		var sy = thumbnailHeight / naturalHeight;
		var s = Math.max(sx, sy);
		var w = Math.ceil(naturalWidth * s);
		var h = Math.ceil(naturalHeight * s);
		img.attr('width', w);
		img.attr('height', h);
		img.css('top', -Math.round(h/2) + 'px');
		img.css('left', -Math.round(w/2) + 'px');
	}


	function sizeImage(i) {
		var slideElement = slides[i];
		var captionElement = slideElement.find('.wslide-caption');
		var imgWrap = slideImgWraps[i];
		var img = slideImgs[i];
		var scale;
		if (options.fillDimensions) {
			scale = Math.max(
				contentWidth / slideImgWidths[i],
				contentHeight / slideImgHeights[i]
			);
		}
		else {
			scale = Math.min(
				contentWidth / slideImgWidths[i],
				contentHeight / slideImgHeights[i],
				1
			);
		}

		var h, w;

		w = Math.ceil(slideImgWidths[i] * scale);
		h = Math.ceil(slideImgHeights[i] * scale);
		if (w+1 <= slideImgWidths[i]) {
			w++;
			h++;
		}

		img.width(w);
		imgWrap.css('width', w);
		imgWrap.css('left', -Math.round(w / 2));
		imgWrap.css('top', -Math.ceil(h / 2));
		if (captionElement.length && options.fillDimensions) {
			// options.fillDimensions is a stand-in for "is this a header slideshow?"

			var captionHeight;
			if (slideElement.is(':hidden')) {
				slideElement.show();
				captionHeight = captionElement.outerHeight();
				slideElement.hide();
			} else {
				captionHeight = captionElement.outerHeight();	
			}

			var captionMeasurement = contentHeight * .25 - captionHeight / 2;
			var minHeight =  .13 * contentHeight;
			captionMeasurement = Math.max(minHeight, captionMeasurement);
			captionElement.css(
				'bottom',
				captionMeasurement	
			);
		}
		captionElement.show();
	}


	var indentLeft = 0;
	var indentRight = 0;
	var indentTop = 0;
	var indentBottom = 0;


	function sizeOverlays(i) {
		var slide = slides[i];
		var slideOffset = slide.offset();
		var slideWidth = slide.outerWidth();
		var slideHeight = slide.outerHeight();
		var img = slideImgs[i];
		var imgOffset = img.offset();
		var imgWidth = img.outerWidth();
		var imgHeight = img.outerHeight();
		var captionHeight = slides[i].find('div.wslide-caption').outerHeight();
		indentLeft = Math.max(0, imgOffset.left - slideOffset.left);
		indentRight = Math.max(0, (slideOffset.left + slideWidth) - (imgOffset.left + imgWidth));
		indentTop = Math.max(0, imgOffset.top - slideOffset.top); // TODO: won't work very well with fillDimensions
		if (photos[i].caption && options.captionLocation == 'top' && slideHeight != captionHeight) {
			indentTop += captionHeight;
		}
		indentBottom = Math.max(0, (slideOffset.top + slideHeight) - (imgOffset.top + imgHeight)); // TODO: won't work very well with fillDimensions
	}




	/* slide transition
	-----------------------------------------------------------------------------------*/


	function _go(newIndex) {

		var needSizeOverlays = false;
		var oldIndex = slideIndex;
		slideIndex = newIndex;

		if (slides[newIndex]) {
			if (slideImgWidths[newIndex] && slideImgHeights[newIndex]) { // is loaded?
				sizeContentArea();
				sizeImage(newIndex);
				needSizeOverlays = true;
				if (playing) {
					timedNext();
				}
			}
		}

		if (links) {
			if (oldIndex !== undefined) {
				links[oldIndex].removeClass('wslide-link-active');
			}
			links[newIndex].addClass('wslide-link-active');
			if (playing) {
				element.find('.wslide-link-thumbnail img').css({ opacity : .5 });
				element.find('.wslide-thumbnail-links .wslide-link-active img').css({ opacity : 1});
			}
		}
		
		if (dotContainer) {
			dotContainer.find('.wslide-dot').removeClass('wslide-dot-current')
				.eq(newIndex).addClass('wslide-dot-current');
		}

		updatePlayPauseButtons();

		return needSizeOverlays;
	}


	function go(newIndex, forceDirection, noTransition) { // forceDirection = 1 (forward) or -1 (backward)
		
		if (!photos.length || isAnimating) {
			return;
		}
		newIndex = Math.min(photos.length-1, Math.max(0, newIndex));

		var needsPreload = preloadSlides(newIndex, newIndex);
		if (needsPreload) {
			return;
		}

		if (newIndex != slideIndex) {
			var oldIndex = slideIndex;
			var needSizeOverlays = _go(newIndex);
			
			var sign = forceDirection;
			if (!sign) {
				sign = newIndex > oldIndex ? 1 : -1;
			}
			
			if (noTransition || oldIndex === undefined) {
				
				if (oldIndex !== undefined) {
					slides[oldIndex].hide();
				}
			
				slides[newIndex].show();
				if (needSizeOverlays) {
					sizeOverlays(newIndex);
				}
			} else if (options.transition == 'mosaic') { //web.archive.org/web/20141222121432/http://box in
				var reverse = (sign < 0);
				createBoxes(newIndex);
				
				var $boxes = $('.wslide-box', slideContainer);
				var finished = 0;
				var timeBuff = (reverse) ? (colCount - 1) * 150 : 0;

				fadeCaptions(newIndex, oldIndex);
				isAnimating = true;
				$boxes.each(function(index) {
					var box = $(this);

					setTimeout(function() {
						box.animate({ opacity:'1.0' }, 500, function() {
							finished++;
							if (finished == $boxes.length) {
								slides[oldIndex].hide();
								isAnimating = false;
								slides[newIndex].find('img').show();
								// Mobile Safari will flicker when trying to remove
								// hardware accelerated dom elements at the same time as regular
								// dom elements
								setTimeout(function() {	
									$boxes.remove();
								}, 50);
							}
						});
					}, (timeBuff));

					if ( (index + 1) % colCount == 0) { // new column
						timeBuff = (index + 1) / colCount * 75;
						
						if (reverse) {
							timeBuff += (colCount - 1) * 150;
						}
					} else {
						timeBuff = (reverse) ? timeBuff - 150 : timeBuff + 150;	
					}

				});
			} else if (options.transition == 'slice') { //web.archive.org/web/20141222121432/http://slice in
				fadeCaptions(newIndex, oldIndex);
				animateSlices(newIndex, oldIndex, (sign < 0), false);
			} else if (options.transition == 'fold') { // fold
				fadeCaptions(newIndex, oldIndex);
				animateSlices(newIndex, oldIndex, (sign < 0), true);
			} else if (options.transition == 'slide' || options.slide) { //web.archive.org/web/20141222121432/http://slide in
				var newSlide = slides[newIndex];
				var oldSlide = slides[oldIndex];

				newSlide.css({ left : sign * contentWidth + 'px' }).show();

				isAnimating = true;
				slideContainer.css({ left : 0 }).animate({ 
					left : -sign * contentWidth + 'px'
				}, {
					duration : 500,
					complete: function() {
						if (needSizeOverlays) {
							sizeOverlays(newIndex);
						}
						oldSlide.hide();
						slideContainer.css({ left : 0 });
						newSlide.css({ left : 0 });
						isAnimating = false;
					}
				});
			} else {

				var oldOpacityElements = slides[oldIndex].find('.wslide-slide-inner2');
				var newOpacityElements = slides[newIndex].find('.wslide-slide-inner2');

				var opacityComplete = function() {
					if (needSizeOverlays) {
						sizeOverlays(newIndex);
					}
					slides[oldIndex].hide();
					isAnimating = false;
				};

				slides[newIndex].show();

				isAnimating = true;

				var opacity = .99;
				if (isIElt9) {
					opacity = 1;
				}

				oldOpacityElements.css({ opacity : opacity }).animate({ opacity : 0 }, {
					duration : 500,
					complete : opacityComplete
				});

				newOpacityElements.css({ opacity : 0 }).animate({ opacity : opacity }, {
					duration : 500,
					complete : opacityComplete
				});
			}
			
		}

		trigger('slideChange', newIndex);
		
	};
	
	var fadeCaptions = function(newIndex, oldIndex) {
		var $captionNew = slides[newIndex].find('.wslide-caption');
		var $captionOld = slides[oldIndex].find('.wslide-caption');

		var opacity = .99;
		if (isIElt9) {
			opacity = 1;
		}
		$captionOld.css({ 'z-index': 3, opacity : opacity }).animate({ opacity : 0 }, {
			duration : 1000
		});
		$captionNew.css({ 'z-index': 3, opacity : 0 }).animate({ opacity : opacity }, {
			duration : 1000
		});
	};

	var animateSlices = function(newIndex, oldIndex, reverse, growWidth) {
		createSlices(newIndex);
		
		var timeBuff = 0;
		var $slices = $('.wslide-slice', slideContainer);
		
		if (reverse) {
			if (Array.prototype._reverse) {
				Array.prototype._reverse.call($slices);
			} else {
				Array.prototype.reverse.call($slices);
			}
		}
		
		var finished = 0;
		isAnimating = true;
		
		$slices.each(function() {
			var $slice = $(this);
			var toCSS = { opacity:'1.0' };
			
			if (growWidth) {
				var origWidth = $slice.width();
				$slice.css({ width:'0px' });
				toCSS.width = origWidth;
			}
			
			setTimeout(function() {
				$slice.animate(toCSS, 500, function() {
					finished++;
					if (finished == $slices.length) {
						slides[oldIndex].hide();
						isAnimating = false;
						slides[newIndex].find('img').css('visibility', 'visible');
						setTimeout(function() {	
							$slices.remove();
						}, 50);
					}
				});
			}, (timeBuff));
			timeBuff += 65;
		});
	};

	// Heavily modified from Nivo Slider
	// Copyright 2012, Dev7studios
	// Add slices for slice animations
	var createSlices = function(newIndex, alignRight) {
		var $newSlide = slides[newIndex];
		var $currentImage = $newSlide.find('img');
		var currentImageSrc = $currentImage.attr('src');
		var $imageWrap = $currentImage.up('.wslide-slide-inner2');
		
		$newSlide.show();

		var sliceHeight = $currentImage.height();
		var sliceWidth = Math.round($imageWrap.width() / sliceCount);

		$currentImage.css('visibility', 'hidden');

		for (var i = 0; i < sliceCount; i++) {
			
			var $img = $('<img>').attr({
					src : currentImageSrc
				}).css({
					position : 'absolute',
					width    : $imageWrap.width() + 'px',
					height   : 'auto',
					display  : 'block !important',
					top      : 0
				});

			var $sliceHTML = $('<div class="wslide-slice"></div>');

			$sliceHTML.css({ 
				position  : 'absolute',
				height    : sliceHeight + 'px', 
				opacity   : '0',
				overflow  : 'hidden',
				'z-index' : '2',
				'-webkit-backface-visibility': 'hidden'
			});

			// alignright is really buggy in chrome right now so animations will
			// have to grow from the left at the moment
			if (alignRight) {
				$img.css({
					left : -((sliceCount - i - 1) * sliceWidth) + 'px'
				});
				$sliceHTML.css({
					right : (sliceWidth * i) + 'px'
				});
			} else {
				$img.css({
					left : (-i * sliceWidth) + 'px'
				});
				$sliceHTML.css({
					left : (sliceWidth * i) + 'px'
				});
			}

			if (i === sliceCount - 1) {
				$sliceHTML.css({
					width : ($imageWrap.width() - (sliceWidth * i)) + 'px'
				});
			} else {
				$sliceHTML.css({ 
					width : sliceWidth + 'px'
				});
			}

			$sliceHTML.append($img);
			$imageWrap.append($sliceHTML);
		}
	};

	var createBoxes = function(newIndex) {
		var $newSlide = slides[newIndex];
		var $currentImage = $newSlide.find('img');
		var currentImageSrc = $currentImage.attr('src');
		//web.archive.org/web/20141222121432/http://var $imageWrap = $currentImage.up('.wslide-slide-inner2');
		var $imageWrap = $currentImage.up('.wslide-slide');

		$newSlide.show();

		var boxWidth = Math.round($imageWrap.width() / colCount);
		var boxHeight = Math.round($imageWrap.height() / rowCount);

		var offsetLeft = Math.floor($currentImage.offset().left - $imageWrap.offset().left);
		var offsetTop = Math.ceil($currentImage.offset().top - $imageWrap.offset().top);

		$currentImage.hide();
			
		for (var rows = 0; rows < rowCount; rows++) {
			for (var cols = 0; cols < colCount; cols++) {

				var $img = $('<img>').attr({
						src : currentImageSrc
					}).css({
						position : 'absolute',
						width    : $currentImage.width() + 'px',
						height   : 'auto',
						display  : 'block !important',
						top      : -(boxHeight * rows) + offsetTop + 'px',
						left     : -(boxWidth * cols) + offsetLeft + 'px'
					});

				var $boxHTML = $('<div class="wslide-box"></div>').append($img);
				
				$boxHTML.css({
					position  : 'absolute',
					opacity   : 0,
					left      : (boxWidth * cols) + 'px', 
					top       : (boxHeight * rows) + 'px',
					overflow  : 'hidden',
					'z-index' : '2',
					'-webkit-backface-visibility': 'hidden'
				});
				if (cols === colCount - 1) {
					$boxHTML.css({
						width : ($imageWrap.width() - (boxWidth * cols)) + 'px'
					});
				} else {
					$boxHTML.css({ 
						width : boxWidth + 'px'
					});
				}

				if (rows === rowCount - 1) {
					$boxHTML.css({
						height : ($imageWrap.height() - (boxHeight * rows)) + 'px'
					});
				} else {
					$boxHTML.css({ 
						height : boxHeight + 'px'
					});
				}

				$imageWrap.append($boxHTML);
			}
		}
	};


	function preloadSlides(startingAt, navigateTo) {
		var needsPreload = false;
		for (var i=startingAt; i<=startingAt+PRELOAD && i<photos.length; i++) {
			if (i>=0 && !slides[i]) {
				addSlide(photos[i], i, i === navigateTo); // populates slides[i]
				needsPreload = (startingAt === i) ? true : false;
			}
		}
		return needsPreload;
	}


	/* 	navigation methods
	-----------------------------------------------------------------------*/


	function prev() {
		var i = (slideIndex - 1 + photos.length) % photos.length;
		if (i >= 0) {
			go(i, -1);
			putLinkInView(i, false);
		}
	}


	function next() {
		var i = (slideIndex + 1) % photos.length;
		go(i, 1);
		putLinkInView(i, true);
	}


	function timedNext() {
		playTimeoutID = setTimeout(
			function() {
				if (!isDead()) {
					next();
				}
			},
			options.speed * 1000
		);
	}



	/* link mouseover sliding
	--------------------------------------------------------------------------*/
	var prevX = 0;
	var prevY = 0;

	function linkContainerTouchStart(ev) {
		prevX = ev.pageX || ev.originalEvent.pageX;
		prevY = ev.pageY || ev.originalEvent.pageY;
	}
	
	function linkContainerTouchMove(ev) {
		var pageX = ev.pageX || ev.originalEvent.pageX;
		var pageY = ev.pageY || ev.originalEvent.pageY;

		if (horizontalLinks) {
			linkVelocity = pageX - prevX;//((prevX - pageX) > 0) ? -5 : 5;
		} else {
			linkVelocity = pageY - prevY;//((prevY - pageY) > 0) ? -5 : 5;
		}
		prevX = pageX;
		prevY = pageY;

		linkTargetVelocity = linkVelocity;
		linkMove();
		ev.preventDefault();
	}

	function linkContainerMouseover(ev) {
		isMouseOverLinks = true;
		linkHoverID++;
		if (horizontalLinks) {
			linkContainerX = linkContainer.offset().left;
		}else{
			linkContainerY = linkContainer.offset().top;
		}
	}


	function linkContainerMousemove(ev) {
		if (horizontalLinks && linkContainerInnerWidth < linkContainerWidth ||
			!horizontalLinks && linkContainerInnerHeight < linkContainerHeight) {
				return;
			}
		var n;
		if (horizontalLinks) {
			n = (ev.pageX - linkContainerX) / linkContainerWidth;
		}else{
			n = (ev.pageY - linkContainerY) / linkContainerHeight;
		}
		var v;
		if (n < LINK_MOVE_EDGES) {
			v = (1 - (n / LINK_MOVE_EDGES)) * LINK_MAX_VELOCITY_SQRT;
			v *= v;
		}
		else if (n > (1-LINK_MOVE_EDGES)) {
			v = ((n - (1-LINK_MOVE_EDGES)) / LINK_MOVE_EDGES) * LINK_MAX_VELOCITY_SQRT;
			v *= -v;
		}
		else {
			v = 0;
		}
		v = Math.round(v);
		if (linkTargetVelocity != v) {
			linkTargetVelocity = v;
			if (!linkIntervalID) {
				linkIntervalID = setInterval(linkMove, 35);
			}
		}
	}


	function linkMove() {
		if (linkVelocity < linkTargetVelocity) {
			linkVelocity += LINK_ACCELERATION;
		}
		else if (linkVelocity > linkTargetVelocity) {
			linkVelocity -= LINK_ACCELERATION;
		}
		if (!linkVelocity && !linkTargetVelocity) {
			clearInterval(linkIntervalID);
			linkIntervalID = null;
		}else{
			if (horizontalLinks) {
				linkX = Math.min(linkMax, Math.max(linkMin, linkX + linkVelocity));
				linkContainerInner.css('left', linkX);
			}else{
				linkY = Math.min(linkMax, Math.max(linkMin, linkY + linkVelocity));
				linkContainerInner.css('top', linkY);
			}
		}
	}


	function linkContainerMouseout(ev) {
		var savedID = ++linkHoverID;
		setTimeout(function() {
			if (savedID == linkHoverID) {
				linkTargetVelocity = 0;
				isMouseOverLinks = false;
			}
		}, 10);
	}




	/* putting links in view
	---------------------------------------------------------------------------*/


	function putLinkInView(i, toFront) {
		if (links && !isMouseOverLinks) {
			var link = links[i];
			if (horizontalLinks) {
				var localLeft = link.position().left;
				var left = localLeft + linkContainerInner.position().left;
				var width = link.outerWidth();
				if (left < 0 || left + width > linkContainerWidth) {
					if (toFront) {
						tweenLinkX(-localLeft);
					}else{
						tweenLinkX(-(localLeft + width - linkContainerWidth));
					}
				}
			}else{
				var localTop = link.position().top;
				var top = localTop + linkContainerInner.position().top;
				var height = link.outerHeight();
				if (top < 0 || top + height > linkContainerHeight) {
					if (toFront) {
						tweenLinkY(-localTop);
					}else{
						tweenLinkY(-(localTop + height - linkContainerHeight));
					}
				}
			}
		}
	}


	function tweenLinkX(newX) {
		newX = Math.min(linkMax, Math.max(linkMin, newX));
		linkContainerInner.animate({ left: newX }, 500);
	}


	function tweenLinkY(newY) {
		newY = Math.min(linkMax, Math.max(linkMin, newY));
		linkContainerInner.animate({ top: newY }, 500);
	}



	function isDead() {
		if (!element.parents('body').length) {
			// element is gone now (might have switched to a different page in editor)
			_destroy();
			return true;
		}
		return false;
	}



	/* playing / pausing
	-------------------------------------------------------------------------*/


	function play(immediate) {
		if (photos.length > 1 && !playing) {
			playing = true;
			updatePlayPauseButtons();
			if (slideImgWidths[slideIndex] && slideImgHeights[slideIndex]) { // current slide already loaded
				if (immediate) {
					next() 
				}
				else {
					timedNext();
				}
			}
			trigger('play');
		}
	}


	function pause() {
		if (playing) {
			element.find('.wslide-link-thumbnail img').css({ opacity : 1 });
			playing = false;
			updatePlayPauseButtons();
			clearTimeout(playTimeoutID);
			playTimeoutID = null;
			playPauseID++;
			trigger('pause');
		}
	}


	function updatePlayPauseButtons() {
		if (photos.length > 1 && options.showPlayButton !== false) {
			if (playing) {
				playButton.css('opacity', 0).hide();
				pauseButton.css('opacity', 1).show();
			}else{
				playButton.css('opacity', 1).show();
				pauseButton.css('opacity', 0).hide();
			}
		}
	}



	/* control fading
	---------------------------------------------------------------------------*/


	function showControls(skipIndent) {
		stopFadeControls();
		if (!skipIndent) {
			indentControls();
		}
		allOverlays.show().css('opacity', 1);
		controlsVisible = true;
	}


	function indentControls() {
		overlayTopLeft.css('padding-top', indentTop);
		overlayTopLeft.css('padding-left', indentLeft);
		overlayTopRight.css('padding-top', indentTop);
		overlayTopRight.css('padding-right', indentRight);
		overlayLeft.css('padding-left', indentLeft);
		overlayRight.css('padding-right', indentRight);
	}


	function hideControls() {
		stopFadeControls();
		allOverlays.hide();
		controlsVisible = false;
	}


	function fadeControls() {
		if (controlsVisible) {
			controlsVisible = false;
			allOverlays.animate({ opacity: 0 }, {
				duration: 1000,
				complete: function() {
					hideControls();
				}
			});
		}
	}


	function stopFadeControls() {
		allOverlays.stop(true); // true = clear queue
	}



	/* Touchscreen Swiping
	-----------------------------------------------------------------------------*/

	var IS_DEBUGGING = true;
	var TOUCHSTART = IS_DEBUGGING ? 'mousedown' : 'touchstart';
	var TOUCHMOVE = IS_DEBUGGING ? 'mousemove' : 'touchmove';
	var TOUCHEND = IS_DEBUGGING ? 'mouseup' : 'touchend';
	var TOUCHCANCEL = IS_DEBUGGING ? 'xxx' : 'touchcancel';

	function initLinkSwiping(elm) {

		function touchstart(ev) {

			pause();

			if (linkIntervalID) {
				clearInterval(linkIntervalID);
				linkIntervalID = null;
				linkVelocity = 0;
			}

			var origCoord = getCoord(ev);
			var origLinkX = linkX;
			var origLinkY = linkY;
			var delta;
			var p0 = null;
			var p1 = null;
			var simulateClick = true;

			function touchmove(ev) {
				var coord = getCoord(ev);
				p0 = p1;
				p1 = coord;
				delta = coord - origCoord;
				if (Math.abs(delta) > 15) {
					simulateClick = false;
				}
				if (horizontalLinks) {
					linkX = origLinkX + delta;
					linkX = Math.max(linkMin, linkX);
					linkX = Math.min(linkMax, linkX);
					linkContainerInner.css('left', linkX);
				}else{
					linkY = origLinkY + delta;
					linkY = Math.max(linkMin, linkY);
					linkY = Math.min(linkMax, linkY);
					linkContainerInner.css('top', linkY);
				}
			}

			function touchend(ev) {
				if (simulateClick && elm.is('a')) {
					// make photoswipe show up
					window.Code.Util.Events.fire(elm[0], 'click');
				}
				if (p1 === null || p0 === null) {
					linkVelocity = 0;
				}else{
					linkVelocity = p1 - p0;
					linkVelocity = Math.max(-15, linkVelocity);
					linkVelocity = Math.min(15, linkVelocity);
				}
				linkTargetVelocity = 0;
				if (!linkIntervalID) {
					linkIntervalID = setInterval(linkMove, 35);
				}
				$(document)
					.off(TOUCHMOVE, touchmove)
					.off(TOUCHEND, touchend)
					.off(TOUCHCANCEL, touchend);
			}

			$(document)
				.off(TOUCHMOVE, touchmove)
				.off(TOUCHEND, touchend)
				.off(TOUCHCANCEL, touchend);

			return false;

		}

		elm.on(TOUCHSTART, touchstart);

	}


	function getCoord(ev) {
		if (horizontalLinks) {
			return touchCoordObj(ev).pageX;
		}else{
			return touchCoordObj(ev).pageY;
		}
	}


	function touchCoordObj(ev) {
		if (IS_DEBUGGING) {
			return ev;
		}
		return ev.touches[0];
	}



	/* rudimentary event triggering system, for public use
	------------------------------------------------------------*/

	var handlersByName = {};

	function on(name, handler) {
		var handlers = handlersByName[name] || [];
		handlers.push(handler);
		handlersByName[name] = handlers;
	}

	function trigger(name) {
		var slideshow = this;
		var args = Array.prototype.slice.call(arguments, 1);
		$.each(handlersByName[name] || [], function(i, handler) {
			handler.apply(slideshow, args);
		});
	}

	function getHandlers() {
		return handlersByName;
	}

	function setHandlers(_handlersByName) {
		handlersByName = _handlersByName;
	}

	function clearHandlers() {
		handlersByName = {};
	}



	/* window resizing
	--------------------------------------------------------------*/

	var windowResizeID = 0;

	function windowResize() {
		var savedID = ++windowResizeID;
		setTimeout(function() {
			if (savedID == windowResizeID) {
				if (!isDead()) {
					updateSize();
				}
			}
		}, 500);
	}


}



function thumbnailURL(photo) {
	var url = photo.url;
	if (!url.match("/weebly/images/")) {
		url = '/uploads/' + url.replace(/^\/uploads\//, '');
	}

	if (window.inEditor && inEditor()) {
		var Config = require('config');
		if (Config.chromeless && url.startsWith('/')) {
			url = 'http://' + configSiteName + url;
		}
	}

	return url;
}


function largeURL(photo) {
	var url = photo.url;
	if (!url.match("/weebly/images/")) {
		url = '/uploads/' + url.replace(/^\/uploads\//, '');
		if (photo.thumbnail !== false) {
			url = url.replace(/^(.*)\.([^\.]+)$/, "$1_orig.$2");
		}
	}
	
	if (window.inEditor && inEditor()) {
		var Config = require('config');
		if (Config.chromeless && url.startsWith('/')) {
			url = 'http://' + configSiteName + url;
		}	
	}

	return url;
}

function loadImage(imgNode, src, onload) {
	var intervalID = null;
	var called = false;
	function done() {
		if (intervalID) {
			clearInterval(intervalID);
			intervalID = null;
		}
		if (!called) {
			called = true;
			onload();
		}
	};
	imgNode.onload = done;
	imgNode.src = src;

	//web.archive.org/web/20141222121432/http://if url is relative, add the domain for tablet.
	if (window.inEditor && inEditor()) {
		var Config = require('config');
		if (Config.chromeless && imgNode.src.startsWith('/')) {
			imgNode.src = 'http://' + configSiteName + imgNode.src;
		}
	}
	if (imgNode.complete) {
		done();
	}else{
		intervalID = setInterval(function() {
			if (imgNode.complete) {
				done();
			}
		}, 500);
	}
}

})(Weebly, Weebly.jQuery);
/*
     FILE ARCHIVED ON 12:14:32 Dec 22, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:33:47 Apr 09, 2017.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/