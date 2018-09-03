/* L-System Fractals by Maira Zabuscha de Lima */
(function () {
document.getElementById("generate").addEventListener("click", generate, false);

function expand(system, level) {
    var i, j, segments, instructions;
    system.instructions.push(system.seed);
    if (level < 0) level = 0;
    system.level = 0;
    for (i = 1; i <= level; i++) {
        instructions = "";
        segments = 0;
        for (j = 0; j < system.instructions[i-1].length; j++) {
            if (system.instructions[i-1].charAt(j) in system.rules) {
                instructions = instructions.concat(system.rules[system.instructions[i-1].charAt(j)]);
            }
            else {
                instructions = instructions.concat(system.instructions[i-1].charAt(j));
            }
        }
        for (j = 0; j < instructions.length; j++) {
            if (instructions.charAt(j) == 'F' || instructions.charAt(j) == 'G') {
                segments += 1;
            }
        }
        system.level = i;
        system.instructions.push(instructions);
        if (segments > 2097152) {
            break;
        }
    }
}

function dimensions(system, size) {
    var i, j, a, f1, f2, f, x, y, x_max, x_min, y_max, y_min, charac;
    var bkpx = [];
    var bkpy = [];
    var bkpa = [];
    if (system.level < 0) system.level = 0;
    system.segment_length = 100;
    system.width = 0
    system.height = 0
    system.x_ini = 0
    system.y_ini = 0
    for (i = 0; system.segment_length > 1 && i < 2; i++) {
        x_max = 0;
        x_min = 0;
        y_max = 0;
        y_min = 0;
        x = 0;
        y = 0;
        bkpx = [];
        bkpy = [];
        bkpa = [];
        a = system.direction;
        for (j = 0; j < system.instructions[system.level].length; j++) {
            charac = system.instructions[system.level].charAt(j);
            if (charac == 'F' || charac == 'G') {
                x += system.segment_length*(Math.cos(a/180*Math.PI));
                y += system.segment_length*(Math.sin(a/180*Math.PI));
                if (x < x_min) x_min = x;
                if (x > x_max) x_max = x;
                if (y < y_min) y_min = y;
                if (y > y_max) y_max = y;
            }
            else if (charac == '+') {
                a += system.angle;
                if (a > 360) a -= 360;
            }
            else if (charac == '-') {
                a -= system.angle;
                if (a < 0) a += 360;
            }
            else if (charac == '[') {
                bkpx.push(x);
                bkpy.push(y);
                bkpa.push(a);
            }
            else if (charac == ']') {
                x = bkpx.pop();
                y = bkpy.pop();
                a = bkpa.pop();
            }
        }
        if (i == 0) {
            f1 = (size-40)/(x_max - x_min);
            f2 = (size-40)/(y_max - y_min);
            f = f1 > f2 ? f2 : f1;
            system.segment_length = Math.floor(system.segment_length*f);
        }
    }
    if (system.segment_length < 2) {
        if (system.level > 0) {
            system.level -= 1;
            dimensions(system, size);
        }
    }
    else {
        system.x_ini = Math.floor(20 - x_min);
        system.y_ini = Math.floor(20 - y_min);
        system.width = Math.floor(x_max - x_min + 40);
        system.height = Math.floor(y_max - y_min + 40);
    }
}

function color(i, line) {
    i = i % 1530;
    var colors = 'rgb(0, 0, 0)';
    if (line == 0) {
        if (i < 256) {
            colors = 'rgb(255, '+i+', 0)';
        }
        else if (i < 511) {
            i = 510 - i;
            colors = 'rgb('+i+', 255, 0)';
        }
        else if (i < 766) {
            i = i - 510;
            colors = 'rgb(0, 255, '+i+')';
        }
        else if (i < 1021) {
            i = 1020 - i;
            colors = 'rgb(0, '+i+', 255)';
        }
        else if (i < 1276) {
            i = i - 1020;
            colors = 'rgb('+i+', 0, 255)';
        }
        else if (i < 1531) {
            i = 1530 - i;
            colors = 'rgb(255, 0, '+i+')';
        }
    }
    else if (line == 1) {
        colors = 'rgb(255, 255, 255)';
    }
    return colors;
}

function draw(bkg, line, system, canvas) {
    var i, a, color_ct, x, y, xi, yi, charac;
    var bkpx = [];
    var bkpy = [];
    var bkpa = [];
    if (system.segment_length > 1) {
        a = system.direction;
        x = system.x_ini;
        y = system.y_ini;
        color_ct = 0;
        var ctx = canvas.getContext('2d');
        canvas.width = system.width;
        canvas.height = system.height;
        if (bkg == 0) ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        else if (bkg == 1) ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        else if (bkg == 2) ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(0,0,system.width,system.height);
        for (i = 0; i < system.instructions[system.level].length; i++) {
            charac = system.instructions[system.level].charAt(i);
            if (charac == 'F' || charac == 'G') {
                ctx.strokeStyle = color(color_ct, line);
                color_ct += 1;
                xi = x;
                yi = y;
                x += system.segment_length*Math.cos(a/180*Math.PI);
                y += system.segment_length*Math.sin(a/180*Math.PI);
                ctx.beginPath();
                ctx.moveTo(Math.floor(xi)+0.5,system.height-Math.round(yi)+0.5);
                ctx.lineTo(Math.floor(x)+0.5,system.height-Math.round(y)+0.5);
                ctx.stroke();
            }
            else if (charac == '+') {
                a += system.angle;
                if (a > 360) a -= 360;
            }
            else if (charac == '-') {
                a -= system.angle;
                if (a < 0) a += 360;
            }
            else if (charac == '[') {
                bkpx.push(x);
                bkpy.push(y);
                bkpa.push(a);
            }
            else if (charac == ']') {
                x = bkpx.pop();
                y = bkpy.pop();
                a = bkpa.pop();
            }
        }
    }
}

function generate() {
    var msg = document.getElementById("msg");
    var level = document.getElementById('level');
    var size = document.getElementById('size');
    var bkg = document.getElementById('bkg').selectedIndex;
    var line = document.getElementById('line').selectedIndex;
    var system = document.getElementById('system').selectedIndex;
    var canvas = document.getElementById('canvas');
    msg.innerHTML = "";
    msg.style.display = "none";
    lsystems = [
    {
        name: 'Dragon Curve',
        seed: 'FX',
        direction: 90,
        angle: 90,
        rules: {'X':'X-YF-', 'Y':'+FX+Y'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Gosper Curve',
        seed: 'F',
        direction: 0,
        angle: 60,
        rules: {'F':'F-G--G+F++FF+G-', 'G':'+F-GG--G-F++F+G'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Dekkings Church',
        seed: 'WXYZ',
        direction: 0,
        angle: 90,
        rules: {'F':'A', 'W':'FW+F-ZFW-F+X', 'Z':'++F--Y-F+X++F--Y-F+X', 'Y':'++F--Y+F-Z', 'X':'FW+F-Z'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Cesaro Curve',
        seed: 'F',
        direction: 0,
        angle: 85,
        rules: {'F':'F+F--F+F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Plant',
        seed: 'X',
        direction: 60,
        angle: 25,
        rules: {'X':'F+[[X]-X]-F[-FX]+X', 'F':'FF'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Hilbert Curve',
        seed: 'X',
        direction: 90,
        angle: 90,
        rules: {'X':'+YF-XFX-FY+', 'Y':'-XF+YFY+FX-'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Koch Curve',
        seed: 'F--F--F',
        direction: 300,
        angle: 60,
        rules: {'F':'F+F--F+F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Moore Curve',
        seed: 'XFX+F+XFX',
        direction: 90,
        angle: 90,
        rules: {'X':'-YF+XFX+FY-', 'Y':'+XF-YFY-FX+'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Pentigree',
        seed: 'F',
        direction: 60,
        angle: 36,
        rules: {'F':'+F++F----F--F++F++F-'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Pythagoras Tree',
        seed: 'F',
        direction: 90,
        angle: 45,
        rules: {'G':'GG', 'F':'G[+F]-F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Quadratic Gosper Curve',
        seed: '-F',
        direction: 90,
        angle: 90,
        rules: {'G':'GG-F-F+G+G-F-FG+F+GGF-G+F+GG+F-GF-F-G+G+FF-', 'F':'+GG-F-F+G+GF+G-FF-G-F+GFF-G-FG+G+F-F-G+G+FF'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Quadratic Koch Curve',
        seed: 'F',
        direction: 0,
        angle: 90,
        rules: {'F':'F+F-F-F+F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Quadratic Koch Island',
        seed: 'F-F-F-F',
        direction: 0,
        angle: 90,
        rules: {'F':'F+FF-FF-F-F+F+FF-F-F+F+FF+FF-F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Sierpinski Triangle',
        seed: 'F-G-G',
        direction: 60,
        angle: 120,
        rules: {'G':'GG', 'F':'F-G+F+G-F'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'Sierpinski Triangle V2',
        seed: 'F',
        direction: 0,
        angle: 60,
        rules: {'G':'-F+G+F-', 'F':'+G-F-G+'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    },
    {
        name: 'XBorder',
        seed: 'XYXYXYX+XYXYXYX+XYXYXYX+XYXYXYX',
        direction: 0,
        angle: 90,
        rules: {'F':'A', 'X':'FX+FX+FXFY-FY-', 'Y':'+FX+FXFY-FY-FY'},
        level : 0, instructions : [], width : 0, height : 0, x_ini : 0, y_ini : 0, segment_length : 0
    }];
    if (canvas.getContext) {
        canvas.width = 1;
        canvas.height = 1;
        var l = parseInt(level.value);
        if (isNaN(l) || l < 0) l = 0;
        expand(lsystems[system], l);
        var s = parseInt(size.value);
        if (isNaN(s) || s < 120) s = 120;
        else if (s > 4096) s = 4096;
        size.value = s.toString();
        dimensions(lsystems[system], s);
        level.value = lsystems[system].level.toString();
        if (lsystems[system].segment_length > 1) {
            draw(bkg, line, lsystems[system], canvas);
        }
        else {
            msg.innerHTML = 'Error: segment length less than 2 pixels, try a smaller level or a bigger size.';
            msg.style.display = "inline-block";
        }
    }
    else {
        msg.innerHTML = 'Canvas error.';
        msg.style.display = "inline-block";
    }
}

}());
