``
/** Merve Erdogan **/
// PLC - incidental processing experiment//
/*

/*
===============================================================
INSTRUCTIONS
===============================================================
*/

instr_text_stiffLess = ['In some of the displays, dots will move in a way that the pattern looks like a more stiff cloth to many people, in some others the pattern will look like a less stiff cloth. <p>Please click on the “Next” button to see an example of a "less stiff" cloth.'];

instr_text_stiffMore = ['On the next page, the pattern will look like a more stiff cloth than the one you just saw. <p>Please click on the “Next” button and try to realize how this one is different than the previous one.'];


function loadInstrContentStart() {
    var instrContentStart = [ /* ind0 */ '<p>Hello! Thank you for volunteering to help out with our study. Please take a moment to adjust your seating so that you can comfortably watch the monitor and use the keyboard. Feel free to dim the lights as well.</p><p>Close the door or do whatever is necessary to <b>minimize disturbance during the experiment</b>. Please also take a moment to silence your phone so that you are not interrupted by any messages mid-experiment. Do <i>not</i> switch to any other tabs or windows until you are complete.</p><p>We will now go over the instructions.  Please <strong>read these carefully </strong>, as you will not be able to complete this experiment without following them precisely.  <br> <br> A “Next” button will appear at the bottom of the screen on each page. This button will be greyed out at the beginning and will be activated after a few seconds (giving you time to read the instructions on each page). Please read everything on each page carefully before clicking on the "Next" button to continue to the next page. </p>',
        /* ind1 */ 'In this experiment, after seeing a "+" shape, you will see displays in which there are many white dots moving. The movements of  dots will create a pattern that looks to many people like a sheet on a clothesline is waving in the wind. Please click on the “Next” button to see an example of this pattern.',
    ]

    for (var i = 0; i < instrContentStart.length; i++) {
        instrContentStart[i] = "<div style='display: inline-block; margin: 0 auto; color: " + text_color + "; padding: 10px 200px 10px 200px; text-align: left'>" + instrContentStart[i] + "</div>"
    }
    return instrContentStart
}


instr_text_keypress = ["Your task will just be to indicate (by pressing a key) as quick as possible whether the cloth in the display is the more stiff one or the less stiff one. You should press the 'f' key if the cloth in the display seems as the less stiff one and you should press the 'j' key if it looks like the more stiff one. During the actual test, if you don’t respond before the display ends, you’ll receive a warning — and have to wait through it, which will make the experiment take longer. So, do your best to respond as quickly as possible, while still being accurate. <p>Please click the “Next” button to try it out. Please keep your eyes at the '+' shape, this will also help you to be faster as the cloth will appear at the same place."]


instr_text_flankers = [
    "One more thing: In addition to the waving cloth pattern at the center, there will also be other cloths around it. These may be the same as or different from the central cloth, but regardless they are not relevant to your task. <br><br> Your only job is to respond whether the **central** cloth (the one that appears at the place of the '+' shape) seems to be the more or less stiff one — so try to ignore the additional cloths on the sides and focus only on the center. <p>Please click the “Next” button to see an example where there are additional cloths.</p>"
];

instr_text_expStart = ["During the actual experiment, you will see patterns that look like a waving-cloth at varying level of stiffness. These patterns might be the <b>upright</b> or <b>upside down</b> version of the waving-cloth. But in all cases you’ll just be doing the same task you did repeatedly, for about " + String(estTotalRunTime) + " minutes. Please try hard to stay focused and still attend carefully to each display, since some displays will involve subtle differences. I can only benefit from your responses if you focus on the displays and try to give responses as carefully as you can. You can start the experiment by pressing any key."]

/*===============================================================
               INSTRUCTION PROCEDURE
===============================================================
*/
//test quetion
var test_question = ["<div style='text-align: left; color: " + text_color + ";'><strong>LESS STIFF: f</strong><span style='padding-left:150px;''><strong>MORE STIFF: j</strong></div>"];


var instrContentStart = loadInstrContentStart();
var instr_start = {
    type: 'instructions',
    pages: instrContentStart,
    allow_keys: false,
    show_clickable_nav: true,
    button_delay: delay,
    allow_backward: false,
    data: { trial_category: 'Other' },
};


var instrCloth_video = {
    type: 'plc_display',
    dot_pos: cloth_eg_med,
    clothType: function () {
        return getVariableName(cloth_eg_med); //name of the cloth
    },
    equalizeSpeed: false,
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    scrambled: false,
    grid: true,
    grid_offSet: offSet_value,
    limitedTime: false,
    fps: fps,
    centerCloth: true,
    scaling: scaling_value,
    inverted: instrInverted,
}


//instruction for less
var instr_stiffLess = {
    type: 'instructions',
    pages: standard_instr_style(instr_text_stiffLess),
    allow_keys: false,
    show_clickable_nav: true,
    button_delay: delay,
    allow_backward: false,
    data: { trial_category: 'Other' },
};

