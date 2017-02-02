(function() {
  /* Float navigation bar once user is about to scroll past it */
  var lastScrollPos, blocked, navEl;

  if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = ( function() {
      return window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function( cb, el ) {
               window.setTimeout( cb, 1000 / 60 );
             };
    })();
  }

  var scrollMethod = (function() {
    return document.body.scrollTop;
  })();

  function handleScroll(event) {
    /* Do nothing if scroll events fire
    *  faster than RAF processes them
    */
    if(!blocked) {
      window.requestAnimationFrame(checkFloatingNav);
    }
    blocked = true;
  }

  function checkFloatingNav() {
    if(window.scrollY !== lastScrollPos) {
      if(window.scrollY > (window.innerHeight - navEl.offsetHeight)) {
        setFloatingNav(true);
      } else {
        setFloatingNav(false);
      }
    }
    lastScrollPos = window.scrollY;
    blocked = false;
  }

  function setFloatingNav(active) {
    if(active) {
      navEl.classList.add("float");
    } else {
      navEl.classList.remove("float");
    }
  }

  navEl = document.querySelector(".nav-primary");
  window.addEventListener("scroll", handleScroll);
})();

(function() {
  /* Smooth scroll on anchor links */

  var isTouchEnabled = function () {
    return 'ontouchstart' in window;
  };

  function handleNavClick(event) {
    //event.preventDefault();
  }

  function handleNavPressUp(event) {
    var offset;
    /* find element with same ID as anchor */
    var target = document.getElementById(
      this.href.match(/#.*$/)[0].slice(1)
    );
    if(target) {
      /* Limit target scroll position to end of document */
      var scrollMax = document.documentElement.offsetHeight - window.innerHeight;
      offset = Math.min(target.offsetTop, scrollMax);
      if(offset - document.body.scrollTop) {
        animateScrollTo(offset, 333);
      } else {
        /* Already in target position, do nothing */
      }
    }
  }

  var blurEl = document.getElementById("blur").firstElementChild;

  function setMotionBlurAmount(blurAmount) {
    blurEl.setAttribute("stdDeviation",  "0," + blurAmount);
  }

  function animateScrollTo(position, speed) {
    /* Smoothly scrolls to given position
    *
    *  Scrolling is performed with constant or distance-based velocity,
    *  depending on whether speed is less or more than 50, respectively.
    */

    var startTime;
    var startPos = document.body.scrollTop;
    var finished = position === startPos;
    var distance = Math.abs(position - startPos);

    var duration = speed < 50 ?
      distance / speed :
      speed;

    var blurAmount = Math.round(distance / 60 / 2);

    setMotionBlurAmount(blurAmount);

    document.body.classList.add("scrolling");

    var stepScroll = function(currentTime) {
      if(!startTime) {
        /* Set on initial run only */
        startTime = currentTime;
      }
      var elapsedTime = Math.abs(currentTime - startTime);
      if(elapsedTime > duration) {
        finished = true;
      }
      if(!finished) {
        window.requestAnimationFrame(stepScroll);

        /* normalize timestamp => 0.0-1.0 */
        var normalizedTime = elapsedTime / duration;

        /* Cubic Ease Out */
        var easedTime = (--normalizedTime) * normalizedTime * normalizedTime + 1;

        var newPos = lerp(startPos, position, easedTime);
        document.body.scrollTop = Math.round(newPos);
      } else {
        /* Time is up! Snap to final position */
        document.body.classList.remove("scrolling");
        document.body.scrollTop = position;
      }
    };

    window.requestAnimationFrame(stepScroll);
  }

  function lerp (x1, x2, t) {
    return (1 - t) * x1 + t * x2;
  }

  var anchorLinks = Array.prototype.slice.call(
    document.querySelectorAll("a[href^='#']")
  ).filter(function(el){
    return el.href.split("#")[1].length > 0;
  });

  var touch = isTouchEnabled();
  anchorLinks.forEach(function(link) {
    link.addEventListener(touch ? "tap" : "click", handleNavClick);
    link.addEventListener(touch ? "touchend" : "mouseup", handleNavPressUp);
  });
})();

(function() {
  var blocked;
  var marginShow = .85;
  var marginHide = .15;
  var sectionEls = Array.prototype.slice.call(
    document.body.querySelectorAll(".page")
  );

  function handleScroll(event) {
    if(!blocked) {
      window.requestAnimationFrame(checkVisibleSections);
    }
    blocked = true;
  }

  function checkVisibleSections() {
    var scrollSections = sectionEls.map(function(e, i) {
      return {offset:e.offsetTop,height:e.offsetHeight};
    });
    var scrollPos = document.body.scrollTop;
    scrollSections.forEach(function(e, i) {
      if(scrollPos < e.offset - window.innerHeight * marginShow ||
         scrollPos > (e.offset + e.height) - window.innerHeight * marginHide) {
        sectionEls[i].classList.add("scrollOut");
      } else {
        sectionEls[i].classList.remove("scrollOut");
      }
    });
    blocked = false;
  }
  window.addEventListener("scroll", handleScroll);
})();

(function(){
  var dots = [];
  var canvas = document.createElement("canvas");
  var baseColor = window.getComputedStyle(document.documentElement).backgroundColor;
  var endColor = window.getComputedStyle(document.body).backgroundColor;
  canvas.classList.add("fx");
  var rem = window.getComputedStyle(document.documentElement).fontSize.replace("px","");
  var context = canvas.getContext("2d");
  context.fillStyle = baseColor;
  var gradient;

  document.body.insertBefore(canvas, document.body.firstChild);

  function Dot() {
    var d = {};
    d.x = Math.random() * canvas.width;
    d.y = Math.random() * canvas.height;
    d.z = Math.random() * 4;
    d.update = function() {
      d.y = d.y - (d.z/4);
      if(d.y < 0-d.z ||d.x > canvas.width) {
        d.y = canvas.height + d.z;
        d.x = Math.random() * canvas.width;
      }
    };
    d.draw = function() {
      context.fillRect(d.x, d.y, d.z, d.z);
    };
    return d;
  }

  function init() {
    resize();
    context.fillStyle = gradient;
    context.fillRect(0,0,canvas.width,canvas.height);
    for(var i = 0; i < 25; i++) {
      dots.push(new Dot());
    }
  }

  function step() {
    window.requestAnimationFrame(step);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 1)";
    dots.forEach(function(e) {
      e.update();
      e.draw();
    });
  }

  function resize () {
    canvas.width = window.innerWidth;
    canvas.height = Math.round((window.innerHeight / 2) + (rem * 1.5));

    gradient = context.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0,baseColor);
    gradient.addColorStop(1,endColor);
  }

  window.addEventListener("resize", resize);

  init();
  step();
})();
