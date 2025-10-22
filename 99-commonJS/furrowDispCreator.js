// Merve Erdogan - 10.17.25
// Furrow Illusion - obj Stretching Plugin
/*------------------------------------------
Display creator plugin - details:

------------------------------------------*/


/*===============================================================
                    PLUGIN PARAMETERS
================================================================*/
jsPsych.plugins["furrowDispCreator"] = (function () {
    var plugin = {};
    plugin.info = {
        name: "furrowDispCreator",
        parameters: {
            furrowMode: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'furrow',
                pretty_name: 'Furrow mode',
                description: "'furrow' or 'peephole'"
            },
            splitStripeEnabled: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: true,
                pretty_name: 'Split stripe enabled',
                description: 'If true, split the stripe angle into two half angles(left & right)'
            },
            stripeAngle: {
                type: jsPsych.plugins.parameterType.obj,
                default: [45, -45],
                pretty_name: 'Stripe angle',
                description: 'Angle of stripes in degrees (left & right)'
            },
            stripeWidth: {
                type: jsPsych.plugins.parameterType.INT,
                default: 10,
                pretty_name: 'Stripe frequency (width px)',
                description: 'Width of each stripe'
            },
            stripeLuminance: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 0.5,
                pretty_name: 'Stripe luminance',
                description: 'Mean luminance of stripes (0–1)'
            },

            cycleNumber: {
                type: jsPsych.plugins.parameterType.INT,
                default: 4,
                pretty_name: 'Cycle Number',
                description: 'Number of cycles in the pattern'
            },
            bgColor: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'grey',
                pretty_name: 'Background color',
                description: 'CSS color of the background'
            },
            sideMarginProp: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 0,
                pretty_name: 'Side margin proportion',
                description: 'Horizontal margin from edges as a proportion of screen width (0–0.5)'
            },
            fixationSide: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'left',
                pretty_name: 'Fixation side',
                description: "Which side holds fixation: 'left' or 'right'"
            },
            fixationMargin: {
                type: jsPsych.plugins.parameterType.INT,
                default: 100,
                pretty_name: 'Fixation margin',
                description: 'Fixation margin from the edge of the screen'
            },

            objWidth: {
                type: jsPsych.plugins.parameterType.INT,
                default: 160,
                pretty_name: 'Object width (px)',
                description: 'Width of the moving obj in pixels'
            },
            objHeight: {
                type: jsPsych.plugins.parameterType.INT,
                default: 20,
                pretty_name: 'Object height (px)',
                description: 'Height of the moving object in pixels'
            },
            objColor: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 'grey',
                pretty_name: 'Obj color',
                description: 'Used as solid fill in furrow mode'
            },
            objShape: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'hline',
                pretty_name: 'Object shape',
                description: "'heart' or 'hline' (horizontal line)"
            },
            objStartPosPx: {
                type: jsPsych.plugins.parameterType.INT,
                default: null,
                pretty_name: 'Object start position (x, y)',
                description: 'If null, placed opposite fixation using offsets'
            },
            objMotionRange: {
                type: jsPsych.plugins.parameterType.INT,
                default: 100,
                pretty_name: 'Object motion range (px)',
                description: 'Half-amplitude for horizontal back-and-forth motion'
            },
            objEndPosRelativeToStart: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'bottom',
                pretty_name: 'Obj end position relative to start',
                description: "Where to end trial when obj completes motion: 'top' or 'bottom'"
            },
            objSpeed: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 200,
                pretty_name: 'obj Speed',
                description: 'Speed of motion in pixels per second'
            },
        }
    }

    /*===============================================================
                        TRIAL FUNCTION
    ================================================================*/
    plugin.trial = function (display_element, trial) {
        /*
        ============================
        DEFINING CANVAS 
        ============================
        */
        var html = '<canvas id="myCanvas"></canvas>';
        display_element.innerHTML = html;
        display_element.style.margin = "0";
        display_element.style.padding = "0";
        var canvas = document.getElementById('myCanvas');
        var cx = canvas.getContext("2d");
        var w = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
        var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var screenCenter = { x: (w / 2), y: (h / 2) };
        canvas.width = w;
        canvas.height = h;

        document.body.style.overflow = 'hidden';
        document.body.style.cursor = 'none'; // <-- hide the cursor
        /*
        ============================
        SCREEN SETUP 
        ============================
        */
        // if only fixation side defined in the trial parameters
        if (String(trial.fixationSide).toLowerCase() === 'right') {
            fixX = w - trial.fixationMargin;
            sideSign = -1;
        } else {
            fixX = trial.fixationMargin;
            sideSign = 1;
        }
        fixY = screenCenter.y;

        baseX = round(screenCenter.x, 0);
        baseY = fixY;

        drawFixation();
        /*
        ============================
        START THE DISPLAY
        ============================
        */


        // Set initial position based on where it should end
        const endPos = String(trial.objEndPosRelativeToStart).toLowerCase();
        if (endPos === 'bottom') {
            motionOffset = trial.objMotionRange / 2; // Start from bottom
            motionDir = -1; // Move downward
        } else {
            motionOffset = -trial.objMotionRange / 2; // Start from top  
            motionDir = 1; // Move upward
        }
        const displayDuration = ((trial.objMotionRange * trial.cycleNumber) / trial.objSpeed) * 1000;


        // Track actual motion measurements
        let framePositions = []; // Every frame position
        let directionChangePositions = []; // Only when direction changes
        let totalTrajectoryPx = 0;

        let actualCycles = 1;
        let maxMotionOffset = 0;
        let minMotionOffset = 0;
        let lastFrameX = baseX;
        let lastFrameY = baseY;

        var trialStartTime = performance.now();

        //show fixation for 1 second, then start the display
        setTimeout(() => startDisplay(), 1000);
        function startDisplay() {
            displayStartTime = performance.now();
            fixatonDuration = displayStartTime - trialStartTime;
            lastFrameTs = displayStartTime;
            directionChangePositions.push({
                x: baseX,
                y: round(baseY + motionOffset, 0),
                time: round(performance.now() - displayStartTime, 2)
            });
            render();
        }

        function render() {
            const now = performance.now();
            const dt = Math.min(0.05, (now - lastFrameTs) / 1000);
            lastFrameTs = now;
            if (now - displayStartTime < displayDuration) {
                // Move the object
                motionOffset += motionDir * trial.objSpeed * dt;

                // Clamp to boundaries to prevent overshooting
                motionOffset = Math.max(-trial.objMotionRange / 2, Math.min(trial.objMotionRange / 2, motionOffset));

                // Calculate current position
                const currentX = round(baseX, 0);
                const currentY = baseY + motionOffset;

                // Save every frame position
                framePositions.push({
                    x: round(currentX, 0),
                    y: round(currentY, 0),
                    time: round(now - displayStartTime, 2)
                });
                // Track actual motion range
                maxMotionOffset = Math.max(maxMotionOffset, motionOffset);
                minMotionOffset = Math.min(minMotionOffset, motionOffset);

                // Check for direction changes (only when hitting exact boundaries)
                if (motionOffset >= trial.objMotionRange / 2 && motionDir === 1) {
                    directionChangePositions.push({
                        x: round(currentX, 0),
                        y: round(currentY, 0),
                        time: round(now - displayStartTime, 2)
                    });
                    motionDir = -1;
                    actualCycles = actualCycles + 1;
                }
                if (motionOffset <= -trial.objMotionRange / 2 && motionDir === -1) {
                    directionChangePositions.push({
                        x: round(currentX, 0),
                        y: round(currentY, 0),
                        time: round(now - displayStartTime, 2)
                    });
                    motionDir = 1;
                    actualCycles = actualCycles + 1;
                }

                // Update last frame position
                lastFrameX = round(currentX, 0);
                lastFrameY = round(currentY, 0);


                cx.clearRect(0, 0, w, h);
                drawFixation();

                if (String(trial.furrowMode).toLowerCase() === 'furrow') {
                    drawHalfStripes(trial.stripeAngle[0], 'left', screenCenter.x);
                    drawHalfStripes(trial.stripeAngle[1], 'right', screenCenter.x);
                    drawObjFilled(currentX, currentY, trial.objWidth, trial.objHeight);
                } else {
                    drawObjPeephole(currentX, currentY, trial.objWidth, trial.objHeight);
                }
                drawFixation();
                requestAnimationFrame(render);
            } else {
                directionChangePositions.push({
                    x: lastFrameX,
                    y: lastFrameY,
                    time: round(now - displayStartTime, 2)
                });
                endTrial();
            }
        }


        /*
        ============================
        END TRIAL
        ============================
        */
        function endTrial() {

            //calculate total trajectory px & actualized speed
            totalTrajectoryPx = 0;
            for (let i = 1; i < framePositions.length; i++) {
                const yDiff = Math.abs(round(framePositions[i].y, 2) - round(framePositions[i - 1].y, 2));
                totalTrajectoryPx += yDiff;
            }
            actualSpeed = totalTrajectoryPx / ((performance.now() - displayStartTime) / 1000);
            var trial_data = {
                furrowMode: trial.furrowMode,
                splitStripeEnabled: trial.splitStripeEnabled,
                stripeAngle: trial.stripeAngle,
                stripeWidth: trial.stripeWidth,
                bgColor: trial.bgColor,
                fixationSide: trial.fixationSide,
                fixationLocation: [fixX, fixY],
                fixationDuration: round(fixatonDuration / 1000, 2),
                objShape: trial.objShape,
                objWidth: trial.objWidth,
                objHeight: trial.objHeight,
                objColor: trial.objColor,
                objMotionRangeSet: trial.objMotionRange,
                objSpeedSet: trial.objSpeed,
                objEndPosRelativeToStart: trial.objEndPosRelativeToStart,
                objStartPosPx: [directionChangePositions[0].x, directionChangePositions[0].y],
                objEndPosPxSet: [directionChangePositions[directionChangePositions.length - 1].x, directionChangePositions[directionChangePositions.length - 1].y],
                cycleNumberSet: trial.cycleNumber,
                displayDurationSet: round(displayDuration / 1000, 2),

                // Actual measured values
                objEndPosPxActualized: [lastFrameX, lastFrameY],
                objSpeedActualized: round(actualSpeed, 2),
                cycleNumberActualized: round(actualCycles, 2),
                displayDurationActualized: round((performance.now() - displayStartTime) / 1000, 2),
                totalTrajectoryPx: round(totalTrajectoryPx, 2),

                // Frame-by-frame data
                directionChangePositions: directionChangePositions,
            };

            display_element.innerHTML = ' ';
            document.body.style.cursor = 'default';
            jsPsych.finishTrial(trial_data);
        }

        if (typeof trial.trialDuration === 'number' && trial.trialDuration > 0) {
            jsPsych.pluginAPI.setTimeout(endTrial, trial.trialDuration);
        }

        /*============================
        FUNCTIONS
        ==============================
        */

        function drawFixation() {
            cx.strokeStyle = "red";
            cx.lineWidth = 10;
            const size = 20;
            cx.beginPath();
            cx.moveTo(fixX, fixY - size);
            cx.lineTo(fixX, fixY + size);
            cx.stroke();
            cx.beginPath();
            cx.moveTo(fixX - size, fixY);
            cx.lineTo(fixX + size, fixY);
            cx.stroke();
        }

        function drawHalfStripes(angleDeg, side, splitX) {
            const angle = (angleDeg * Math.PI) / 180;
            const num = Math.ceil(canvas.width / trial.stripeWidth) * 4;

            cx.save();
            if (side === "left") {
                cx.beginPath();
                //+2 not to have a gap between the stripes and the object
                cx.rect(0, 0, splitX + 2, canvas.height);
                cx.clip();
            } else {
                cx.beginPath();
                cx.rect(splitX, 0, splitX * 2, canvas.height);
                cx.clip();
            }

            // color pattern
            const hi = Math.round(Math.max(0, Math.min(1, trial.stripeLuminance + 0.5)) * 255);
            const lo = Math.round(Math.max(0, Math.min(1, trial.stripeLuminance - 0.5)) * 255);
            const colors = [`rgb(${hi},${hi},${hi})`, `rgb(${lo},${lo},${lo})`];

            // pick reference origin roughly mid-screen
            const midX = splitX;
            const midY = canvas.height / 2;

            for (let i = -num; i < num; i++) {
                const color = colors[(i & 1)]; // alternate black/white
                cx.strokeStyle = color;
                cx.lineWidth = trial.stripeWidth;

                // define line perpendicular to normal direction at this offset
                const offset = i * trial.stripeWidth;
                const dx = Math.cos(angle + Math.PI / 2) * offset;
                const dy = Math.sin(angle + Math.PI / 2) * offset;

                cx.beginPath();
                cx.moveTo(midX - 3000 * Math.cos(angle) + dx, midY - 3000 * Math.sin(angle) + dy);
                cx.lineTo(midX + 3000 * Math.cos(angle) + dx, midY + 3000 * Math.sin(angle) + dy);
                cx.stroke();
            }

            cx.restore();
        }



        function drawObjFilled(x, y, objW, objH, color) {
            drawObjPath(x, y, objW, objH);
            cx.fillStyle = color || trial.objColor;
            cx.fill();
        }
        function drawObjPeephole(x, y, objW, objH) {
            // 1) clip to object
            cx.save();
            cx.beginPath();
            drawObjPath(x, y, objW, objH);
            cx.clip();
            drawHalfStripes(trial.stripeAngle[0], 'left', x);
            drawHalfStripes(trial.stripeAngle[1], 'right', x);


            cx.restore();
        }


        function drawObjPath(x, y, objW, objH) {
            if (String(trial.objShape).toLowerCase() === 'heart') {
                drawObjHeartPath(x, y, objW, objH);
            } else {
                const hw = objW / 2;
                const hh = objH / 2;
                cx.rect(x - hw, y - hh, objW, objH);
            }
        }

        function drawObjHeartPath(x, y, objW, objH) {
            const w2 = objW / 2;
            const h2 = objH / 2;
            const top = y - h2 * 0.3;
            cx.moveTo(x, y + h2);
            cx.bezierCurveTo(x - w2, y + h2 * 0.2, x - w2, top, x, top);
            cx.bezierCurveTo(x + w2, top, x + w2, y + h2 * 0.2, x, y + h2);
        }

        function round(value, decimals = 2) {
            return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
        }

    };

    return plugin;
})();
