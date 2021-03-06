//
// if((navigator.userAgent.match(/iPhone/i)) ||
//  (navigator.userAgent.match(/iPod/i))) {
//    console.log('guz');
// } else {
//     window.onload = init;
// }
    window.onload = init;



function init() {
  /*
    Read my blog post about Web Audio API:
    http://codepen.io/DonKarlssonSan/blog/fun-with-web-audio-api
  */
    var $playButtonFirst = $('#playButtonFirst'),
        $playButtonSecond = $('#playButtonSecond'),
        $slider = $('#div-slider'),
        $body = $('body');

    var AudioContext;
    var audioFirst,
        audioSecond,
        audio;

    var sliderFirstMax,
        sliderSecondMax;

    var totalTimeFirst,
        totalTimeSecond;

    var audioFirstPlaying = false,
        audioSecondPlaying = false;

    var audioContext;
    var source;
    var analyser;

    var canvas = document.getElementById("theCanvas");
    var canvasContext = canvas.getContext("2d");
    var dataArray;
    var analyserMethod = "getByteTimeDomainData";
    var slider = document.getElementById("slider");
    var streamUrlFirst,
        streamUrlSecond;
    var isIdle = true;

    var refreshIntervalId;

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    function initAudio(streamUrlFirst, streamUrlSecond ) {
      AudioContext = window.AudioContext || window.webkitAudioContext;

      audioFirst = new Audio();
      audioSecond = new Audio();

      audioFirst.crossOrigin = "anonymous";
      audioSecond.crossOrigin = "anonymous";

      audioFirst.preload = "auto";
      audioSecond.preload = "auto";

      audioContext = new AudioContext();
      source = audioContext.createMediaElementSource(audioFirst);
      source.connect(audioContext.destination);
      analyser = audioContext.createAnalyser();
      source.connect(analyser);
    };

    function get(url, callback) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
          callback(request.responseText);
        }
      }

      request.open("GET", url, true);
      request.send(null);
    }

    var clientParameter = "client_id=3b2585ef4a5eff04935abe84aad5f3f3"

    // Basing everything on the track's permalink URL. That is what the user knows.
    // Makes it possible to use the text box for pasting any track URL.
    // The Outsider is a friend of mine.
    // The majority of his tracks are on Mixcloud:
    // https://www.mixcloud.com/outsider_music/
    var trackPermalinkUrlFirst = "275604209",
        trackPermalinkUrlSecond = "275604335";

    var firstTrackUrl,
        secondTrackUrl;

    function findTrack() {
       get(firstTrackUrl,
           function (response) {
         var trackInfo = JSON.parse(response);
         sliderFirstMax = trackInfo.duration / 1000;
         document.getElementById("totalTime").innerHTML = millisecondsToHuman(trackInfo.duration);
         streamUrlFirst = trackInfo.stream_url + "?" + clientParameter;
         audioFirst.src = streamUrlFirst;
         audioFirst.play();
         audioFirst.pause();
       }
      );
      get(secondTrackUrl,
          function (response) {
        var trackInfo = JSON.parse(response);
        sliderSecondMax = trackInfo.duration / 1000;
        totalTimeSecond = millisecondsToHuman(trackInfo.duration);
        streamUrlSecond = trackInfo.stream_url + "?" + clientParameter;
        console.log('Responded');
        audioSecond.src = streamUrlSecond;
        audioSecond.play();
        audioSecond.pause();
      }
     );
     };

    function startButton_Clicked(audio) {
      audio.play();
      slider.value = audio.currentTime;
      console.log("in startButton_Clicked mathod");
      // Using four seconds so the user can change the value of
      // the slider. Too short interval will cause the automatic
      // updating to steal the control from the user.
        refreshIntervalId = setInterval(function () {
            slider.value = audio.currentTime;
        }, 2000);
    }

    function jumpTo(here) {
    console.log('AudioFirstPlaying: ' + audioFirstPlaying + " audioSecondPlaying" + audioSecondPlaying);
    if(audioFirstPlaying) {
        if (!audioFirst.readyState) return false;
        audioFirst.currentTime = here;
    } else {
        if (!audioSecond.readyState) return false;
    console.log(here);
        audioSecond.currentTime = here;
        }
    };

    slider.addEventListener("change", function () {
        jumpTo(this.value);
    });

    function millisecondsToHuman(milliseconds) {
      var date = new Date(null);
      date.setMilliseconds(milliseconds);
      return date.toISOString().substr(11, 8);
    };
    document.getElementById("playButtonFirst").addEventListener("click", function() {
        pauseAudio(audioSecond);
        console.log('First Button Pressed');
        if(audioFirstPlaying) {
            $playButtonFirst.removeClass('playing');
            $playButtonSecond.removeClass('playing');
            $slider.removeClass('visible');
            audioFirstPlaying = false;
            audioSecondPlaying = false;
            pauseAudio(audioFirst);
        } else {
            clearInterval(refreshIntervalId);
            $playButtonSecond.removeClass('playing');
            $playButtonFirst.addClass('playing');
            slider.max = sliderFirstMax;
            if($slider.hasClass('visible')){}
            else {
                $slider.addClass('visible');
            }
            audioFirstPlaying = true;
            audioSecondPlaying = false;

            startButton_Clicked(audioFirst);
        }
    });
    document.getElementById("playButtonSecond").addEventListener("click", function() {
        pauseAudio(audioFirst);
        console.log('Second Button Pressed');
        if(audioSecondPlaying) {
            $playButtonFirst.removeClass('playing');
            $playButtonSecond.removeClass('playing');
            $slider.removeClass('visible');
            audioFirstPlaying = false;
            audioSecondPlaying = false;
            pauseAudio(audioSecond);
        } else {
            clearInterval(refreshIntervalId);

            if($slider.hasClass('visible')){}
            else {
                $slider.addClass('visible');
            }
            slider.max = sliderSecondMax;
            $playButtonFirst.removeClass('playing');
            $playButtonSecond.addClass('playing');
            audioSecondPlaying = true;
            audioFirstPlaying = false;
            startButton_Clicked(audioSecond);
        }
    });

    function pauseAudio(audio) {
        audio.pause();
    }

    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        console.log('add the f* class');
        $('#div-slider').addClass('is-safari');
        $body.addClass('show-overlay');
        console.log("why you no work?");

        firstTrackUrl = "http://api.soundcloud.com/tracks/" +  trackPermalinkUrlFirst + "?" + clientParameter,
        secondTrackUrl = "http://api.soundcloud.com/tracks/" +  trackPermalinkUrlSecond + "?" + clientParameter;

       document.getElementById("load").addEventListener("click", function() {
           $body.addClass('hide-overlay');
           findTrack();
           initAudio();
       });
    } else {
        firstTrackUrl = "http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/user-50631610/paddy-telefon-kampaniya-1&client_id=3b2585ef4a5eff04935abe84aad5f3f3"
        secondTrackUrl = "http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/user-50631610/paddy-telefon-kampaniya-2&client_id=3b2585ef4a5eff04935abe84aad5f3f3";
        console.log('Audio Initiated');
        $body.addClass('hide-overlay');
        findTrack();
        initAudio();
    }
}