//the video of more stiff cloth
var instrStiffLess_video = {
    type: 'plc_display',
    dot_pos: cloth_eg_lessSt,
    clothType: function () {
        return getVariableName(cloth_eg_lessSt); //name of the cloth 
    },
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    noise_num: 0,
    scrambled: false,
    grid: true,
    grid_offSet: offSet_value,
    limitedTime: false,
    fps: fps,
    centerCloth: true,
    scaling: scaling_value,
    inverted: instrInverted,
}

//instruction for more stiff
var instr_stiffMore = {
    type: 'instructions',
    pages: standard_instr_style(instr_text_stiffMore),
    allow_keys: false,
    show_clickable_nav: true,
    button_delay: delay,
    allow_backward: false,
    data: { trial_category: 'Other' },
};

//the video of a more stiff cloth
var instrStiffMore_video = {
    type: 'plc_display',
    dot_pos: cloth_eg_moreSt,
    clothType: function () {
        return getVariableName(cloth_eg_moreSt); //name of the cloth 
    },
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    noise_num: 0,
    scrambled: false,
    grid: true,
    grid_offSet: offSet_value,
    limitedTime: false,
    fps: fps,
    centerCloth: true,
    scaling: scaling_value,
    inverted: instrInverted,
}


//instruction for more stiff
var instr_keypress = {
    type: 'instructions',
    pages: standard_instr_style(instr_text_keypress),
    allow_keys: false,
    show_clickable_nav: true,
    button_delay: delay,
    allow_backward: false,
    data: { trial_category: 'Other' },
};
//["<div style='text-align: left; color: " + text_color + ";'><strong>NO CLOTH: f</strong><span style='padding-left:150px;''><strong>WAVING-CLOTH: j</strong></div>"];

var instr_fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div style="font-size:60px; color:white;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: function () {
        return Math.floor(Math.random() * (800 - 400 + 1)) + 400;
    },
    post_trial_gap: 0,
    data: { trial_category: 'Other' },
};

var instr_startTrial = {
    type: 'html-keyboard-response',
    stimulus: '<div style="color: ' + text_color + '; font-size: 32px;">Press Space key to start.<br><br>Be ready to make a keypress to report the central cloth stiffness.<br><br><p><strong><span style="font-size: 40px;">Less Stiff: f <span style="padding-left: 300px">More Stiff: j</span></strong></p></div>',
    choices: [" "],
    post_trial_gap: 100,
    data: { trial_category: 'Other' },
};


var instrTestStiffLess = {
    type: 'plc_flanker_task',
    dot_pos: cloth_eg_lessSt,
    targetClothType: function () {
        return getVariableName(cloth_eg_lessSt); //name of the cloth 
    },
    targetStiffnessLevel: 0,
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    grid_offSet: offSet_value,
    fps: fps,
    scaling: scaling_value,
    equalizeSpeed: false,
    distractorNum: 0,
}

var instrTestStiffMore = {
    type: 'plc_flanker_task',
    dot_pos: cloth_eg_moreSt,
    targetClothType: function () {
        return getVariableName(cloth_eg_moreSt); //name of the cloth 
    },
    targetStiffnessLevel: 1,
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    grid_offSet: offSet_value,
    fps: fps,
    scaling: scaling_value,
    equalizeSpeed: false,
    distractorNum: 0,
}

//instruction for flankers
var instr_flankers = {
    type: 'instructions',
    pages: standard_instr_style(instr_text_flankers),
    allow_keys: false,
    show_clickable_nav: true,
    button_delay: delay,
    allow_backward: false,
    data: { trial_category: 'Other' },
};

var instrTestWithFlankers = {
    type: 'plc_flanker_task',
    dot_pos: cloth_eg_moreSt,
    targetClothType: function () {
        return getVariableName(cloth_eg_moreSt); //name of the cloth 
    },
    targetStiffnessLevel: 1,
    motion: 'wind',
    gridX: xNum,
    gridY: yNum,
    grid_offSet: offSet_value,
    fps: fps,
    scaling: scaling_value,
    equalizeSpeed: false,
    // NEW VARIABLES FOR FLANKER TASK
    distractorNum: 2,
    distractorCongruent: true, // true = same motion as target, false = use distractor_dot_pos
    distractor_dot_pos: cloth_eg_moreSt,
    distractorDistance: flankerDistance, // distance (in px) from center to left/right flankers
}


var instr_end = {
    type: 'html-keyboard-response',
    stimulus: standard_instr_style(instr_text_expStart),
    data: { trial_category: 'Other' },
    on_finish: function () {
        var instr = jsPsych.data.get();
        saveData('instr_' + participantID, instr.csv(), save_folder_instructions);
    }
}


instructions = [instr_start, cursor_off, instr_fixation, instrCloth_video, cursor_on, instr_stiffLess, cursor_off, instr_fixation, instrStiffLess_video, cursor_on, instr_stiffMore, cursor_off, instr_fixation, instrStiffMore_video, cursor_on, instr_keypress, cursor_off, instr_startTrial, instr_fixation, instrTestStiffLess, cursor_off, instr_startTrial, instr_fixation, instrTestStiffMore, cursor_on, instr_flankers, cursor_off, instr_startTrial, instr_fixation, instrTestWithFlankers, cursor_off, instr_end]