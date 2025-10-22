/* ------------------------------------------
Merve Erdogan - 10.17.25
Furrow Illusion - Object Stretch Pilot
Task: Size Reproduction
------------------------------------------
Conditions: 3x2x3 = 18
- Stripe Angle (left, right): [45, -45] (/\  shaped stretch) , [-45,45] (\/ shaped stretch), [90,90] (|| control)
- Object End Location (a constant px from center):  [top, bottom] 
    -- depending on the stripe angle, test object perceived length in that location is different
    -- [45, -45] (/\ shaped stretch) -> top location: smaller, bottom location: larger
    -- [-45,45] (\/ shaped stretch) -> top location: larger, bottom location: smaller
    -- [90,90] (|| control) -> same length in both locations
- Target object width (px): [100, 160, 220]

Parameters: (generally applied to all trials but can be adjusted for experiments)
- Furrow Mode: 'peephole' or 'furrow'
- Reproduction Task: 'keys' or 'mouse'
- Reproduction Object Length (constant for all trials): 40px
------------------------------------------*/


/*===============================================================
          EXPERIMENT MODES & DEBUGGING
===============================================================*/
shortVersion = true;
//run short version
if (shortVersion == true) {
    blockNum = 1;
    trialPerCondNumPerBlock = 1; //number of trials per condition per block
    trialPerCondNumTotal = blockNum * trialPerCondNumPerBlock; //number of trials per condition total
    debug = true;
} else {
    blockNum = 2; //number of blocks
    trialPerCondNumPerBlock = 4; //number of trials per condition per block
    trialPerCondNumTotal = blockNum * trialPerCondNumPerBlock; //number of trials per condition total
    debug = false;
}

debug = true;
runIntro = false;
runInstr = false;

//instruction delays & screen locking
if (debug == false) {
    delay = true;
    lockExp = true;
} else {
    delay = false;
    lockExp = false;
}


/*===============================================================
          EXPERIMENT-SPECIFIC PARAMETERS
===============================================================*/
/*===============================
CONDITIONS
===============================*/
stripeAngleCond = [[45, -45], [-45, 45], [90, 90]];
targetObjEndPosCond = ['top', 'bottom'];
targetObjWidthCond = [100, 160, 220];

/*===============================
PARAMETERS
===============================*/
paramsGeneral = {
    furrowMode: 'peephole',
    backgroundColor: 'grey',
    stripeWidth: 20,
    cycleNumber: 10,
    targetObjSpeed: 300,
    targetObjMotionRange: 200,
    testObjHeight: 10,
    testObjLength: 60,
}

/*=============================   
ONLINE EXPERIMENT PARAMETERS
===============================*/
let estTotalRunTime = 3;
let exp_compensation = "$" + (estTotalRunTime * .14).toFixed(2).toString();
let completion_code = 'CGPSIGCY';
let study_title = 'Object Size Reproduction'

var path = window.location.pathname;
var page = path.split("/").pop();
expt_name = page.replace(".html", "");
exp_version = "p1.1"
expt_name = expt_name + '_' + exp_version;

save_folder_full = 'data/full/' + expt_name + '';
save_folder_filtered = 'data/filtered/' + expt_name + '';
let exp_date = new Date().toISOString().split('T')[0];


/*============================= 
SCREEN FEATURES
===============================*/
//The coordinate for the center of the screen
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
var screenCenter = [w / 2, h / 2];
var text_color = 'white';
var screen_color = "black";
let forceFullscreen = true;
let fullscreenActive = false;



/*============================= 
CREATE CONDITIONS ARRAY
===============================*/
// Auto-discover all globals ending in "Cond" and build factorLevels
const factorLevels = {};
for (const key in window) {
    if (!Object.prototype.hasOwnProperty.call(window, key)) continue;
    if (!key.endsWith('Cond')) continue;
    const levels = window[key];
    if (Array.isArray(levels) && levels.length > 0) {
        const factorName = key.slice(0, -4); // drop 'Cond'
        factorLevels[factorName] = levels;
    }
}

const conditionCombos = createConditionCombos(factorLevels);

conditionNum = conditionCombos.length;
blockTrialNum = conditionNum * trialPerCondNumPerBlock;
totalTrialNum = blockTrialNum * blockNum;

// Build conditions ensuring equal trials per condition per block
const factorKeys = Object.keys(factorLevels);
conditions = {};

for (const key of factorKeys) conditions[key] = [];

for (let b = 0; b < blockNum; b++) {
    //each condition index repeated trialPerCondNumPerBlock times
    const idxs = [];
    for (let i = 0; i < conditionNum; i++) {
        for (let r = 0; r < trialPerCondNumPerBlock; r++) idxs.push(i);
    }
    const shuffled = shuffle(idxs);
    for (let t = 0; t < shuffled.length; t++) {
        const combo = conditionCombos[shuffled[t]];
        for (const key of factorKeys) conditions[key].push(combo[key]);
    }
}



/*============================= 
FUNCTIONS TO USE IN THIS FILE
===============================*/
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Cartesian product of factor levels -> array of condition objects
function createConditionCombos(levelsObj) {
    const keys = Object.keys(levelsObj);
    if (keys.length === 0) return [];
    return keys.reduce((acc, key) => {
        const vals = levelsObj[key];
        const next = [];
        for (const base of acc) {
            for (const v of vals) {
                next.push({ ...base, [key]: v });
            }
        }
        return next;
    }, [{}]);
}