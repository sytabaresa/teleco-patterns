export var patters = [
    {
        name: "antenna",
        desc: "una sola antena",
        f: "Eo",
        Eo: 1,
        rho: 0
    },
    {
        name: "antenna2",
        desc: "2 antenas distancia d",
        f: "Eo*cos(pi/2*sin(p)*cos(t-rho))",
        Eo: 1,
        rho: 0
    },
    {
        name: "triang",
        desc: "triangulo equilatero distancia d",
        f: "Eo*(exp(-1i*pi/sqrt(3)*sin(p)*cos(pi/6 -t)) + exp(1i*pi/sqrt(3)*sin(p)*cos(pi/6+t)) + exp(1i*pi/sqrt(3)*sin(p)*cos(pi/2-t)))",
        Eo: 1,
        rho: 0
    },
    {
        name: "triang",
        desc: "triangulo equilatero con desfaces",
        f: "Eo*(exp(-1i*pi/sqrt(3)*sin(p)*cos(pi/6 -t)) + exp(1i*(pi/sqrt(3)*sin(p)*cos(pi/6+t)+rho)) + exp(1i*(pi/sqrt(3)*sin(p)*cos(pi/2-t)+2*rho)))",
        Eo: 1,
        rho: Math.PI/3
    },
    {
        name: "cuadrado",
        desc: "cuadrado distancia d",
        f: "Eo*(exp(-1i*pi/sqrt(2)*sin(p)*cos(pi/4 + t)) +   exp(1i*pi/sqrt(2)*sin(p)*cos(pi/4 + t)) + exp(-1i*pi/sqrt(2)*sin(p)*cos(pi/4 - t)) + exp(1i*pi/sqrt(2)*sin(p)*cos(pi/4 - t)))",
        Eo: 1,
        rho: 0
    },
    {
        name: "bionomial",
        desc: "arreglo binomial",
        f: "Eo*2^n*sin(p)*cos(t)^n",
        Eo: 1,
        rho: 0
    }
];

export var antennas = [
    {
        name: "iso",
        desc: "isotrópica",
        ff: "1"
    },
    {
        name: "dipoloCorto",
        desc: "dipolo corto",
        ff: "sin(p)"
    },
    {
        name: "dipolol2",
        desc: "dipolo l/2",
        ff: "cos(pi/2*cos(p))/sin(p)"
    },
    {
        name: "dipolol",
        desc: "dipolo l",
        ff: "(cos(pi*cos(p)) +1)/sin(p)"
    },
    {
        name: "dipolo3l2",
        desc: "dipolo 3l/2",
        ff: "cos(3*pi/2*cos(p))/sin(p)"
    },
    {
        name: "dipolo2l",
        desc: "dipolo 2l",
        ff: "(cos(2*pi*cos(p)) -1)/sin(p)"
    },
    {
        name: "dipolog",
        desc: "dipolo general",
        ff: "(cos(pi*l*cos(p)) - cos(pi*l))/sin(p)"
    }
]