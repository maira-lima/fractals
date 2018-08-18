/* L-System Fractals by Maira Zabuscha de Lima */
(function () {
document.getElementById("botao").addEventListener("click", fractal, false);

var instr = 1;
var l;
var xo = 0;
var yo = 0;
var colors = [0, 0, 0];
var bkg = 0;
var line = 0;

var n = 0;
var w = 0;
var h = 0;
var instructions = "";
var ao = 0;
var r = 0;
var ini = [];
var end = [];
var as = 0;
var system = 0;

document.getElementById("msg").innerHTML = "";
document.getElementById("msg").style.display = "none";

function fractal () {
    var i;
    n = parseInt(document.getElementById('level').value);
    w = parseInt(document.getElementById('size').value);
    if (w < 100) w = 100;
    h = w;
    var canvas = document.getElementById('mycanvas');
    canvas.width = 1;
    canvas.height = 1;
    bkg = document.getElementById('bkg').selectedIndex;
    line = document.getElementById('line').selectedIndex;
    system = document.getElementById('system').selectedIndex;
    document.getElementById("msg").innerHTML = "";
    document.getElementById("msg").style.display = "none";
    getsystem();
}

function getsystem () {
    if (document.getElementById('system')[system].value == "Dragon Curve") {
        instructions = "FX";
        ao = 90;
        r = 2;
        ini = ["X", "Y"];
        end = ["X-YF-", "+FX+Y"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Gosper Curve") {
        instructions = "F";
        ao = 0;
        r = 2;
        ini = ["F", "G"];
        end = ["F-G--G+F++FF+G-", "+F-GG--G-F++F+G"];
        as = 60;
    }
    else if (document.getElementById('system')[system].value == "Dekkings Church") {
        instructions = "WXYZ";
        ao = 0;
        r = 5;
        ini = ["F", "W", "Z", "Y", "X"];
        end = ["A", "FW+F-ZFW-F+X", "++F--Y-F+X++F--Y-F+X", "++F--Y+F-Z", "FW+F-Z"];
        as = 90;
        //if (n > 0 && n % 2 == 0) n--;
    }
    else if (document.getElementById('system')[system].value == "Cesaro Curve") {
        instructions = "F";
        ao = 0;
        r = 1;
        ini = ["F"];
        end = ["F+F--F+F"];
        as = 85;
    }
    else if (document.getElementById('system')[system].value == "Plant") {
        instructions = "X";
        ao = 60;
        r = 2;
        ini = ["X", "F"];
        end = ["F+[[X]-X]-F[-FX]+X", "FF"];
        as = 25;
    }
    else if (document.getElementById('system')[system].value == "Hilbert Curve") {
        instructions = "X";
        ao = 90;
        r = 2;
        ini = ["X", "Y"];
        end = ["+YF-XFX-FY+", "-XF+YFY+FX-"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Koch Curve") {
        instructions = "F--F--F";
        ao = 0;
        r = 1;
        ini = ["F"];
        end = ["F+F--F+F"];
        as = 60;
    }
    else if (document.getElementById('system')[system].value == "Moore Curve") {
        instructions = "XFX+F+XFX";
        ao = 90;
        r = 2;
        ini = ["X", "Y"];
        end = ["-YF+XFX+FY-", "+XF-YFY-FX+"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Pentigree") {
        instructions = "F";
        ao = 60;
        r = 1;
        ini = ["F"];
        end = ["+F++F----F--F++F++F-"];
        as = 36;
    }
    else if (document.getElementById('system')[system].value == "Pythagoras Tree") {
        instructions = "F";
        ao = 90;
        r = 2;
        ini = ["G", "F"];
        end = ["GG", "G[+F]-F"];
        as = 45;
    }
    else if (document.getElementById('system')[system].value == "Quadratic Gosper Curve") {
        instructions = "-F";
        ao = 90;
        r = 2;
        ini = ["G", "F"];
        end = ["GG-F-F+G+G-F-FG+F+GGF-G+F+GG+F-GF-F-G+G+FF-", "+GG-F-F+G+GF+G-FF-G-F+GFF-G-FG+G+F-F-G+G+FF"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Quadratic Koch Curve") {
        instructions = "F";
        ao = 0;
        r = 1;
        ini = ["F"];
        end = ["F+F-F-F+F"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Quadratic Koch Island") {
        instructions = "F-F-F-F";
        ao = 0;
        r = 1;
        ini = ["F"];
        end = ["F+FF-FF-F-F+F+FF-F-F+F+FF+FF-F"];
        as = 90;
    }
    else if (document.getElementById('system')[system].value == "Sierpinski Triangle") {
        instructions = "F-G-G";
        ao = 60;
        r = 2;
        ini = ["G", "F"];
        end = ["GG", "F-G+F+G-F"];
        as = 120;
    }
    else if (document.getElementById('system')[system].value == "Sierpinski Triangle V2") {
        instructions = "F";
        ao = 0;
        r = 2;
        ini = ["G", "F"];
        end = ["-F+G+F-", "+G-F-G+"];
        as = 60;
    }
    else if (document.getElementById('system')[system].value == "XBorder") {
        instructions = "XYXYXYX+XYXYXYX+XYXYXYX+XYXYXYX";
        ao = 0;
        r = 3;
        ini = ["F", "X", "Y"];
        end = ["A", "FX+FX+FXFY-FY-", "+FX+FXFY-FY-FY"];
        as = 90;
    }
    
    resultado ();
}

function resultado () {
    var i, j, k, c, d, t, rep, stop, MEM;
    MEM = 10240000;
    stop = 0;
    instr = instructions.length;
    var writing = "";
    for (i = 0; i < n && !stop; i++) {
        c = 0;
        d = instructions.length;
        writing = "";
        for (j = 0; j < d && c < MEM-1; j++) {
            rep = 0;
            for (k = 0; !rep && k < r && c < MEM-1; k++) {
                if (instructions.charAt(j) == ini[k].charAt(0)) {
                    t = end[k].length;
                    writing = writing.concat(end[k]);
                    c += t;
                    rep = 1;
                }
            }
            if (!rep) {
                writing = writing.concat(instructions.charAt(j));
                c++;
            }
            if (c >= MEM-1) {
                document.getElementById("msg").innerHTML = "Nivel maximo atingido: " + i;
                document.getElementById("msg").style.display = "inline-block";
                n = i;
                stop = 1;
            }
        }
        if (!stop) {
            instructions = writing;
            writing = "";
            instr = c;
        }
    }
    
    dimensoes();
}

function dimensoes() {
    var i, j, k, c, a, an, f1, f2, f, x, y, x_max, x_min, y_max, y_min, atual;
    var PI = 3.14159265;
    l = 100;
    var bkpx = [];
    var bkpy = [];
    var bkpa = [];
    for (k = 0; l > 1 && k < 2; k++) {
        a = ao, c = 0, x = 0, y = 0, x_max = 0, x_min = 0, y_max = 0, y_min = 0;
        for (i = 0; i < instr; i++) {
            an = a/180*PI;
            atual = instructions.charAt(i);
            if (atual == 'F' || atual == 'G') {
                x = x + l*(Math.cos(an));
                y = y + l*(Math.sin(an));
                if (x < x_min) x_min = x;
                if (x > x_max) x_max = x;
                if (y < y_min) y_min = y;
                if (y > y_max) y_max = y;
            }
            else if (atual == '+') {
                a += as;
                if (a > 360) a -= 360;
            }
            else if (atual == '-') {
                a -= as;
                if (a < 0) a += 360;
            }
            else if (atual == '[') {
                bkpx[c] = x;
                bkpy[c] = y;
                bkpa[c] = a;
                c++;
            }
            else if (atual == ']') {
                c--;
                x = bkpx[c];
                y = bkpy[c];
                a = bkpa[c];
            }
        }
        if (k == 0) {
            f1 = (w-40)/(x_max - x_min);
            f2 = (w-40)/(y_max - y_min);
            if (f1 > f2) f = f2;
            else f = f1;
            l = Math.floor(l*f);
        }
    }
    if (l < 2) {
        instructions = "";
        if (n > 0) {
            n--;
            document.getElementById("msg").style.display = "inline-block";
            document.getElementById("msg").innerHTML = "Nivel maximo atingido: " + n;
            getsystem();
        }
        else  {
            document.getElementById("msg").style.display = "inline-block";
            document.getElementById("msg").innerHTML = "Nao foi possivel fazer o desenho pois os segmentos tem tamanho menor que 1 pixel.";
        }
    }
    else {
        xo = Math.floor(20 - x_min);
        yo = Math.floor(20 - y_min);
        w = Math.floor(x_max - x_min + 40);
        h = Math.floor(y_max - y_min + 40);
        
        desenhar();
    }
}

function color(i) {
    i = i % 1530;
    if (i < 256) {
        colors[0] = 255;
        colors[1] = i;
        colors[2] = 0;
    }
    else if (i < 511) {
        colors[0] = 510 - i;
        colors[1] = 255;
        colors[2] = 0;
    }
    else if (i < 766) {
        colors[0] = 0;
        colors[1] = 255;
        colors[2] = i - 510;
    }
    else if (i < 1021) {
        colors[0] = 0;
        colors[1] = 1020 - i;
        colors[2] = 255;
    }
    else if (i < 1276) {
        colors[0] = i - 1020;
        colors[1] = 0;
        colors[2] = 255;
    }
    else if (i < 1531) {
        colors[0] = 255;
        colors[1] = 0;
        colors[2] = 1530 - i;
    }
}

function desenhar() {
    var i, a, c, p, color_ct, an, x, y, xi, yi, atual;
    var PI = 3.14159265;
    var bkpx = [];
    var bkpy = [];
    var bkpa = [];
    //var bkpc = [];
    if (l > 1) {
        a = ao;
        x = xo;
        y = yo;
        c = 0;
        t = 0;
        color_ct = 0;
        var canvas = document.getElementById('mycanvas');
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;
            if (bkg == 0) ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            else if (bkg == 1) ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            else if (bkg == 2) ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillRect(0,0,w,h);
            for (i = 0; i < instr; i++) {
                an = a/180*PI;
                atual = instructions.charAt(i);
                if (atual == 'F' || atual == 'G') {
                    xi = x, yi = y;
                    if (line == 0) {
                        color(color_ct);
                        ctx.strokeStyle = 'rgb('+colors[0]+','+colors[1]+','+colors[2]+')';
                    }
                    else if (line == 1) {
                        if (bkg == 2) ctx.strokeStyle = 'rgb(0, 0, 0)';
                        else ctx.strokeStyle = 'rgb(255, 255, 255)';
                    }
                    else  if (line == 2){
                        if (bkg == 1) ctx.strokeStyle = 'rgb(255, 255, 255)';
                        else ctx.strokeStyle = 'rgb(0, 0, 0)';
                    }
                    x = xi + l*(Math.cos(an));
                    y = yi + l*(Math.sin(an));
                    ctx.beginPath();
                    ctx.moveTo(Math.floor(xi)+0.5,h-Math.round(yi)+0.5);
                    ctx.lineTo(Math.floor(x)+0.5,h-Math.round(y)+0.5);
                    ctx.stroke();
                    color_ct++;
                }
                else if (atual == '+') {
                    a += as;
                    if (a > 360) a -= 360;
                }
                else if (atual == '-') {
                    a -= as;
                    if (a < 0) a += 360;
                }
                else if (atual == '[') {
                    bkpx[c] = x;
                    bkpy[c] = y;
                    bkpa[c] = a;
                    //bkpc[c] = color_ct;
                    c++;
                }
                else if (atual == ']') {
                    c--;
                    x = bkpx[c];
                    y = bkpy[c];
                    a = bkpa[c];
                    //color_ct = bkpc[c];
                }
            }
            instructions = "";
        }
        else {
            document.getElementById("msg").style.display = "inline-block";
            document.getElementById("msg").innerHTML = "Canvas não detectado.";
        }
    }
    else {
        document.getElementById("msg").style.display = "inline-block";
        document.getElementById("msg").innerHTML = "Nao foi possivel fazer o desenho pois os segmentos tem tamanho menor que 1 pixel.";
    }
}
}());