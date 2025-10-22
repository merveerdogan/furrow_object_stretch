// Size Reproduction Task - Horizontal Line Resizing Plugin
// Allows adjusting a horizontal line's length via keys, mouse wheel, or drag

jsPsych.plugins["sizeReproductionTask"] = (function () {
    var plugin = {};

    plugin.info = {
        name: "sizeReproductionTask",
        parameters: {
            // Control mode: 'keys' | 'wheel' | 'drag'
            controlMode: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'keys',
                pretty_name: 'Control mode',
                description: "Which input controls resizing: 'keys', 'wheel', or 'drag'"
            },
            // Key bindings (only used in keys mode)
            keyIncrease: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'ArrowUp',
                pretty_name: 'Increase key',
                description: 'Keyboard key to increase length'
            },
            keyDecrease: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'ArrowDown',
                pretty_name: 'Decrease key',
                description: 'Keyboard key to decrease length'
            },
            keyFinish: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'Enter',
                pretty_name: 'Finish key',
                description: 'Keyboard key to finish/confirm the response'
            },
            // Steps/sensitivity
            keyStep: {
                type: jsPsych.plugins.parameterType.INT,
                default: 2,
                pretty_name: 'Key step (px)',
                description: 'Length change per key press (px)'
            },
            wheelStep: {
                type: jsPsych.plugins.parameterType.INT,
                default: 10,
                pretty_name: 'Wheel step (px)',
                description: 'Length change per wheel notch (px)'
            },
            dragScale: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 1.0,
                pretty_name: 'Drag scale',
                description: 'Multiplier: px of mouse drag -> px of length change'
            },

            // Line appearance and constraints
            initialObjLength: {
                type: jsPsych.plugins.parameterType.INT,
                default: 200,
                pretty_name: 'Initial length (px)',
                description: 'Starting horizontal line length (px)'
            },
            minObjLength: {
                type: jsPsych.plugins.parameterType.INT,
                default: 20,
                pretty_name: 'Min length (px)',
                description: 'Lower bound for line length (px)'
            },
            maxObjLength: {
                type: jsPsych.plugins.parameterType.INT,
                default: 1200,
                pretty_name: 'Max length (px)',
                description: 'Upper bound for line length (px)'
            },
            objHeight: {
                type: jsPsych.plugins.parameterType.INT,
                default: 10,
                pretty_name: 'Height (px)',
                description: 'Height of the line (px)'
            },
            objColor: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'black',
                pretty_name: 'Obj color',
                description: 'CSS color of the line'
            },

            // Background
            bgColor: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'grey',
                pretty_name: 'Background color',
                description: 'CSS color of the background'
            },

            // Position (center by default); if array [x, y] provided, use it
            position: {
                type: jsPsych.plugins.parameterType.ARRAY,
                default: [0, 0],
                pretty_name: 'Obj center position (x, y)',
                description: 'Object center position (x, y)'
            },

            // Optional fixed trial duration; otherwise finish with keyFinish
            trialDuration: {
                type: jsPsych.plugins.parameterType.INT,
                default: null,
                pretty_name: 'Trial duration (ms)',
                description: 'If set, ends the trial after this many ms'
            },
            // Allow ending trial with Enter key
            allowEarlyEnd: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: false,
                pretty_name: 'Allow early end',
                description: 'If true, allows ending trial early with Enter key'
            },
            // Instruction text at the top of the screen
            instructionText: {
                type: jsPsych.plugins.parameterType.STRING,
                default: '',
                pretty_name: 'Instruction text',
                description: 'Instruction text to display at the top of the screen'
            }
        }
    };

    plugin.trial = function (display_element, trial) {
        // Create canvas and instruction text overlay
        var html = '<div id="srtContainer" style="position: relative; width: 100vw; height: 100vh;">';
        if (trial.instructionText) {
            html += '<div id="srtInstructionText" style="position: absolute; top: 30px; left: 0; width: 100%; z-index: 10; text-align: center; color: white; font-size: 24px; padding: 0 20px; box-sizing: border-box;">' + trial.instructionText + '</div>';
        }
        html += '<canvas id="srtCanvas" style="display:block; position: absolute; top: 0; left: 0;"></canvas>';
        html += '</div>';
        display_element.innerHTML = html;

        var canvas = document.getElementById('srtCanvas');
        var cx = canvas.getContext('2d');

        var w = window.innerWidth;
        var h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;


        // State
        var currentLength = trial.initialObjLength;
        var startTime = performance.now();
        var hasEnded = false;

        // Metrics
        var keyIncrements = 0;
        var keyDecrements = 0;
        var wheelIncrements = 0;
        var wheelDecrements = 0;
        var dragTotalDx = 0; // signed px moved while dragging

        // Drag handling
        var dragging = false;
        var lastDragX = 0;

        // Start rendering
        render();
        function render() {
            if (hasEnded) return;
            cx.clearRect(0, 0, w, h);
            //drawBackground();
            drawLine(trial.position[0], trial.position[1], currentLength, trial.objHeight, trial.objColor);
            requestAnimationFrame(render);
        }

        // Attach listeners per mode
        if (trial.controlMode === 'keys') {
            window.addEventListener('keydown', onKeyDown);
        } else if (trial.controlMode === 'wheel') {
            canvas.addEventListener('wheel', onWheel, { passive: false });
        } else if (trial.controlMode === 'drag') {
            canvas.addEventListener('mousedown', onMouseDown);
            canvas.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            canvas.addEventListener('mouseleave', onMouseLeave);
        }

        // Always attach keyboard listener if early end is enabled
        if (trial.allowEarlyEnd) {
            window.addEventListener('keydown', onKeyDown);
        }

        // Optional timed end
        if (typeof trial.trialDuration === 'number' && trial.trialDuration > 0) {
            jsPsych.pluginAPI.setTimeout(end_trial, trial.trialDuration);
        }

        function end_trial() {
            if (hasEnded) return;
            hasEnded = true;

            // Remove listeners
            window.removeEventListener('keydown', onKeyDown);
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseleave', onMouseLeave);

            var endTime = performance.now();
            //check if final length, initial length + inputs are consistent
            if (trial.controlMode === 'keys') {
                expectedLength = trial.initialObjLength + (keyIncrements - keyDecrements) * trial.keyStep;
            } else if (trial.controlMode === 'wheel') {
                expectedLength = trial.initialObjLength + (wheelIncrements - wheelDecrements) * trial.wheelStep;
            } else if (trial.controlMode === 'drag') {
                expectedLength = trial.initialObjLength + dragTotalDx;
            }

            var trial_data = {
                // Inputs and configuration
                testControlMode: trial.controlMode,
                testObjectInitialLength: trial.initialObjLength,
                testObjectFinalLength: currentLength,
                testObjectCalculatedLength: expectedLength, //this is to check if the length + inputs are consistent
                testResponseDuration: round((endTime - startTime) / 1000, 2),
                testObjectHeight: trial.objHeight,
                testObjectPosition: Array.isArray(trial.position) ? trial.position.slice(0, 2) : null,
                testObjectColor: trial.objColor,
                testObjectBackgroundColor: trial.bgColor,
            };

            // Add data based on control mode
            if (trial.controlMode === 'keys') {
                trial_data.testKeys = [trial.keyIncrease, trial.keyDecrease];
                trial_data.testKeyStepPx = trial.keyStep;
                trial_data.testKeyIncrementsDecrementsPx = [keyIncrements, keyDecrements];
            } else if (trial.controlMode === 'wheel') {
                trial_data.testWheelIncrementsPx = wheelIncrements;
                trial_data.testWheelDecrementsPx = wheelDecrements;
                trial_data.testWheelStepPx = trial.wheelStep;
            } else if (trial.controlMode === 'drag') {
                trial_data.testDragScalePx = trial.dragScale;
                trial_data.testDragTotalDxPx = dragTotalDx;
            }

            display_element.innerHTML = '';
            jsPsych.finishTrial(trial_data);
        }


        // ===============================================================
        // INPUT HANDLERS
        // ===============================================================
        // Input handlers based on controlMode
        function onKeyDown(e) {
            if (hasEnded) return;
            if (e.key === trial.keyIncrease) {
                currentLength = currentLength + trial.keyStep;
                keyIncrements += 1;
                e.preventDefault();
            } else if (e.key === trial.keyDecrease) {
                currentLength = currentLength - trial.keyStep;
                keyDecrements += 1;
                e.preventDefault();
            } else if (e.key === trial.keyFinish) {
                e.preventDefault();
                end_trial();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                end_trial();
            }
        }

        function onWheel(e) {
            if (hasEnded) return;
            // Negative deltaY => wheel up => increase
            var delta = e.deltaY;
            if (delta < 0) {
                currentLength = currentLength + trial.wheelStep;
                wheelIncrements += 1;
            } else if (delta > 0) {
                currentLength = currentLength - trial.wheelStep;
                wheelDecrements += 1;
            }
            e.preventDefault();
        }

        function onMouseDown(e) {
            if (hasEnded) return;
            dragging = true;
            lastDragX = e.clientX;
        }
        function onMouseMove(e) {
            if (hasEnded || !dragging) return;
            var dx = (e.clientX - lastDragX) * (trial.dragScale || 1);
            lastDragX = e.clientX;
            dragTotalDx += dx;
            if (dx !== 0) {
                currentLength = currentLength + dx;
            }
        }
        function onMouseUp() {
            dragging = false;
        }
        function onMouseLeave() {
            dragging = false;
        }

        // ===============================================================
        // ADDITIONAL FUNCTIONS
        // ===============================================================
        function drawLine(centerX, centerY, len, thickness, color) {
            var half = len / 2;
            cx.save();
            cx.beginPath();
            cx.moveTo(centerX - half, centerY);
            cx.lineTo(centerX + half, centerY);
            cx.strokeStyle = color;
            cx.lineWidth = Math.max(1, thickness);
            cx.lineCap = 'butt';
            cx.stroke();
            cx.restore();
        }

        function round(value, decimals) {
            return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
        }


    };

    return plugin;
})();


