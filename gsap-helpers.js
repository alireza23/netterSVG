// helper function for building an easing function
window.gsapEasingFunction = function(easeFunc, easeCurve, options=[]) {
    easeFunc  = easeFunc.trim();
    easeCurve = easeCurve.trim();
    switch (easeFunc) {
        case "Power0":
            return Power0.easeNone;
        case "SlowMo":
            return SlowMo.ease.config(...options);
        case "SteppedEase":
            return SteppedEase.config(...options);
        default:
            return eval(`${easeFunc}.${easeCurve}`)||Power0.easeNone;
    }
};
