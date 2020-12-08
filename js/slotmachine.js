var startSeqs = {}; //declaring an object
var startNum = 0;

// jQuery FN
$.fn.playSpin = function () { //playspin function we run with button
    if (this.length) {
        if ($(this).is(':animated')) return; // Return false if this element is animating. Can t start if running
        startSeqs['mainSeq' + (++startNum)] = {}; //names id for each object startNum1, startnum2 etc.

        var total = this.length;
        var thisSeq = 0;

        // Initialize options
            options = new Object(); //create new object callen options for later use



        startSeqs['mainSeq' + startNum]['totalSpinning'] = total; //create object called totalSpinning (how many are still spinning)

        return this.each(function () {
            startSeqs['mainSeq' + startNum]['subSeq' + (++thisSeq)] = {}; //create object called subSeq1, 2 or 3)
            startSeqs['mainSeq' + startNum]['subSeq' + thisSeq]['spinning'] = true; // create variable in object called spinning:true
            var track = {
                total: total, //how many slots (image rolls)
                mainSeq: startNum, //how many times have it spun (clicks on button)
                subSeq: thisSeq // what placement does the slot has (1, 2 or 3)
            };
            (new slotMachine(this, track)); //creates new slot each time it loops (3 times)

        });
    }
};



var slotMachine = function (el, track) { //create slotMachine function
    var slot = this; // undersøg nærmere er forvirret!!---------------------------------------------------------------------------------------------------------
    slot.$el = $(el); //sets slot.el to be the this from the previous function (html ul with images)

    slot.defaultOptions = {
        time: 3000,             // Number: total time of spin animation
        loops: 6,               // Number: times it will spin during the animation
        endNum: 0             // Number: animation end at which number/ sequence of list
    };

    slot.spinSpeed = 0;
    slot.loopCount = 0;

    slot.init = function () {
        slot.options = $.extend({}, slot.defaultOptions); //sets options to be the defaultOptions
        slot.setup(); // runs the functions
        slot.startSpin();
    };

    slot.setup = function () {
        var $li = slot.$el.find('li').first(); // takes first li in the ul and set it to $li
        slot.liHeight = $li.innerHeight(); // set the liheight to the height of the li element
        slot.liCount = slot.$el.children().length; //set licount to the amount of pictures in the ul
        slot.listHeight = slot.liHeight * slot.liCount; // calculate the heigth for every picture together in the list
        slot.spinSpeed = slot.options.time / slot.options.loops; // calculate the spinspeed from the default options

        $li.clone().appendTo(slot.$el); // Clone to last row for smooth animation


    };
// function that changes the css and animation (runs 6 times)
// then runs another function lowerspeed
    slot.startSpin = function () {
        slot.$el
            .css('top', -slot.listHeight)
            .animate({'top': '0px'}, slot.spinSpeed, 'linear', function () {
                slot.lowerSpeed();
            });

    };

    slot.lowerSpeed = function () {
        slot.loopCount++; // adds 1 to loopcount

        if (slot.loopCount < slot.options.loops ) { // stops when it has run 6 times (because loop = 6)
            slot.startSpin(); // runs previus function 6 times
        } else {
            slot.endSpin();
        }
    };


// nået hertil!!!!!-------------------------------------------------------------------------------------------------------------------------
    slot.endSpin = function () {
        if (slot.options.endNum == 0) {
            slot.options.endNum = slot.randomRange(1,2); //slot.liCount);
        }

        // Error handling if endNum is out of range
        if (slot.options.endNum < 0 || slot.options.endNum > slot.liCount) {
            slot.options.endNum = 1;
        }

        var finalPos = -((slot.liHeight * slot.options.endNum) - slot.liHeight);
        var finalSpeed = ((slot.spinSpeed * 1.5) * (slot.liCount)) / slot.options.endNum;

        slot.$el
            .css('top', -slot.listHeight)
            .animate({'top': finalPos}, finalSpeed, 'swing', function () {
                slot.$el.find('li').last().remove(); // Remove the cloned row

                slot.endAnimation(slot.options.endNum);
                if ($.isFunction(slot.options.onEnd)) {
                    slot.options.onEnd(slot.options.endNum);
                }

                // onFinish is every element is finished animation
                if (startSeqs['mainSeq' + track.mainSeq]['totalSpinning'] == 0) { //when totalspinning=0 (nothing moving anymore)
                    var totalNum = '';
                    var winning = true;
                    var lastNum = 0;
                    var subSeqs_counter = 0;

                    $.each(startSeqs['mainSeq' + track.mainSeq], function(index, subSeqs) {
                        if (typeof subSeqs == 'object') {
                            if ( subSeqs_counter> 0 && winning == true) {
                              if (lastNum != subSeqs['endNum'])
                              {
                                winning = false;

                              }
                            }
                        lastNum = subSeqs['endNum'];
                        subSeqs_counter++;
                        }
                    });

                   DB_Winner_Write(winning);
                }
            });
    }

    slot.endAnimation = function(endNum) {
        startSeqs['mainSeq' + track.mainSeq]['totalSpinning']--; //count totalspinning down
        startSeqs['mainSeq' + track.mainSeq]['subSeq' + track.subSeq]['endNum'] = endNum;
    }

    slot.randomRange = function (low, high) {
        return Math.floor(Math.random() * (1 + high - low)) + low;
    };

    this.init();
};

// funktion to write result to winner database (true or false)
function DB_Winner_Write(won) {
  firebase.database().ref("winner").push({won:won});
}

// test button write to database
// function test() {
//   firebase.database().ref("Payment").push({Paid:true});
// }

// test start when new input enters database
firebase.database().ref('inputcode1').on('value',(snap)=>{
  $('#example6 ul').playSpin();
  });
